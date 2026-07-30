import express from "express";
import { register, login } from "../controllers/authController.js";

import auth from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   AUTH
========================= */

router.post("/register", register);
router.post("/login", login);

/* =========================
   UPLOAD PROFILE PHOTO
========================= */

router.post(
  "/upload-profile-photo",
  auth,
  upload.single("image"),
  async (req, res) => {

    try {

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          error: "User not found"
        });
      }

      user.profileImage = req.file.path;

      await user.save();

      res.json({
        message: "Profile photo uploaded",
        profileImage: user.profileImage
      });

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);

export default router;