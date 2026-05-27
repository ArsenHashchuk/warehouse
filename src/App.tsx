import { useState, useEffect, useCallback } from "react";
import {
  Warehouse,
  Sun,
  Moon,
  Monitor,
  ClipboardList,
  Package,
  Layers,
  ArrowRightLeft,
  Database,
  Check,
} from "lucide-react";
import styles from "./App.module.css";

import Orders, {
  type NewItem,
  type Order,
  type Product,
} from "./components/Orders";
import Inventory from "./components/Inventory";
import Login from "./components/Login";
import Catalog from "./components/Catalog";
import useAppStore from "./store/useAppStore";

export default function WarehouseSystem() {
  const { user, logout, theme, setTheme } = useAppStore();

  const [page, setPage] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<NewItem[]>([
    { productId: "", quantity: 1 },
  ]);

  // State to control the theme dropdown menu
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const token = user?.token;

  // Wrap in useCallback so React knows this function is safe and stable
  const refreshProducts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3000/products", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // Initial Data Fetch
  useEffect(() => {
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("http://localhost:3000/orders", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:3000/products", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const [ordersData, productsData] = await Promise.all([
          ordersRes.json(),
          productsRes.json(),
        ]);

        setOrders(ordersData || []);
        setProducts(productsData || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitialData();
  }, [token]);

  // Order Item Management
  const addItem = () => setItems([...items, { productId: "", quantity: 1 }]);

  const updateItem = (
    index: number,
    field: keyof NewItem,
    value: string | number,
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const createOrder = async () => {
    const validItems = items.filter(
      (item) => item.productId !== "" && item.quantity > 0,
    );
    if (validItems.length === 0) {
      alert(
        "Please select at least one valid product and quantity before submitting.",
      );
      return;
    }

    const confirmCreate = window.confirm("Submit order?");
    if (!confirmCreate) return;

    try {
      const res = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: validItems.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const refreshRes = await fetch("http://localhost:3000/orders", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await refreshRes.json();
      setOrders(data);
      setItems([{ productId: "", quantity: 1 }]);
      alert("Order created successfully!");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const deleteOrder = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?",
    );
    if (!confirmDelete) return;
    try {
      await fetch(`http://localhost:3000/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((order) => order.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <Login />;

  return (
    <div className={styles.appWrapper}>
      {/* TOPBAR */}
      <div className={styles.topbar}>
        <div className={styles.logo}>
          <Warehouse className={styles.logoIcon} size={22} /> WarehousePro
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.themeMenuContainer}>
            <button
              type="button"
              className={styles.themeIconBtn}
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              title="Change Appearance"
            >
              {theme === "light" ? (
                <Sun size={20} />
              ) : theme === "dark" ? (
                <Moon size={20} />
              ) : (
                <Monitor size={20} />
              )}
            </button>

            {isThemeMenuOpen && (
              <>
                <div
                  className={styles.themeOverlay}
                  onClick={() => setIsThemeMenuOpen(false)}
                />
                <div className={styles.themeDropdown}>
                  <div className={styles.themeDropdownHeader}>Appearance</div>
                  <button
                    className={styles.themeDropdownItem}
                    onClick={() => {
                      setTheme("system");
                      setIsThemeMenuOpen(false);
                    }}
                  >
                    System {theme === "system" && <Check size={16} />}
                  </button>
                  <button
                    className={styles.themeDropdownItem}
                    onClick={() => {
                      setTheme("dark");
                      setIsThemeMenuOpen(false);
                    }}
                  >
                    Dark {theme === "dark" && <Check size={16} />}
                  </button>
                  <button
                    className={styles.themeDropdownItem}
                    onClick={() => {
                      setTheme("light");
                      setIsThemeMenuOpen(false);
                    }}
                  >
                    Light {theme === "light" && <Check size={16} />}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className={styles.userInfo}>
            <div className={styles.userEmail}>{user.email}</div>
            <div className={styles.userRole}>
              {user.role === "ADMIN" ? "Administrator" : "Warehouse Worker"}
            </div>
          </div>
          <button onClick={logout} className="btn btn-primary">
            Logout
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.bodyWrapper}>
        {/* SIDEBAR */}
        <div className={styles.sidebar}>
          <div className={styles.navSection}>Main Menu</div>

          <div
            className={`${styles.navItem} ${page === "orders" ? styles.navItemActive : ""}`}
            onClick={() => setPage("orders")}
          >
            <ClipboardList size={18} style={{ marginRight: "8px" }} /> Inbound
            Orders
          </div>
          <div
            className={`${styles.navItem} ${page === "inventory" ? styles.navItemActive : ""}`}
            onClick={() => setPage("inventory")}
          >
            <Package size={18} style={{ marginRight: "8px" }} /> Inventory
          </div>
          <div
            className={`${styles.navItem} ${page === "stock" ? styles.navItemActive : ""}`}
            onClick={() => setPage("stock")}
          >
            <Layers size={18} style={{ marginRight: "8px" }} /> Current Stock
          </div>
          <div
            className={`${styles.navItem} ${page === "transfer" ? styles.navItemActive : ""}`}
            onClick={() => setPage("transfer")}
          >
            <ArrowRightLeft size={18} style={{ marginRight: "8px" }} /> Store
            Transfers
          </div>

          {user.role === "ADMIN" && (
            <>
              <div className={`${styles.navSection} ${styles.adminSection}`}>
                Administration
              </div>
              <div
                className={`${styles.navItem} ${page === "catalog" ? styles.navItemActive : ""}`}
                onClick={() => setPage("catalog")}
              >
                <Database size={18} style={{ marginRight: "8px" }} /> Catalog &
                Categories
              </div>
            </>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className={styles.mainContent}>
          {page === "orders" && (
            <div>
              <h2 className={styles.pageHeader}>Inbound Orders</h2>
              <Orders
                orders={orders}
                products={products}
                items={items}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
                createOrder={createOrder}
                deleteOrder={deleteOrder}
              />
            </div>
          )}
          {page === "inventory" && <Inventory />}
          {page === "stock" && (
            <div>
              <h2 className={styles.pageHeader}>Current Stock</h2>
            </div>
          )}
          {page === "transfer" && (
            <div>
              <h2 className={styles.pageHeader}>Store Transfers</h2>
            </div>
          )}

          {/* CATALOG COMPONENT WITH REFRESH PROP */}
          {page === "catalog" && user.role === "ADMIN" && (
            <Catalog onProductAdded={refreshProducts} />
          )}
        </div>
      </div>
    </div>
  );
}
