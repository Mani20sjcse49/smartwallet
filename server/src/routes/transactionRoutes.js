
import { Router } from "express";
import {
  createTransaction,
  listTransactions,
  parseSmartInput
} from "../controllers/transactionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, listTransactions);
router.post("/", requireAuth, createTransaction);
router.post("/parse", requireAuth, parseSmartInput);

export default router;
