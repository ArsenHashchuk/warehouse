import { useState, useEffect, useCallback } from "react";
import {
  Sun,
  Moon,
  Monitor,
  ClipboardList,
  Package,
  ArrowRightLeft,
  Database,
  Check,
  Users,
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
import Transfers from "./components/Transfers";
import UsersManagement from "./components/UsersManagement";
import OrderHistory from "./components/OrderHistory";
import useAppStore from "./store/useAppStore";
import { API_URL } from "./config";

export default function WarehouseSystem() {
  const { user, logout, theme, setTheme } = useAppStore();

  const [page, setPage] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<NewItem[]>([
    { productId: "", quantity: 1 },
  ]);

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [appAlert, setAppAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const token = user?.token;

  const refreshProducts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/products`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const refreshOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const handleTransferCreated = useCallback(async () => {
    await Promise.all([refreshProducts(), refreshOrders()]);
  }, [refreshProducts, refreshOrders]);

  // Initial Data Fetch
  useEffect(() => {
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/orders`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/products`, {
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

        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
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

    try {
      const res = await fetch(`${API_URL}/orders`, {
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

      const refreshRes = await fetch(`${API_URL}/orders`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await refreshRes.json();
      setOrders(data);
      setItems([{ productId: "", quantity: 1 }]);

      setAppAlert({
        title: "Order Dispatched",
        message: "Your inbound order has been created successfully!",
      });
    } catch (err) {
      console.error(err);
      setAppAlert({
        title: "Action Failed",
        message: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      await fetch(`${API_URL}/orders/${id}`, {
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
      <div className={styles.topbar}>
        <div className={styles.logo}>
          <img
            src="/favicon.svg"
            alt="WarehousePro Logo"
            className={styles.logoIcon}
            width="22"
            height="22"
          />
          WarehousePro
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

      {/* body */}
      <div className={styles.bodyWrapper}>
        {/* sidebar */}
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
            className={`${styles.navItem} ${page === "transfer" ? styles.navItemActive : ""}`}
            onClick={() => setPage("transfer")}
          >
            <ArrowRightLeft size={18} style={{ marginRight: "8px" }} /> Store
            Transfers
          </div>
          <div
            className={`${styles.navItem} ${page === "history" ? styles.navItemActive : ""}`}
            onClick={() => setPage("history")}
          >
            <ClipboardList size={18} style={{ marginRight: "8px" }} /> Order
            History
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
              <div
                className={`${styles.navItem} ${page === "users" ? styles.navItemActive : ""}`}
                onClick={() => setPage("users")}
              >
                <Users size={18} style={{ marginRight: "8px" }} /> Staff
                Management
              </div>
            </>
          )}
        </div>

        {/* main content */}
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
          {page === "transfer" && (
            <div>
              <h2 className={styles.pageHeader}>Store Transfers</h2>
              <Transfers
                products={products}
                onTransferCreated={handleTransferCreated}
              />
            </div>
          )}
          {page === "history" && (
            <div>
              <h2 className={styles.pageHeader}>Order History</h2>
              <OrderHistory />
            </div>
          )}

          {page === "catalog" && user.role === "ADMIN" && (
            <Catalog onProductAdded={refreshProducts} />
          )}
          {page === "users" && user.role === "ADMIN" && <UsersManagement />}
        </div>
      </div>
      {/* app info modal */}
      {appAlert && (
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div className="modal-card">
            <h3 className="modal-header">{appAlert.title}</h3>
            <p className="modal-body">{appAlert.message}</p>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => setAppAlert(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
