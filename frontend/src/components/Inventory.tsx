import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Tags,
} from "lucide-react";
import useAppStore from "../store/useAppStore";
import styles from "./Inventory.module.css";
import { API_URL } from "../config";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
  stockAmount: number;
  minStock: number;
}

export default function Inventory() {
  const { user } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      };

      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_URL}/products`, { headers }),
          fetch(`${API_URL}/categories`, { headers }),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        setProducts(prodData || []);
        setCategories(catData || []);
      } catch (err) {
        console.error("Failed to fetch inventory data:", err);
      }
    };

    fetchData();
  }, [user?.token]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryId === "ALL" ||
      product.categoryId.toString() === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.container}>
      <div>
        <h2 style={{ marginTop: 0, marginBottom: "5px" }}>
          Inventory Tracking
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px",
            marginTop: 0,
          }}
        >
          Monitor current stock levels and filter items by category.
        </p>
      </div>

      {/* Control Panel: Search & Filter */}
      <div className={styles.controls}>
        <div className={styles.searchGroup}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products by name..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <Filter size={18} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  No products found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isOutOfStock = product.stockAmount <= 0;
                const isLowStock =
                  !isOutOfStock && product.stockAmount <= product.minStock;

                return (
                  <tr key={product.id}>
                    <td className={styles.productId}>#{product.id}</td>
                    <td style={{ fontWeight: 500 }}>{product.name}</td>
                    <td>
                      <span className={styles.categoryTag}>
                        <Tags size={14} />
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className={styles.stockAmount}>
                      {product.stockAmount}{" "}
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          fontWeight: "normal",
                        }}
                      >
                        / min: {product.minStock}
                      </span>
                    </td>
                    <td>
                      {isOutOfStock ? (
                        <span
                          className={`${styles.badge} ${styles.badgeOutOfStock}`}
                        >
                          <XCircle size={14} /> Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span
                          className={`${styles.badge} ${styles.badgeLowStock}`}
                        >
                          <AlertTriangle size={14} /> Low Stock
                        </span>
                      ) : (
                        <span
                          className={`${styles.badge} ${styles.badgeInStock}`}
                        >
                          <CheckCircle2 size={14} /> In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
