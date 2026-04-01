import { Request, Response, NextFunction, Router } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

declare global {
    namespace Express {
        interface Request {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            user?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            session?: any;
        }
    }
}

/**
 * Checks for a valid Better Auth session.
 * We've aliased it to authenticateJwt temporarily so existing URL routes compile flawlessly.
 */
export const authenticateJwt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (!session) {
            res.status(401).json({ success: false, error: "Unauthorized session" });
            return;
        }

        req.user = session.user;
        req.session = session.session;
        next();
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Auth Middleware Error" });
    }
};
