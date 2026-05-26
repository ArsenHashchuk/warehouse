// 1. Load environment variables first (JWT_SECRET, DATABASE_URL, etc.)
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// 2. Import all your route modules
const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;

// 3. Global Middleware
app.use(cors());
app.use(express.json());

// 4. Mount the routes to specific URL paths
// Traffic to http://localhost:3000/auth/... goes to authRoutes
app.use("/auth", authRoutes);

// Traffic to http://localhost:3000/categories/... goes to categoriesRoutes
app.use("/categories", categoriesRoutes);

// Traffic to http://localhost:3000/products/... goes to productsRoutes
app.use("/products", productsRoutes);

// Traffic to http://localhost:3000/orders/... goes to ordersRoutes
app.use("/orders", ordersRoutes);

// 5. Base Health-Check Route (Useful for testing if the server is up)
app.get("/", (req, res) => {
  res.json({
    message: "СкладПро (Logistics Center) API is running smoothly!",
    status: "active",
  });
});

// 6. Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
