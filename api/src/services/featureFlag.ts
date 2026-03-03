import redis from "../utils/redis.js";

export async function setFeature(name: string, enabled: boolean) {
  await redis.set(`feature:${name}`, enabled.toString());
}

export async function isFeatureEnabled(name: string) {
  const value = await redis.get(`feature:${name}`);
  return value === "true";
}