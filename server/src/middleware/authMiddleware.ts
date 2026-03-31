import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db/prismaClient";
import { AuthPayload, AuthRequest } from "../types";
import { AppError } from "../utils/AppError";
import { config } from "../utils/config";

export function authenticateJwt(
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new AppError("Missing or malformed Authorization header", 401);
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, config.JWT_SECRET) as AuthPayload;

        req.user = { userId: decoded.userId, email: decoded.email };
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError("Invalid or expired token", 401));
        }
    }
}

export async function authenticateApiKey(
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const apiKey = req.headers["x-api-key"];
        if (!apiKey || typeof apiKey !== "string") {
            throw new AppError("Missing x-api-key header", 401);
        }

        const keyRecord = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { user: true },
        });

        if (!keyRecord) {
            throw new AppError("Invalid API key", 401);
        }

        req.user = { userId: keyRecord.user.id, email: keyRecord.user.email };
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError("API key authentication failed", 500));
        }
    }
}
