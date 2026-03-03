import { Router } from "express";
import redis from "../utils/redis.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "alive" });
});

router.get("/ready", async (req, res) => {
  try {
    await redis.ping();
    res.status(200).json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "not ready" });
  }
});

export default router;