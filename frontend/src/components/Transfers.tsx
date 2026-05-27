import { useState, useEffect } from "react";
import {
  Truck,
  Store,
  X,
  CheckCircle2,
  PackageOpen,
  Download,
} from "lucide-react";
import useAppStore from "../store/useAppStore";
import styles from "./Transfers.module.css";
import { type Product, type NewItem, type Order } from "./Orders";
import { API_URL } from "../config";

interface StoreData {
  id: number;
  name: string;
  location: string;
}
interface TransferItem {
  id: number;
  quantity: number;
  product: Product;
}
interface TransferData {
  id: number;
  transferDate: string;
  status: "SHIPPED" | "RECEIVED";
  store: StoreData;
  items: TransferItem[];
}
interface TransfersProps {
  products: Product[];
  onTransferCreated: () => void;
}

export default function Transfers({
  products,
  onTransferCreated,
}: TransfersProps) {
  const { user } = useAppStore();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  // Custom Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [selectedStore, setSelectedStore] = useState<string>("");
  const [items, setItems] = useState<NewItem[]>([
    { productId: "", quantity: 1 },
  ]);

  useEffect(() => {
    if (!user?.token) return;
    const fetchTransfersAndStores = async () => {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      };
      try {
        const [transfersRes, storesRes, pendingRes] = await Promise.all([
          fetch(`${API_URL}/transfers`, { headers }),
          fetch(`${API_URL}/stores`, { headers }),
          fetch(`${API_URL}/orders/pending-receipts`, { headers }),
        ]);
        setTransfers(await transfersRes.json());
        setStores(await storesRes.json());
        setPendingOrders(await pendingRes.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchTransfersAndStores();
  }, [user?.token]);

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

  // Receive Inbound Order from Supplier
  const receiveInboundOrder = async (orderId: number) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/receive`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (!res.ok) throw new Error("Failed to receive order");

      setPendingOrders(pendingOrders.filter((o) => o.id !== orderId));
      onTransferCreated();
    } catch (err) {
      console.error(err);
      alert("Error receiving items.");
    }
  };

  // Validation before opening modal
  const requestTransfer = () => {
    if (!selectedStore) return alert("Please select a destination store.");
    const validItems = items.filter(
      (item) => item.productId !== "" && item.quantity > 0,
    );
    if (validItems.length === 0)
      return alert("Please select valid products to transfer.");
    setIsConfirmOpen(true);
  };

  // Execution when confirmed
  const executeTransfer = async () => {
    setIsConfirmOpen(false);
    const validItems = items.filter(
      (item) => item.productId !== "" && item.quantity > 0,
    );
    try {
      const res = await fetch(`${API_URL}/transfers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          storeId: selectedStore,
          items: validItems.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
          })),
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create transfer");
      }
      const refreshRes = await fetch(`${API_URL}/transfers`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setTransfers(await refreshRes.json());
      setItems([{ productId: "", quantity: 1 }]);
      setSelectedStore("");
      onTransferCreated();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const receiveTransfer = async (id: number) => {
    try {
      await fetch(`${API_URL}/transfers/${id}/receive`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setTransfers(
        transfers.map((t) => (t.id === id ? { ...t, status: "RECEIVED" } : t)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Inbound deliveries block */}
      <div className={styles.card} style={{ marginBottom: "20px" }}>
        <h3
          className={styles.sectionTitle}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Download size={20} color="var(--accent-primary)" />
          Inbound Deliveries (Pending Receipt)
        </h3>

        {pendingOrders.length === 0 ? (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              padding: "10px 0",
            }}
          >
            No pending inbound deliveries from previous days.
          </p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items to Receive</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id}>
                    <td
                      style={{
                        fontFamily: "monospace",
                        color: "var(--text-secondary)",
                      }}
                    >
                      #{order.id}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        {order.orderItems.map((item) => (
                          <div
                            key={item.productId}
                            style={{ fontSize: "13px" }}
                          >
                            {item.quantity}x {item.product?.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => receiveInboundOrder(order.id)}
                      >
                        Receive to Warehouse
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* dispatch transfer block */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>
          <Truck size={20} color="var(--accent-primary)" /> Dispatch New
          Transfer
        </h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Destination Store</label>
          <select
            className={`input-field ${styles.customSelect}`}
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
          >
            <option value="" disabled>
              Select a store destination...
            </option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} ({store.location})
              </option>
            ))}
          </select>
        </div>
        <label className={styles.label}>Goods to Transfer</label>
        {items.map((item, index) => (
          <div key={index} className={styles.itemRow}>
            <select
              className={`input-field ${styles.customSelect}`}
              style={{ flex: 1 }}
              value={item.productId}
              onChange={(e) => updateItem(index, "productId", e.target.value)}
            >
              <option value="" disabled>
                Select Product...
              </option>
              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                  disabled={product.stockAmount <= 0}
                >
                  {product.name} (Stock: {product.stockAmount})
                </option>
              ))}
            </select>
            <input
              type="number"
              className="input-field"
              style={{ width: "100px" }}
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateItem(
                  index,
                  "quantity",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            />
            {items.length > 1 && (
              <button
                type="button"
                className={styles.removeRowBtn}
                onClick={() => removeItem(index)}
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        <div className={styles.actionButtons}>
          <button onClick={addItem} className="btn btn-outline">
            Add Product
          </button>
          <button onClick={requestTransfer} className="btn btn-primary">
            Dispatch Transfer
          </button>
        </div>
      </div>

      {/* active transfers table */}
      <div className={styles.tableContainer} style={{ marginTop: "20px" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Destination Store</th>
              <th>Items Shipped</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-secondary)",
                  }}
                >
                  No active transfers.
                </td>
              </tr>
            ) : (
              transfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td
                    style={{
                      fontFamily: "monospace",
                      color: "var(--text-secondary)",
                    }}
                  >
                    #{transfer.id}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 500,
                      }}
                    >
                      <Store size={16} color="var(--text-secondary)" />{" "}
                      {transfer.store?.name}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      {transfer.items.map((item) => (
                        <div key={item.id} style={{ fontSize: "13px" }}>
                          {item.quantity}x {item.product?.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    {transfer.status === "SHIPPED" ? (
                      <span
                        className={`${styles.badge} ${styles.badgeShipped}`}
                      >
                        <PackageOpen size={14} /> In Transit
                      </span>
                    ) : (
                      <span
                        className={`${styles.badge} ${styles.badgeReceived}`}
                      >
                        <CheckCircle2 size={14} /> Delivered
                      </span>
                    )}
                  </td>
                  <td>
                    {transfer.status === "SHIPPED" && (
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => receiveTransfer(transfer.id)}
                      >
                        Mark Received
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* dispatch confirmation modal */}
      {isConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-header">Dispatch Transfer</h3>
            <p className="modal-body">
              Are you sure you want to dispatch this transfer? Stock will be
              physically deducted from warehouse inventory immediately.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-cancel"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={executeTransfer}>
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
