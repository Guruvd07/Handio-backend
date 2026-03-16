import express from "express";
import { createReview, getProviderReviews } from "../controllers/reviewController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

/* CREATE REVIEW */
router.post("/", auth, createReview);

/* GET REVIEWS FOR PROVIDER */
router.get("/provider/:providerId", getProviderReviews);

export default router;