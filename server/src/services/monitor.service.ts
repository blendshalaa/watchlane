import crypto from "crypto";
import prisma from "../db/prismaClient";
import { scrapeUrl } from "./scraper.service";
import { computeDiff } from "./diff.service";
import { sendChangeAlert } from "./email.service";

export async function checkUrl(monitoredUrlId: string): Promise<{
    changed: boolean;
    snapshotId: string | null;
}> {
    const monitoredUrl = await prisma.monitoredUrl.findUnique({
        where: { id: monitoredUrlId },
        include: {
            user: { select: { email: true } },
            snapshots: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    if (!monitoredUrl) {
        console.warn(`[Monitor] URL ${monitoredUrlId} not found, skipping`);
        return { changed: false, snapshotId: null };
    }

    console.log(`[Monitor] Checking: ${monitoredUrl.url}`);

    let contentText: string;
    try {
        contentText = await scrapeUrl(monitoredUrl.url);
    } catch (error) {
        console.error(
            `[Monitor] Failed to scrape ${monitoredUrl.url}:`,
            error instanceof Error ? error.message : error
        );
        return { changed: false, snapshotId: null };
    }

    const contentHash = crypto
        .createHash("sha256")
        .update(contentText)
        .digest("hex");

    const previousSnapshot = monitoredUrl.snapshots[0] ?? null;

    // First snapshot — just store it, no diff
    if (!previousSnapshot) {
        const snapshot = await prisma.snapshot.create({
            data: {
                monitoredUrlId: monitoredUrl.id,
                contentHash,
                contentText,
                diff: null,
            },
        });

        console.log(`[Monitor] First snapshot stored for ${monitoredUrl.url}`);
        return { changed: false, snapshotId: snapshot.id };
    }

    // No change
    if (previousSnapshot.contentHash === contentHash) {
        console.log(`[Monitor] No change for ${monitoredUrl.url}`);
        return { changed: false, snapshotId: null };
    }

    // Content changed — compute diff
    const diffResult = computeDiff(
        previousSnapshot.contentText,
        contentText,
        monitoredUrl.url
    );

    const snapshot = await prisma.snapshot.create({
        data: {
            monitoredUrlId: monitoredUrl.id,
            contentHash,
            contentText,
            diff: diffResult.patch,
        },
    });

    console.log(
        `[Monitor] Change detected for ${monitoredUrl.url}: +${diffResult.addedLines} / -${diffResult.removedLines} lines`
    );

    // Send email alert
    await sendChangeAlert(
        monitoredUrl.user.email,
        monitoredUrl.url,
        monitoredUrl.label,
        diffResult
    );

    return { changed: true, snapshotId: snapshot.id };
}
