const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

// Get all transfers
router.get("/", authenticate, async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        store: true,
        items: { include: { product: true } },
      },
      orderBy: { id: "desc" },
    });
    res.json(transfers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new transfer and deduct stock
router.post("/", authenticate, async (req, res) => {
  try {
    const { storeId, items } = req.body;

    if (!storeId || !items || items.length === 0) {
      return res.status(400).json({ error: "Store ID and items are required" });
    }

    for (let item of items) {
      const product = await prisma.product.findUnique({
        where: { id: Number(item.productId) },
      });
      if (!product || product.stockAmount < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for product ID #${item.productId}. Available: ${product?.stockAmount || 0}`,
        });
      }
    }

    // Perform a transaction
    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.create({
        data: {
          storeId: Number(storeId),
          status: "SHIPPED",
          items: {
            create: items.map((item) => ({
              productId: Number(item.productId),
              quantity: Number(item.quantity),
            })),
          },
        },
        include: { store: true, items: { include: { product: true } } },
      });

      // Deduct inventory
      for (let item of items) {
        await tx.product.update({
          where: { id: Number(item.productId) },
          data: { stockAmount: { decrement: Number(item.quantity) } },
        });
      }

      return transfer;
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during transfer" });
  }
});

// Mark transfer as Received by the store
router.patch("/:id/receive", authenticate, async (req, res) => {
  try {
    const updated = await prisma.transfer.update({
      where: { id: Number(req.params.id) },
      data: { status: "RECEIVED" },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
