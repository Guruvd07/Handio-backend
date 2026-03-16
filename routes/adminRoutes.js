import express from "express";
import auth from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import { verifyProvider } from "../controllers/adminController.js";
import Provider from "../models/ProviderProfile.js";

const router = express.Router();

/* VERIFY PROVIDER */
router.patch(
  "/verify/:id",
  auth,
  role("admin"),
  verifyProvider
);

/* LIST ALL PROVIDERS */
router.get(
  "/providers",
  auth,
  role("admin"),
  async (req, res) => {
    const providers = await Provider.find()
      .populate("userId", "name email");

    res.json(providers);
  }
);

export default router;