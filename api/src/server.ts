import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { createClient } from "redis";

import client, {
  httpRequestsTotal,
  cacheHitsTotal,
  cacheMissesTotal,
  httpRequestDuration
} from "./metrics.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.connect().catch(console.error);

// Metrics middleware
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

// Health
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// Metrics
app.get("/metrics", async (_, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// Price endpoint
app.get("/price/:coin", async (req, res) => {
  const coin = req.params.coin.toLowerCase();
  const cacheKey = `price:${coin}`;

  try {
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

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
    );

    const price = response.data[coin]?.usd;

    if (!price) {
      return res.status(404).json({ error: "Coin not found" });
    }

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
    res.status(500).json({ error: "Internal error" });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});