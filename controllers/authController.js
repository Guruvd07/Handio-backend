import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================
   JWT Token Generator
========================= */

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/* =========================
   REGISTER
========================= */

export const register = async (req, res) => {
  try {
    let { name, email, password, role = "customer" } = req.body;

    /* ---------- validation ---------- */

    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters",
      });
    }

    /* ---------- role whitelist ---------- */

    const allowedRoles = ["customer", "provider", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        msg: "Invalid role",
      });
    }

    /* ---------- normalize email ---------- */

    email = email.toLowerCase().trim();

    /* ---------- duplicate check ---------- */

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    /* ---------- hash password ---------- */

    const hashedPassword = await bcrypt.hash(password, 10);

    /* ---------- create user ---------- */

    const user = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
      role,
    });

    /* ---------- response ---------- */

    res.status(201).json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

/* =========================
   LOGIN
========================= */

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    /* ---------- validation ---------- */

    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and password required",
      });
    }

    email = email.toLowerCase().trim();

    /* ---------- find user ---------- */

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    /* ---------- compare password ---------- */

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    /* ---------- response ---------- */

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};