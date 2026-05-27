import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import styles from "./Orders.module.css";

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  category?: { id: number; name: string };
  stockAmount: number;
  minStock: number;
}
export interface OrderItem {
  productId: string | number;
  quantity: number;
  product?: Product;
}
export interface Order {
  id: number;
  orderDate: string;
  orderItems: OrderItem[];
}
export interface NewItem {
  productId: string | number;
  quantity: number;
}

interface OrdersProps {
  orders: Order[];
  products: Product[];
  items: NewItem[];
  addItem: () => void;
  updateItem: (
    index: number,
    field: keyof NewItem,
    value: string | number,
  ) => void;
  removeItem: (index: number) => void;
  createOrder: () => void;
  deleteOrder: (id: number) => void;
}

export default function Orders({
  orders,
  products,
  items,
  addItem,
  updateItem,
  removeItem,
  createOrder,
  deleteOrder,
}: OrdersProps) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleRequestSubmit = () => setIsSubmitModalOpen(true);
  const confirmSubmit = () => {
    setIsSubmitModalOpen(false);
    createOrder();
  };

  const handleRequestDelete = (id: number) => setDeleteTargetId(id);
  const confirmDelete = () => {
    if (deleteTargetId) deleteOrder(deleteTargetId);
    setDeleteTargetId(null);
  };

  return (
    <>
      <div className={styles.createOrderCard}>
        <h3 className={styles.sectionTitle}>Create Order</h3>
        {items.map((item, index) => (
          <div key={index} className={styles.itemRow}>
            <select
              className={`input-field ${styles.productSelect}`}
              value={item.productId}
              onChange={(e) => updateItem(index, "productId", e.target.value)}
            >
              <option value="" disabled>
                Select Product
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              className={`input-field ${styles.quantityInput}`}
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, "quantity", Number(e.target.value))
              }
            />
            {items.length > 1 && (
              <button
                type="button"
                className={styles.removeRowBtn}
                onClick={() => removeItem(index)}
                title="Remove Item"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        <div className={styles.actionButtons}>
          <button onClick={addItem} className="btn btn-outline">
            Add Item
          </button>
          <button onClick={handleRequestSubmit} className="btn btn-primary">
            Submit Order
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) =>
                (order.orderItems || []).map((item, index) => (
                  <tr key={`${order.id}-${index}`}>
                    <td className={styles.orderId}>#{order.id}</td>
                    <td>{item.product?.name || "Unknown Product"}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {new Date(order.orderDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleRequestDelete(order.id)}
                      >
                        <Trash2
                          size={14}
                          style={{
                            marginRight: "6px",
                            verticalAlign: "text-bottom",
                          }}
                        />{" "}
                        Delete
                      </button>
                    </td>
                  </tr>
                )),
              )
            )}
          </tbody>
        </table>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {isSubmitModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-header">Submit Order</h3>
            <p className="modal-body">
              Are you sure you want to finalize and submit this supplier order?
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-cancel"
                onClick={() => setIsSubmitModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmSubmit}>
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-header">Cancel Order</h3>
            <p className="modal-body">
              Are you sure you want to cancel and delete order #{deleteTargetId}
              ? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-cancel"
                onClick={() => setDeleteTargetId(null)}
              >
                Keep Order
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
