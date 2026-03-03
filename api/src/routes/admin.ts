import { Router } from "express";
import redis from "../utils/redis.js";
import { setFeature } from "../services/featureFlag.js";

const router = Router();

router.post("/feature-flag", async (req, res) => {
  const { name, enabled } = req.body;
  await setFeature(name, enabled);
  res.json({ message: "Feature updated" });
});

router.post("/kill-switch", async (req, res) => {
  const { enabled } = req.body;
  await redis.set("system:kill-switch", enabled.toString());
  res.json({ message: "Kill switch updated" });
});

export default router;