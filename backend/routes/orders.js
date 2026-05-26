const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Створити замовлення
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
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
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

    res.status(500).json({
      error: "Server error",
    });
  }
});

// Отримати всі замовлення
router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
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

// Отримати замовлення по ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: {
        id,
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
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
});

// Видалити замовлення
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
