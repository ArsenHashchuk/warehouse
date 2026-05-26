export default function Orders({
  orders,
  products,
  items,
  addItem,
  updateItem,
  createOrder,
  deleteOrder,
}) {
  return (
    <>
      <div className="table-card" style={{ marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "15px" }}>Створення замовлення</h3>
        <th>Дії</th>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <select
              value={item.productId}
              onChange={(e) => updateItem(index, "productId", e.target.value)}
            >
              <option value="">Оберіть товар</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
            />
          </div>
        ))}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          <button onClick={addItem} className="btn btn-outline">
            Додати товар
          </button>

          <button onClick={createOrder} className="btn btn-primary">
            Створити замовлення
          </button>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Товар</th>
              <th>Кількість</th>
              <th>Дата</th>
              <td></td>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5">Немає замовлень</td>
              </tr>
            ) : (
              orders.map((order) =>
                (order.orderItems || []).map((item, index) => (
                  <tr key={`${order.id}-${index}`}>
                    <td>#{order.id}</td>

                    <td>{item.product?.name}</td>

                    <td>{item.quantity}</td>

                    <td>
                      {new Date(order.orderDate).toLocaleDateString("uk-UA")}
                    </td>

                    <td>
                      <button
                        className="btn btn-outline"
                        onClick={() => deleteOrder(order.id)}
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                )),
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
