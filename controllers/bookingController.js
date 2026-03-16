const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");


/* =========================
   CREATE BOOKING (customer)
========================= */

router.post("/", auth, role("customer"), async (req, res) => {
  try {
    const { providerId, date, note } = req.body;

    const booking = await Booking.create({
      providerId,
      customerId: req.user.id,
      date,
      note,
      status: "pending"
    });

    res.json(booking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* =========================
   CUSTOMER — MY BOOKINGS
========================= */

router.get(
  "/my",
  auth,
  role("customer"),
  async (req, res) => {
    const bookings = await Booking.find({
      customerId: req.user.id
    })
      .populate("providerId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  }
);


/* =========================
   PROVIDER — UPDATE STATUS
========================= */

router.patch(
  "/:id/status",
  auth,
  role("provider"),
  async (req, res) => {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(booking);
  }
);


exports.completeBooking = async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "completed";
    await booking.save();

    res.json({ message: "Booking marked as completed" });

  } catch (err) {

    res.status(500).json({ message: "Server error" });

  }

};

module.exports = router;
