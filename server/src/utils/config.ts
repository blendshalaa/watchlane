import dotenv from "dotenv";
import { EnvConfig } from "../types.js";

dotenv.config();

function getEnvVar(key: string, fallback?: string): string {
    const value = process.env[key] ?? fallback;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const config: EnvConfig = {
    DATABASE_URL: getEnvVar("DATABASE_URL"),
    RESEND_API_KEY: getEnvVar("RESEND_API_KEY"),
    RESEND_FROM_EMAIL: getEnvVar("RESEND_FROM_EMAIL", "onboarding@resend.dev"),
    CRON_INTERVAL_HOURS: parseInt(getEnvVar("CRON_INTERVAL_HOURS", "1"), 10),
    PORT: parseInt(getEnvVar("PORT", "3000"), 10),
    NODE_ENV: getEnvVar("NODE_ENV", "development"),
    DIRECT_URL: process.env.DIRECT_URL,
};
