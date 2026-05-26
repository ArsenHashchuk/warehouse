const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const ordersRoute = require("./routes/orders");
const productsRoute = require("./routes/products");


const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/orders", ordersRoute);
app.use("/products", productsRoute);

app.get("/test", (req, res) => {
  res.json({ ok: true });
});

async function start() {
  try {
    console.log("Starting backend...");

    await prisma.$connect();

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });

  } catch (err) {
    console.error("❌ BACKEND CRASH:");
    console.error(err);
  }
}

start();