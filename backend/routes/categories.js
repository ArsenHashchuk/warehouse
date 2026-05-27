const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

// get all categories
router.get("/", authenticate, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// create category - admin
router.post("/", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
      },
    });

    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a category admin
router.delete("/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    if (err.code === "P2003") {
      return res
        .status(400)
        .json({ error: "Cannot delete category: It still contains products." });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
