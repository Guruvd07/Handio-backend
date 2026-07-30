import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import ProviderProfile from "../models/ProviderProfile.js";

/* =========================
   CREATE REVIEW
========================= */

export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating)
      return res.status(400).json({ message: "bookingId and rating required" });

    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1–5" });

    const booking = await Booking.findById(bookingId);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    // ownership check
    if (booking.customerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your booking" });

    // must be completed
    if (booking.status !== "completed")
      return res.status(400).json({
        message: "Service not completed yet"
      });

    // prevent duplicate review
    if (booking.reviewed)
      return res.status(400).json({
        message: "Already reviewed"
      });

    const review = await Review.create({
      bookingId,
      providerProfileId: booking.providerId,
      customerId: req.user.id,
      rating,
      comment
    });

    await updateProviderRating(booking.providerId);

    booking.reviewed = true;
    await booking.save();

    res.json(review);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET PROVIDER REVIEWS
========================= */

export const getProviderReviews = async (req, res) => {
  try {

    const reviews = await Review.find({
      providerProfileId: req.params.providerId
    })
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};

/* =========================
   UPDATE PROVIDER RATING
========================= */

async function updateProviderRating(providerProfileId) {

  const pid = new mongoose.Types.ObjectId(providerProfileId);

  const stats = await Review.aggregate([
    { $match: { providerProfileId: pid } },
    {
      $group: {
        _id: "$providerProfileId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  if (!stats.length) {

    await ProviderProfile.findByIdAndUpdate(pid, {
      averageRating: 0,
      totalReviews: 0
    });

    return;

  }

  await ProviderProfile.findByIdAndUpdate(pid, {
    averageRating: Number(stats[0].avg.toFixed(2)),
    totalReviews: stats[0].count
  });
}