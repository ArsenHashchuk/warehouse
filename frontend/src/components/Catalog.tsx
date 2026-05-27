import { useState, useEffect } from "react";
import { Tags, PackagePlus, Store, Trash2 } from "lucide-react";
import useAppStore from "../store/useAppStore";
import styles from "./Catalog.module.css";

interface Category {
  id: number;
  name: string;
}
interface Product {
  id: number;
  name: string;
  autoOrder: boolean;
}
interface StoreData {
  id: number;
  name: string;
  location: string;
}
interface MessageState {
  type: "success" | "error" | "";
  text: string;
}
interface CatalogProps {
  onProductAdded: () => void;
}

export default function Catalog({ onProductAdded }: CatalogProps) {
  const { user } = useAppStore();
  const token = user?.token;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);

  // Modal States
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "categories" | "products" | "stores";
    id: number;
    name: string;
  } | null>(null);

  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [categoryMsg, setCategoryMsg] = useState<MessageState>({
    type: "",
    text: "",
  });

  const [storeData, setStoreData] = useState({ name: "", location: "" });
  const [storeMsg, setStoreMsg] = useState<MessageState>({
    type: "",
    text: "",
  });

  const [productData, setProductData] = useState({
    name: "",
    categoryId: "",
    stockAmount: 0 as number | string,
    minStock: 10 as number | string,
    autoOrder: false,
  });
  const [productMsg, setProductMsg] = useState<MessageState>({
    type: "",
    text: "",
  });

  const fetchData = async (authToken: string) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };
    try {
      const [catRes, prodRes, storeRes] = await Promise.all([
        fetch("http://localhost:3000/categories", { headers }),
        fetch("http://localhost:3000/products", { headers }),
        fetch("http://localhost:3000/stores", { headers }),
      ]);
      setCategories(await catRes.json());
      setProducts(await prodRes.json());
      setStores(await storeRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    void (async () => {
      await fetchData(token);
    })();
  }, [token]);

  const refresh = () => {
    if (token) fetchData(token);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(
        `http://localhost:3000/${deleteTarget.type}/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setDeleteTarget(null);
      refresh();
      if (deleteTarget.type === "products") onProductAdded();

      setAlertModal({
        title: "Deleted Successfully",
        message: data.message,
        type: "success",
      });
    } catch (err) {
      setDeleteTarget(null);
      setAlertModal({
        title: "Action Failed",
        message: err instanceof Error ? err.message : "Error deleting item",
        type: "error",
      });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCategoryMsg({ type: "", text: "" });
    try {
      const res = await fetch("http://localhost:3000/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      refresh();
    } catch (err) {
      setCategoryMsg({
        type: "error",
        text: err instanceof Error ? err.message : "An unknown error occurred",
      });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProductMsg({ type: "", text: "" });
    try {
      const res = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...productData,
          stockAmount: Number(productData.stockAmount),
          minStock: Number(productData.minStock),
          autoOrder: productData.autoOrder,
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
        autoOrder: false,
      });
      refresh();
      onProductAdded();
    } catch (err) {
      setProductMsg({
        type: "error",
        text: err instanceof Error ? err.message : "An unknown error occurred",
      });
    }
  };

  const handleCreateStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStoreMsg({ type: "", text: "" });
    try {
      const res = await fetch("http://localhost:3000/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creating store");
      setStoreMsg({ type: "success", text: "Store location added!" });
      setStoreData({ name: "", location: "" });
      refresh();
    } catch (err) {
      setStoreMsg({
        type: "error",
        text: err instanceof Error ? err.message : "An unknown error occurred",
      });
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div>
          <h2 className={styles.header}>Catalog Management</h2>
          <p className={styles.subtitle}>
            Create product categories and add new items to the warehouse
            database.
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
                  placeholder="e.g. Electronics"
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
            <div className={styles.listSection}>
              <h4 className={styles.listTitle}>EXISTING CATEGORIES</h4>
              <div className={styles.listContainer}>
                {categories.map((cat) => (
                  <div key={cat.id} className={styles.listItem}>
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: "categories",
                          id: cat.id,
                          name: cat.name,
                        })
                      }
                      className={styles.deleteIconBtn}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
                  placeholder="e.g. Monitor"
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
                    setProductData({
                      ...productData,
                      categoryId: e.target.value,
                    })
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
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        minStock:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label
                  className={styles.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={productData.autoOrder}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        autoOrder: e.target.checked,
                      })
                    }
                  />
                  Enable Auto-Ordering
                </label>
              </div>
              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
              >
                Create Product
              </button>
            </form>
            <div className={styles.listSection}>
              <h4 className={styles.listTitle}>EXISTING PRODUCTS</h4>
              <div className={styles.listContainer}>
                {products.map((prod) => (
                  <div key={prod.id} className={styles.listItem}>
                    <span>{prod.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: "products",
                          id: prod.id,
                          name: prod.name,
                        })
                      }
                      className={styles.deleteIconBtn}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STORE CARD */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Store
                size={20}
                className={styles.logoIcon}
                style={{ color: "var(--accent-primary)" }}
              />
              Add New Store
            </h3>
            {storeMsg.text && (
              <div className={`${styles.message} ${styles[storeMsg.type]}`}>
                {storeMsg.text}
              </div>
            )}
            <form
              onSubmit={handleCreateStore}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div className={styles.formGroup}>
                <label className={styles.label}>Store Name</label>
                <input
                  type="text"
                  placeholder="e.g. Uptown Mall"
                  className="input-field"
                  value={storeData.name}
                  onChange={(e) =>
                    setStoreData({ ...storeData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Location / District</label>
                <input
                  type="text"
                  placeholder="e.g. North District"
                  className="input-field"
                  value={storeData.location}
                  onChange={(e) =>
                    setStoreData({ ...storeData, location: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
              >
                Create Store
              </button>
            </form>
            <div className={styles.listSection}>
              <h4 className={styles.listTitle}>EXISTING STORES</h4>
              <div className={styles.listContainer}>
                {stores.map((store) => (
                  <div key={store.id} className={styles.listItem}>
                    <span>
                      {store.name}{" "}
                      <span style={{ color: "var(--text-secondary)" }}>
                        ({store.location})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: "stores",
                          id: store.id,
                          name: store.name,
                        })
                      }
                      className={styles.deleteIconBtn}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-header">Confirm Deletion</h3>
            <p className="modal-body">
              Are you sure you want to delete the{" "}
              {deleteTarget.type.slice(0, -1)}{" "}
              <strong>"{deleteTarget.name}"</strong>? This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={executeDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INFO/ALERT MODAL */}
      {alertModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3
              className="modal-header"
              style={{
                color:
                  alertModal.type === "error"
                    ? "#ef4444"
                    : "var(--text-primary)",
              }}
            >
              {alertModal.title}
            </h3>
            <p className="modal-body">{alertModal.message}</p>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => setAlertModal(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
