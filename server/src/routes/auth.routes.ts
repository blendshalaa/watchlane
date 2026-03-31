import { Router } from "express";
import { authenticateJwt } from "../middleware/authMiddleware";
import * as authController from "../controllers/auth.controller";

const router = Router();

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/api-key (requires JWT)
router.post("/api-key", authenticateJwt, authController.createApiKey);

export default router;
