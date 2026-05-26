import { useState, useEffect } from "react";
import { Tags, PackagePlus } from "lucide-react";
import useAppStore from "../store/useAppStore";
import styles from "./Catalog.module.css";

interface Category {
  id: number;
  name: string;
}

interface MessageState {
  type: "success" | "error" | "";
  text: string;
}

// Ensure the component accepts the refresh prop
interface CatalogProps {
  onProductAdded: () => void;
}

export default function Catalog({ onProductAdded }: CatalogProps) {
  const { user } = useAppStore();
  const [categories, setCategories] = useState<Category[]>([]);

  // Category State
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [categoryMsg, setCategoryMsg] = useState<MessageState>({
    type: "",
    text: "",
  });

  // Product State (Allows strings so backspacing works!)
  const [productData, setProductData] = useState({
    name: "",
    categoryId: "",
    stockAmount: 0 as number | string,
    minStock: 10 as number | string,
  });
  const [productMsg, setProductMsg] = useState<MessageState>({
    type: "",
    text: "",
  });

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.token) return;
      try {
        const res = await fetch("http://localhost:3000/categories", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [user?.token]);

  // Handle Category Submit
  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCategoryMsg({ type: "", text: "" });

    try {
      const res = await fetch("http://localhost:3000/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creating category");

      setCategoryMsg({
        type: "success",
        text: "Category created successfully!",
      });
      setNewCategoryName("");

      const refreshRes = await fetch("http://localhost:3000/categories", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const refreshData = await refreshRes.json();
      setCategories(refreshData);
    } catch (err) {
      if (err instanceof Error) {
        setCategoryMsg({ type: "error", text: err.message });
      } else {
        setCategoryMsg({ type: "error", text: "An unknown error occurred" });
      }
    }
  };

  // Handle Product Submit
  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProductMsg({ type: "", text: "" });

    try {
      const res = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          ...productData,
          stockAmount: Number(productData.stockAmount),
          minStock: Number(productData.minStock),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creating product");

      setProductMsg({ type: "success", text: "Product added to catalog!" });
      setProductData({
        name: "",
        categoryId: "",
        stockAmount: "",
        minStock: "",
      });

      // Trigger App.tsx to fetch the updated product list immediately
      onProductAdded();
    } catch (err) {
      if (err instanceof Error) {
        setProductMsg({ type: "error", text: err.message });
      } else {
        setProductMsg({ type: "error", text: "An unknown error occurred" });
      }
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.header}>Catalog Management</h2>
        <p className={styles.subtitle}>
          Create product categories and add new items to the warehouse database.
        </p>
      </div>

      <div className={styles.grid}>
        {/* CATEGORY CARD */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <Tags
              size={20}
              className={styles.logoIcon}
              style={{ color: "var(--accent-primary)" }}
            />
            Add New Category
          </h3>

          {categoryMsg.text && (
            <div className={`${styles.message} ${styles[categoryMsg.type]}`}>
              {categoryMsg.text}
            </div>
          )}

          <form
            onSubmit={handleCreateCategory}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div className={styles.formGroup}>
              <label className={styles.label}>Category Name</label>
              <input
                type="text"
                placeholder="e.g. Electronics, Beverages"
                className="input-field"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
            >
              Create Category
            </button>
          </form>
        </div>

        {/* PRODUCT CARD */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <PackagePlus
              size={20}
              className={styles.logoIcon}
              style={{ color: "var(--accent-primary)" }}
            />
            Add New Product
          </h3>

          {productMsg.text && (
            <div className={`${styles.message} ${styles[productMsg.type]}`}>
              {productMsg.text}
            </div>
          )}

          <form
            onSubmit={handleCreateProduct}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div className={styles.formGroup}>
              <label className={styles.label}>Product Name</label>
              <input
                type="text"
                placeholder="e.g. Samsung 27-inch Monitor"
                className="input-field"
                value={productData.name}
                onChange={(e) =>
                  setProductData({ ...productData, name: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category</label>
              <select
                className={`input-field ${styles.categorySelect}`}
                value={productData.categoryId}
                onChange={(e) =>
                  setProductData({ ...productData, categoryId: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={productData.stockAmount}
                  // Fix applied here to allow empty string backspacing
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      stockAmount:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Minimum Stock</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={productData.minStock}
                  // Fix applied here to allow empty string backspacing
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      minStock:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  title="Used for automated reordering"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
            >
              Create Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
