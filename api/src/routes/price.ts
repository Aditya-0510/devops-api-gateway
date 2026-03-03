import { Router } from "express";
import { breaker } from "../services/circuitBreaker.js";
import { isFeatureEnabled } from "../services/featureFlag.js";

const router = Router();

router.get("/:coin", async (req, res) => {
  const enabled = await isFeatureEnabled("price-api");

  if (!enabled) {
    return res.status(503).json({ message: "Feature disabled" });
  }

  try {
    const data = await breaker.fire(req.params.coin);
    res.json(data);
  } catch {
    res.status(503).json({ message: "External service unavailable" });
  }
});

export default router;