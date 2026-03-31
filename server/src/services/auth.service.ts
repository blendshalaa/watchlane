import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import prisma from "../db/prismaClient";
import { AuthPayload } from "../types";
import { AppError } from "../utils/AppError";
import { config } from "../utils/config";

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = "7d";

export async function registerUser(
    email: string,
    password: string
): Promise<{ id: string; email: string }> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new AppError("Email already registered", 409);
    }

    if (password.length < 8) {
        throw new AppError("Password must be at least 8 characters", 400);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: { email, passwordHash },
        select: { id: true, email: true },
    });

    return user;
}

export async function loginUser(
    email: string,
    password: string
): Promise<{ token: string; user: { id: string; email: string } }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new AppError("Invalid email or password", 401);
    }

    const payload: AuthPayload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });

    return { token, user: { id: user.id, email: user.email } };
}

export async function generateApiKey(
    userId: string
): Promise<{ id: string; key: string }> {
    const key = `wl_${uuidv4().replace(/-/g, "")}`;

    const apiKey = await prisma.apiKey.create({
        data: { key, userId },
        select: { id: true, key: true },
    });

    return apiKey;
}
