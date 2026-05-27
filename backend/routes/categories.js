const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

// get all categories (Accessible to all logged-in users)
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

// create category (STRICTLY ADMIN ONLY)
router.post("/", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Check if category already exists to avoid Prisma unique constraint errors
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

// Delete a category (ADMIN ONLY)
router.delete("/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    // If Prisma throws a foreign key constraint error, catch it
    if (err.code === "P2003") {
      return res
        .status(400)
        .json({ error: "Cannot delete category: It still contains products." });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
