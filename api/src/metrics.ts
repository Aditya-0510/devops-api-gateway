import * as client from "prom-client";

client.collectDefaultMetrics();

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"]
});

export const cacheHitsTotal = new client.Counter({
  name: "cache_hits_total",
  help: "Total cache hits"
});

export const cacheMissesTotal = new client.Counter({
  name: "cache_misses_total",
  help: "Total cache misses"
});

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Request duration in seconds",
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2]
});

export default client;