import express from "express";
import {
  createStream,
  getViewerCount,
} from "../controllers/streamControllers.js";
import { adminOnly, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-stream", verifyToken, adminOnly, createStream);

router.get("/viewers/:id", verifyToken, adminOnly, getViewerCount);

export default router;
