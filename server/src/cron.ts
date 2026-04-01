import cron from "node-cron";
import prisma from "./db/prisma/client.js";
import { checkUrl } from "./services/monitor.service.js";

let isRunning = false;

async function runMonitorCheck(): Promise<void> {
    if (isRunning) {
        console.log("[Cron] Previous check still running, skipping this tick");
        return;
    }

    isRunning = true;
    console.log(`[Cron] Starting monitor check at ${new Date().toISOString()}`);

    try {
        // Find all active URLs that are due for a check
        const urls = await prisma.monitoredUrl.findMany({
            where: { isActive: true },
            include: {
                snapshots: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { createdAt: true },
                },
            },
        });

        const now = new Date();
        const urlsDueForCheck = urls.filter((url: typeof urls[number]) => {
            const lastSnapshot = url.snapshots[0];
            if (!lastSnapshot) return true; // Never checked

            const hoursSinceLastCheck =
                (now.getTime() - lastSnapshot.createdAt.getTime()) / (1000 * 60 * 60);

            return hoursSinceLastCheck >= url.checkIntervalHours;
        });

        console.log(
            `[Cron] ${urlsDueForCheck.length} of ${urls.length} URLs due for check`
        );

        // Process URLs sequentially to avoid overwhelming the browser
        for (const url of urlsDueForCheck) {
            try {
                const result = await checkUrl(url.id);
                if (result.changed) {
                    console.log(`[Cron] ✅ Change detected: ${url.url}`);
                }
            } catch (error) {
                console.error(
                    `[Cron] Error checking ${url.url}:`,
                    error instanceof Error ? error.message : error
                );
            }
        }

        console.log(`[Cron] Monitor check complete`);
    } catch (error) {
        console.error("[Cron] Fatal cron error:", error);
    } finally {
        isRunning = false;
    }
}

export function startCronScheduler(): void {
    // Run every hour at minute 0
    cron.schedule("0 * * * *", () => {
        void runMonitorCheck();
    });

    console.log("[Cron] Scheduler started — runs every hour at :00");
}

// Export for manual triggering (useful for testing)
export { runMonitorCheck };
