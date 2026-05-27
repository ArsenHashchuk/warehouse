const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

// Get all users
router.get("/", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true },
      orderBy: { id: "desc" },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new user
router.post("/", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "WORKER",
      },
      select: { id: true, email: true, role: true },
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user
router.delete("/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);

    if (targetUserId === req.user.userId) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own admin account." });
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
