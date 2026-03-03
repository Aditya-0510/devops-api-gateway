import redis from "./utils/redis.js";
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

export async function killSwitch(req: Request, res: Response, next: NextFunction) {
  const kill = await redis.get("system:kill-switch");

  if (kill === "true") {
    return res.status(503).json({ message: "System disabled" });
  }

  next();
}