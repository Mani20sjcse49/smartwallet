import { Router } from "express";
import { canAfford, chatWithAdvisor, getFinanceNews } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/chat", requireAuth, chatWithAdvisor);
router.post("/can-afford", requireAuth, canAfford);
router.get("/news", requireAuth, getFinanceNews);

export default router;
