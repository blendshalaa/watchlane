import { Response, NextFunction } from "express";
import { AuthRequest, CreateUrlBody, UpdateUrlBody } from "../types";
import { AppError } from "../utils/AppError";
import * as urlService from "../services/url.service";

export async function createUrl(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const body = req.body as CreateUrlBody;
        if (!body.url) {
            throw new AppError("URL is required", 400);
        }

        const monitoredUrl = await urlService.createMonitoredUrl(
            req.user.userId,
            body
        );

        res.status(201).json({
            success: true,
            data: monitoredUrl,
        });
    } catch (error) {
        next(error);
    }
}

export async function listUrls(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const urls = await urlService.getUserUrls(req.user.userId);

        res.status(200).json({
            success: true,
            data: urls,
        });
    } catch (error) {
        next(error);
    }
}

export async function getUrl(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const url = await urlService.getUrlById(req.user.userId, req.params.id as string);

        res.status(200).json({
            success: true,
            data: url,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateUrl(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const body = req.body as UpdateUrlBody;
        const url = await urlService.updateUrl(
            req.user.userId,
            req.params.id as string,
            body
        );

        res.status(200).json({
            success: true,
            data: url,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteUrl(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        await urlService.deleteUrl(req.user.userId, req.params.id as string);

        res.status(200).json({
            success: true,
            message: "URL deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}

export async function getSnapshots(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await urlService.getUrlSnapshots(
            req.user.userId,
            req.params.id as string,
            page,
            limit
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}
