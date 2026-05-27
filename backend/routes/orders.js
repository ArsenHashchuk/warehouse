const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

// Create order
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Items are required",
      });
    }

    const order = await prisma.order.create({
      data: {
        status: "PENDING",
        orderItems: {
          create: items.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all orders for today
router.get("/", async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: startOfToday,
        },
        status: "PENDING",
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error",
    });
  }
});

router.get("/all", authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { orderDate: "desc" },
    });
    res.json(orders || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.get("/pending-receipts", async (req, res) => {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        orderItems: { include: { product: true } },
      },
      orderBy: { orderDate: "asc" },
    });
    res.json(pendingOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Receive inbound order
router.patch("/:id/receive", async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order || order.status !== "PENDING") {
        throw new Error("Order not found or already processed");
      }

      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockAmount: { increment: item.quantity } },
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "COMPLETED" },
      });

      return updatedOrder;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Get order by id
router.get("/:id", async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.orderItem.deleteMany({
      where: {
        orderId: id,
      },
    });

    await prisma.order.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Order deleted",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server error",
    });
  }
});
module.exports = router;
