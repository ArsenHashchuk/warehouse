const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Отримати товари
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.json(products);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server error",
    });
  }
});

// Створити товар
router.post("/", async (req, res) => {
  try {

    const { name, type } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Product name is required",
      });
    }

    if (!type || !type.trim()) {
      return res.status(400).json({
        error: "Product type is required",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        type,
      },
    });

    res.status(201).json(product);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server error",
    });
  }
});

module.exports = router;