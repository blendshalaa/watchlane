import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma";
import prisma from "../db/prisma/client";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    databaseHooks: {
        account: {
            create: {
                after: async (account) => {
                    // Sync the Google ID explicitly onto our User table as requested
                    if (account.providerId === "google") {
                        await prisma.user.update({
                            where: { id: account.userId },
                            data: { googleId: account.accountId }
                        });
                    }
                }
            }
        }
    }
});
