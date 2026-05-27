import { useState, useEffect } from "react";
import useAppStore from "../store/useAppStore";
import styles from "./OrderHistory.module.css";

interface Product {
  name: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  product: Product;
}

interface Order {
  id: number;
  orderDate: string;
  status: string;
  orderItems: OrderItem[];
}

export default function OrderHistory() {
  const { user } = useAppStore();
  const token = user?.token;
  const [history, setHistory] = useState<Order[]>([]);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const res = await fetch("http://localhost:3000/orders/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Order[] = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    })();
  }, [token]);

  return (
    <div className={styles.container}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((order) =>
              (order.orderItems || []).map((item) => (
                <tr key={item.id}>
                  <td>#{order.id}</td>
                  <td>{item.product?.name || "Unknown"}</td>
                  <td>{item.quantity}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        order.status === "PENDING"
                          ? styles.pending
                          : styles.completed
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              )),
            )
          ) : (
            <tr>
              <td colSpan={5}>No history found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
