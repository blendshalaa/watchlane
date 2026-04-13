import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../db/prisma/client.js";

let baseURL = process.env.BETTER_AUTH_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";

// Robust check for Render environment and placeholder values
if (process.env.NODE_ENV === "production" && (!baseURL.startsWith("http") || baseURL.includes("this-is-my-watch"))) {
    baseURL = "https://watchlane-dashboard.onrender.com";
}

// Remove trailing slash to prevent double slashes in Better Auth paths
baseURL = baseURL.replace(/\/$/, "");

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL,
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    secret: process.env.BETTER_AUTH_SECRET as string,
    databaseHooks: {
        account: {
            create: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                after: async (account: any) => {
                    try {
                        // Sync the Google ID explicitly onto our User table as requested
                        if (account.providerId === "google") {
                            await prisma.user.update({
                                where: { id: account.userId },
                                data: { googleId: account.accountId }
                            });
                        }
                    } catch (hookError) {
                        console.error("[Auth Hook] Error syncing Google ID:", hookError);
                        // We don't throw here to avoid blocking sign-in if just the hook fails
                    }
                }
            }
        }
    }
});
