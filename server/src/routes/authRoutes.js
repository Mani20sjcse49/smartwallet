import { Router } from "express";
import { login, register, socialAuth } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/social", socialAuth);

export default router;
