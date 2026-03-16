import express from "express";

import Booking from "../models/Booking.js";
import ProviderProfile from "../models/ProviderProfile.js";

import auth from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* =========================
   CREATE BOOKING
========================= */

router.post("/", auth, role("customer"), async (req, res) => {
  try {
    const { providerId, date, note } = req.body;

    if (!providerId || !date) {
      return res.status(400).json({ error: "providerId and date required" });
    }

    const providerProfile = await ProviderProfile.findById(providerId);

    if (!providerProfile) {
      return res.status(404).json({ error: "Provider not found" });
    }

    const booking = await Booking.create({
      providerId,
      customerId: req.user.id,
      date,
      note,
      status: "pending",
    });

    res.json(booking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CUSTOMER BOOKINGS
========================= */

router.get("/my", auth, role("customer"), async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate({
        path: "providerId",
        populate: {
          path: "userId",        // ← pulls in the User doc (name, email)
          select: "name email"
        }
      })
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   PROVIDER BOOKINGS
========================= */

router.get("/provider", auth, role("provider"), async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const bookings = await Booking.find({ providerId: profile._id })
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   PROVIDER UPDATE STATUS
========================= */

router.patch("/:id/status", auth, role("provider"), async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["accepted", "rejected", "completed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const profile = await ProviderProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      providerId: profile._id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    /* Status transition rules */
    if (booking.status === "pending") {
      if (status !== "accepted" && status !== "rejected") {
        return res.status(400).json({
          error: "Pending booking can only be accepted or rejected",
        });
      }
    }

    if (booking.status === "accepted") {
      if (status !== "completed") {
        return res.status(400).json({
          error: "Accepted booking can only be completed",
        });
      }
    }

    if (booking.status === "completed" || booking.status === "rejected") {
      return res.status(400).json({ error: "Booking already finalized" });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;