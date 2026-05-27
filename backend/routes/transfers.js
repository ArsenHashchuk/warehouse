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

// Create a new transfer and check for auto-orders
router.post("/", authenticate, async (req, res) => {
  try {
    const { storeId, items } = req.body;

    if (!storeId || !items || items.length === 0) {
      return res.status(400).json({ error: "Store ID and items are required" });
    }

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

      for (let item of items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity);

        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { stockAmount: { decrement: quantity } },
        });

        if (
          updatedProduct.autoOrder &&
          updatedProduct.stockAmount < updatedProduct.minStock
        ) {
          const neededQuantity =
            updatedProduct.minStock - updatedProduct.stockAmount;

          const existingPendingOrder = await tx.order.findFirst({
            where: {
              status: "PENDING",
              orderItems: { some: { productId: productId } },
            },
            include: { orderItems: true },
          });

          if (existingPendingOrder) {
            const itemToUpdate = existingPendingOrder.orderItems.find(
              (i) => i.productId === productId,
            );

            if (itemToUpdate) {
              await tx.orderItem.update({
                where: { id: itemToUpdate.id },
                data: { quantity: neededQuantity },
              });
            }
          } else {
            await tx.order.create({
              data: {
                status: "PENDING",
                orderDate: new Date(),
                orderItems: {
                  create: [
                    {
                      productId: productId,
                      quantity: neededQuantity,
                    },
                  ],
                },
              },
            });
          }
        }
      }

      return transfer;
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during transfer" });
  }
});

// Mark transfer as Received
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
