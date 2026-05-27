require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");
const storesRoutes = require("./routes/stores");
const transfersRoutes = require("./routes/transfers");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/categories", categoriesRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/stores", storesRoutes);
app.use("/transfers", transfersRoutes);
app.use("/users", usersRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "WarehousePro (Logistics Center) API is running smoothly!",
    status: "active",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port: ${PORT}`);
});
