import { Request } from "express";

export interface AuthPayload {
    id: string;
    email: string;
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
}

export interface CreateUrlBody {
    url: string;
    label?: string;
    checkIntervalHours?: number;
}

export interface UpdateUrlBody {
    url?: string;
    label?: string;
    checkIntervalHours?: number;
    isActive?: boolean;
}

export interface EnvConfig {
    DATABASE_URL: string;
    RESEND_API_KEY: string;
    RESEND_FROM_EMAIL: string;
    CRON_INTERVAL_HOURS: number;
    PORT: number;
    NODE_ENV: string;
    DIRECT_URL?: string;
}
