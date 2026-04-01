import { Router } from "express";
import { authenticateJwt } from "../middleware/auth.middleware.js";
import * as urlController from "../controllers/url.controller.js";

const router = Router();

// All URL routes require session authentication
router.use(authenticateJwt);

// POST /api/urls — Add a URL to monitor
router.post("/", urlController.createUrl);

// GET /api/urls — List all monitored URLs
router.get("/", urlController.listUrls);

// GET /api/urls/:id — Get single URL + latest snapshot
router.get("/:id", urlController.getUrl);

// PATCH /api/urls/:id — Update URL settings
router.patch("/:id", urlController.updateUrl);

// DELETE /api/urls/:id — Remove URL
router.delete("/:id", urlController.deleteUrl);

// GET /api/urls/:id/snapshots — List snapshots
router.get("/:id/snapshots", urlController.getSnapshots);

export default router;
