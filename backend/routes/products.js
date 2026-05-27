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
    const { name, categoryId, stockAmount, minStock, autoOrder } = req.body;

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
        autoOrder: Boolean(autoOrder),
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a product (ADMIN ONLY)
router.delete("/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    if (err.code === "P2003") {
      return res.status(400).json({
        error:
          "Cannot delete product: It is attached to existing orders or transfers.",
      });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
