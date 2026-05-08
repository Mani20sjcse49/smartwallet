import { Router } from "express";
import { getDashboard, sendTestReport, updatePreferences } from "../controllers/walletController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/dashboard", requireAuth, getDashboard);
router.patch("/preferences", requireAuth, updatePreferences);
router.post("/reports/test", requireAuth, sendTestReport);

export default router;
