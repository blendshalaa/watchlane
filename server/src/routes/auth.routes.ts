import { Router } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = Router();

// /api/auth/google -> Alias to start the Google OAuth flow natively
router.get("/google", (req, res) => {
    res.redirect("/api/auth/sign-in/social?provider=google");
});

// /api/auth/callback -> Fallback alias for callback visibility
router.get("/callback", (req, res) => {
    res.redirect("/api/auth/callback/google");
});

// /api/auth/me -> Gets the active session user
router.get("/me", async (req, res) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (!session) {
            return res.status(401).json({ success: false, error: "Not logged in" });
        }

        res.status(200).json({ success: true, user: session.user });
    } catch (error) {
        res.status(500).json({ success: false, error: "Error retrieving session" });
    }
});

// /api/auth/logout -> Alias to natively trigger Better Auth standard sign-out
router.post("/logout", (req, res) => {
    // A 307 preserves the POST method when redirecting to Better Auth's native logout endpoint
    res.redirect(307, "/api/auth/sign-out");
});

export default router;
