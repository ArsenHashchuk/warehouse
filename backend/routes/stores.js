const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

// Get all stores
router.get("/", authenticate, async (req, res) => {
  try {
    const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });
    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a store
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, location } = req.body;
    const store = await prisma.store.create({
      data: { name, location },
    });
    res.status(201).json(store);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a store (ADMIN ONLY)
router.delete("/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    await prisma.store.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Store deleted successfully" });
  } catch (err) {
    if (err.code === "P2003") {
      return res
        .status(400)
        .json({ error: "Cannot delete store: It has a history of transfers." });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
