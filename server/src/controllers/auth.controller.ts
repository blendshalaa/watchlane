import { Response, NextFunction } from "express";
import { AuthRequest, RegisterBody, LoginBody } from "../types";
import { AppError } from "../utils/AppError";
import * as authService from "../services/auth.service";

export async function register(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { email, password } = req.body as RegisterBody;

        if (!email || !password) {
            throw new AppError("Email and password are required", 400);
        }

        const user = await authService.registerUser(email, password);

        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

export async function login(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { email, password } = req.body as LoginBody;

        if (!email || !password) {
            throw new AppError("Email and password are required", 400);
        }

        const result = await authService.loginUser(email, password);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export async function createApiKey(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const apiKey = await authService.generateApiKey(req.user.userId);

        res.status(201).json({
            success: true,
            data: apiKey,
        });
    } catch (error) {
        next(error);
    }
}
