const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

// get products for all roles
router.get("/", authenticate, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: { id: "desc" },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// create product (admin)
router.post("/", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const { name, categoryId, stockAmount, minStock } = req.body;

    if (!name || !categoryId) {
      return res
        .status(400)
        .json({ error: "Name and Category ID are required" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId: Number(categoryId),
        stockAmount: stockAmount ? Number(stockAmount) : 0,
        minStock: minStock ? Number(minStock) : 10,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
