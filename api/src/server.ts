import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import CircuitBreaker from "opossum";

import redisClient from "./utils/redis.js";

import client, {
  httpRequestsTotal,
  cacheHitsTotal,
  cacheMissesTotal,
  httpRequestDuration
} from "./metrics.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

/* =========================
   METRICS MIDDLEWARE
========================= */

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });

    end();
  });

  next();
});

/* =========================
   GLOBAL KILL SWITCH
========================= */

app.use(async (req, res, next) => {
  try {
    const kill = await redisClient.get("system:kill-switch");

    if (kill === "true") {
      return res.status(503).json({
        message: "System temporarily disabled"
      });
    }

    next();
  } catch {
    next();
  }
});

/* =========================
   RATE LIMITER
========================= */

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

app.use("/price", limiter);

/* =========================
   HEALTH & READINESS
========================= */

app.get("/health", (_, res) => {
  res.json({ status: "alive" });
});

app.get("/ready", async (_, res) => {
  try {
    await redisClient.ping();
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "not ready" });
  }
});

/* =========================
   PROMETHEUS METRICS
========================= */

app.get("/metrics", async (_, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

/* =========================
   ADMIN CONTROLS
========================= */

app.post("/admin/feature-flag", async (req, res) => {
  const { name, enabled } = req.body;

  await redisClient.set(`feature:${name}`, enabled.toString());

  res.json({ message: "Feature updated" });
});

app.post("/admin/kill-switch", async (req, res) => {
  const { enabled } = req.body;

  await redisClient.set("system:kill-switch", enabled.toString());

  res.json({ message: "Kill switch updated" });
});

/* =========================
   CIRCUIT BREAKER
========================= */

async function fetchPrice(coin: string) {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
  );

  return response.data;
}

const breaker = new CircuitBreaker(fetchPrice, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
});

/* =========================
   PRICE ENDPOINT
========================= */

app.get("/price/:coin", async (req, res) => {
  const coin = req.params.coin.toLowerCase();
  const cacheKey = `price:${coin}`;

  try {
    // Feature flag check
    const featureEnabled = await redisClient.get("feature:price-api");

    if (featureEnabled !== "true") {
      return res.status(503).json({
        message: "Price API disabled"
      });
    }

    // Check cache
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      cacheHitsTotal.inc();

      return res.json({
        coin,
        price_usd: JSON.parse(cached),
        source: "cache"
      });
    }

    cacheMissesTotal.inc();

    // Call external API via circuit breaker
    const response = await breaker.fire(coin);

    const price = response[coin]?.usd;

    if (!price) {
      return res.status(404).json({ error: "Coin not found" });
    }

    // Cache result for 30 seconds
    await redisClient.set(cacheKey, JSON.stringify(price), {
      EX: 30
    });

    res.json({
      coin,
      price_usd: price,
      source: "api",
      instance: process.env.HOSTNAME
    });

  } catch (error) {
    res.status(503).json({
      error: "External service unavailable"
    });
  }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});