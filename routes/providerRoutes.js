import express from "express";
import Provider from "../models/ProviderProfile.js";
import Booking from "../models/Booking.js";
import auth from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

import {
  createProfile,
  uploadProfilePhoto,
  uploadPortfolioImage,
  getMyProfile,
  deleteProfilePhoto
} from "../controllers/providerController.js";

const router = express.Router();

/* =========================
   CREATE PROVIDER PROFILE
========================= */

router.post("/profile", auth, role("provider"), createProfile);

/* =========================
   GET MY PROFILE
========================= */

router.get("/me", auth, role("provider"), getMyProfile);

/* =========================
   PROVIDER STATS (NEW)
========================= */

router.get(
  "/stats",
  auth,
  role("provider"),
  async (req, res) => {
    try {

      const profile = await Provider.findOne({
        userId: req.user.id
      });

      if (!profile) {
        return res.status(404).json({
          error: "Provider profile not found"
        });
      }

      const bookings = await Booking.find({
        providerId: profile._id
      });

      const completedJobs = bookings.filter(
        b => b.status === "completed"
      ).length;

      const totalEarnings = bookings
        .filter(b => b.status === "completed")
        .reduce((sum) => sum + (profile.priceAmount || 0), 0);

      const responseRate = bookings.length
        ? Math.round(
            (bookings.filter(b => b.status !== "pending").length /
              bookings.length) * 100
          )
        : 100;

      res.json({
        completedJobs,
        totalEarnings,
        responseRate
      });

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }
  }
);

/* =========================
   UPLOAD PROFILE PHOTO
========================= */

router.post(
  "/upload-photo",
  auth,
  role("provider"),
  upload.single("image"),
  uploadProfilePhoto
);

/* =========================
   DELETE PROFILE PHOTO
========================= */

router.delete(
  "/profile-photo",
  auth,
  role("provider"),
  deleteProfilePhoto
);

/* =========================
   PORTFOLIO
========================= */

router.post(
  "/portfolio",
  auth,
  role("provider"),
  upload.single("image"),
  uploadPortfolioImage
);

router.get(
  "/portfolio",
  auth,
  role("provider"),
  async (req, res) => {

    try {

      const provider = await Provider.findOne({
        userId: req.user.id
      });

      if (!provider) {
        return res.status(404).json({
          error: "Provider profile not found"
        });
      }

      res.set("Cache-Control", "no-store");

      res.json(provider.portfolio);

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);

router.delete(
  "/portfolio/:imageId",
  auth,
  role("provider"),
  async (req, res) => {

    try {

      const provider = await Provider.findOne({
        userId: req.user.id
      });

      if (!provider) {
        return res.status(404).json({
          error: "Provider profile not found"
        });
      }

      provider.portfolio = provider.portfolio.filter(
        item => item._id.toString() !== req.params.imageId
      );

      await provider.save();

      res.json({
        message: "Portfolio image deleted",
        portfolio: provider.portfolio
      });

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);

/* =========================
   FILTER OPTIONS
========================= */

router.get("/filters/options", async (req, res) => {

  try {

    const categories = await Provider.distinct("category", { verified: true });
    const cities = await Provider.distinct("city", { verified: true });
    const areas = await Provider.distinct("area", { verified: true });
    const priceTypes = await Provider.distinct("priceType", { verified: true });

    res.json({
      categories,
      cities,
      areas,
      priceTypes
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

/* =========================
   GET MY BOOKINGS
========================= */

router.get(
  "/bookings",
  auth,
  role("provider"),
  async (req, res) => {

    try {

      const profile = await Provider.findOne({
        userId: req.user.id
      });

      if (!profile) {
        return res.status(404).json({
          error: "Provider profile not found"
        });
      }

      const bookings = await Booking.find({
        providerId: profile._id
      })
        .populate("customerId", "name email")
        .sort({ createdAt: -1 });

      res.json(bookings);

    } catch (err) {

      res.status(500).json({ error: err.message });

    }

  }
);

/* =========================
   SEARCH PROVIDERS
========================= */

router.get("/", async (req, res) => {

  try {

    const {
      category,
      city,
      area,
      minPrice,
      maxPrice,
      priceType
    } = req.query;

    const filter = { verified: true };

    if (category) filter.category = category;
    if (city) filter.city = city;
    if (area) filter.area = area;
    if (priceType) filter.priceType = priceType;

    if (minPrice || maxPrice) {
      filter.priceAmount = {};
      if (minPrice) filter.priceAmount.$gte = Number(minPrice);
      if (maxPrice) filter.priceAmount.$lte = Number(maxPrice);
    }

    const providers = await Provider.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(providers);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

/* =========================
   GET PROVIDER BY ID
========================= */

router.get("/:id", async (req, res) => {

  try {

    const provider = await Provider.findById(req.params.id)
      .populate("userId", "name email profileImage");

    if (!provider) {
      return res.status(404).json({
        error: "Provider not found"
      });
    }

    res.json(provider);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

export default router;