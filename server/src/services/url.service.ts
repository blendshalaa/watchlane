import prisma from "../db/prismaClient";
import { CreateUrlBody, UpdateUrlBody } from "../types";
import { AppError } from "../utils/AppError";

export async function createMonitoredUrl(
    userId: string,
    data: CreateUrlBody
): Promise<{
    id: string;
    url: string;
    label: string | null;
    checkIntervalHours: number;
    isActive: boolean;
    createdAt: Date;
}> {
    try {
        new URL(data.url);
    } catch {
        throw new AppError("Invalid URL format", 400);
    }

    const monitoredUrl = await prisma.monitoredUrl.create({
        data: {
            url: data.url,
            label: data.label ?? null,
            checkIntervalHours: data.checkIntervalHours ?? 6,
            userId,
        },
        select: {
            id: true,
            url: true,
            label: true,
            checkIntervalHours: true,
            isActive: true,
            createdAt: true,
        },
    });

    return monitoredUrl;
}

export async function getUserUrls(userId: string) {
    const urls = await prisma.monitoredUrl.findMany({
        where: { userId },
        select: {
            id: true,
            url: true,
            label: true,
            checkIntervalHours: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            _count: { select: { snapshots: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return urls;
}

export async function getUrlById(userId: string, urlId: string) {
    const url = await prisma.monitoredUrl.findFirst({
        where: { id: urlId, userId },
        include: {
            snapshots: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                    id: true,
                    contentHash: true,
                    diff: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!url) {
        throw new AppError("Monitored URL not found", 404);
    }

    return url;
}

export async function updateUrl(
    userId: string,
    urlId: string,
    data: UpdateUrlBody
) {
    const existing = await prisma.monitoredUrl.findFirst({
        where: { id: urlId, userId },
    });

    if (!existing) {
        throw new AppError("Monitored URL not found", 404);
    }

    if (data.url) {
        try {
            new URL(data.url);
        } catch {
            throw new AppError("Invalid URL format", 400);
        }
    }

    const updated = await prisma.monitoredUrl.update({
        where: { id: urlId },
        data: {
            ...(data.url !== undefined && { url: data.url }),
            ...(data.label !== undefined && { label: data.label }),
            ...(data.checkIntervalHours !== undefined && {
                checkIntervalHours: data.checkIntervalHours,
            }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        select: {
            id: true,
            url: true,
            label: true,
            checkIntervalHours: true,
            isActive: true,
            updatedAt: true,
        },
    });

    return updated;
}

export async function deleteUrl(userId: string, urlId: string): Promise<void> {
    const existing = await prisma.monitoredUrl.findFirst({
        where: { id: urlId, userId },
    });

    if (!existing) {
        throw new AppError("Monitored URL not found", 404);
    }

    await prisma.monitoredUrl.delete({ where: { id: urlId } });
}

export async function getUrlSnapshots(
    userId: string,
    urlId: string,
    page = 1,
    limit = 20
) {
    const existing = await prisma.monitoredUrl.findFirst({
        where: { id: urlId, userId },
    });

    if (!existing) {
        throw new AppError("Monitored URL not found", 404);
    }

    const skip = (page - 1) * limit;

    const [snapshots, total] = await Promise.all([
        prisma.snapshot.findMany({
            where: { monitoredUrlId: urlId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            select: {
                id: true,
                contentHash: true,
                diff: true,
                createdAt: true,
            },
        }),
        prisma.snapshot.count({ where: { monitoredUrlId: urlId } }),
    ]);

    return {
        snapshots,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
