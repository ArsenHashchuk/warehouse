import { useState, useEffect } from "react";
import "./App.css";
import Orders from "./components/Orders";


export default function WarehouseSystem() {

  // states
  const [page, setPage] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState("");
  const [items, setItems] = useState([
    {
      productId: "",
      quantity: 1,
    },
  ]);
  const [newType, setNewType] = useState("");
const createProduct = async () => {
  try {

    if (!newProduct.trim() || !newType.trim()) {
      alert("Заповніть всі поля");
      return;
    }

    await fetch("http://localhost:3000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newProduct,
        type: newType,
      }),
    });

    // reload products
    const res = await fetch("http://localhost:3000/products");
    const data = await res.json();

    setProducts(data);

    // очистка полів
    setNewProduct("");
    setNewType("");

  } catch (err) {
    console.log(err);
  }
};


  
  useEffect(() => {
  fetch("http://localhost:3000/orders")
    .then((res) => res.json())
    .then((data) => {
      const safeData = (data || []).map(order => ({
        ...order,
        orderItems: order.orderItems || []
      }));

      setOrders(safeData);
    })
    .catch((err) => console.log(err));

    fetch("http://localhost:3000/products")
    .then((res) => res.json())
    .then((data) => {
      setProducts(data || []);
    });




    
}, []);

const createOrder = async () => {
  const confirmCreate = window.confirm(
  "Створити замовлення?"
);

if (!confirmCreate) return;
  try {
    await fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
        })),
      }),
    });

    // reload orders
    const res = await fetch("http://localhost:3000/orders");
    const data = await res.json();

    setOrders(data);

  } catch (err) {
    console.log(err);
  }
};

const addItem = () => {
  setItems([
    ...items,
    {
      productId: "",
      quantity: 1,
    },
  ]);
};

const updateItem = (index, field, value) => {
  const updated = [...items];

  updated[index][field] = value;

  setItems(updated);
};


const deleteOrder = async (id) => {
  const confirmDelete = window.confirm(
    "Ви впевнені що хочете видалити замовлення?"
  );

  if (!confirmDelete) return;

  try {
    await fetch(`http://localhost:3000/orders/${id}`, {
      method: "DELETE",
    });

    setOrders(
      orders.filter((order) => order.id !== id)
    );

  } catch (err) {
    console.log(err);
  }
};







  return (
    

    
    <div className="app">
      <div className="topbar">
        <div className="logo">
          <i className="ti ti-building-warehouse" aria-hidden="true"></i>
          {" "}СкладПро
        </div>

        <div className="topbar-search">
          <i className="ti ti-search" aria-hidden="true"></i>
          {" "}Пошук...
        </div>

        <div className="topbar-right">
          <i
            className="ti ti-bell"
            style={{
              fontSize: "18px",
              color: "#a5b4fc",
              cursor: "pointer",
            }}
          ></i>

          <div className="avatar">ОМ</div>
        </div>
      </div>

      <div className="body">
        <div className="sidebar">
          <div className="nav-section">Основне</div>

          <div
            className={`nav-item ${page === "orders" ? "active" : ""}`}
            onClick={() => setPage("orders")}
          >
            <i className="ti ti-clipboard-list"></i>
            Замовлення
            <span className="badge">{orders.length}</span>
          </div>

          <div className="nav-item" onClick={() => setPage("inventory")}>
            <i className="ti ti-package"></i>
            Інвентаризація
          </div>

          <div className="nav-item" onClick={() => setPage("stock")}>
            <i className="ti ti-stack-2"></i>
            Поточні залишки
          </div>

          <div className="nav-item" onClick={() => setPage("transfer")}>
            <i className="ti ti-arrows-exchange"></i>
            Переміщення
          </div>

          <div className="nav-section" style={{ marginTop: "8px" }}>
            Звіти
          </div>

          <div className="nav-item" onClick={() => setPage("analytics")}>
            <i className="ti ti-chart-bar"></i>
            Аналітика
          </div>

          <div className="nav-item" onClick={() => setPage("settings")}>
            <i className="ti ti-settings"></i>
            Налаштування
          </div>
        </div>




        <div className="main">
          {page === "orders" && (
            <div>
              <div className="page-header">
                <div>
                  <div className="page-title">Замовлення</div>
                  <div className="page-subtitle">
                    Керування вхідними та вихідними замовленнями
                  </div>
                </div>

              </div>








<div className="table-card" style={{ marginBottom: "20px" }}>
  <h3 style={{ marginBottom: "15px" }}>
    Додавання товару
  </h3>

  <div
    style={{
      display: "flex",
      gap: "10px",
    }}
  >
    <input
      type="text"
      placeholder="Назва товару"
      value={newProduct}
      onChange={(e) => setNewProduct(e.target.value)}
      style={{
        padding: "10px",
        borderRadius: "8px",
        width: "250px",
      }}
    />
<input
  type="text"
  placeholder="Тип товару"
  value={newType}
  onChange={(e) => setNewType(e.target.value)}
  style={{
    padding: "10px",
    borderRadius: "8px",
    width: "250px",
  }}
/>
    <button
      onClick={createProduct}
      className="btn btn-primary"
    >
      Додати товар
    </button>
  </div>
</div>

<Orders
  orders={orders}
  products={products}
  items={items}
  addItem={addItem}
  updateItem={updateItem}
  createOrder={createOrder}
  deleteOrder={deleteOrder}
/>
              
            </div>
          )}

          {page === "inventory" && (
            <div className="page-title">Інвентаризація</div>
          )}

          {page === "stock" && (
            <div className="page-title">Поточні залишки</div>
          )}

          {page === "transfer" && (
            <div className="page-title">Переміщення</div>
          )}

          {page === "analytics" && (
            <div className="page-title">Аналітика</div>
          )}

          {page === "settings" && (
            <div className="page-title">Налаштування</div>
          )}
        </div>
      </div>
    </div>
  );
}