import express from "express";
import { aiSearch } from "../controllers/aiController.js";

const router = express.Router();

// AI Service Search
router.post("/search", aiSearch);

export default router;