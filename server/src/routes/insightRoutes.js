import { Router } from "express";
import { getInsights } from "../controllers/insightController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, getInsights);

export default router;
