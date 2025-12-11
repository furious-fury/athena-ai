import { createClient, type RedisClientType } from "redis";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Create client with full type
const client: RedisClientType = createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
});

client.on("connect", () => console.log("✅ Redis connected"));
client.on("error", (err) => console.error("❌ Redis error:", err));

// Immediately connect and guarantee it's ready
// Try to connect, but don't crash if it fails (allows running scripts/tests without Redis)
try {
    await client.connect();
} catch (err) {
    console.warn("⚠️ Redis connection failed. Disconnecting to prevent retry loop.");
    await client.disconnect(); // Stop retrying
}

export const redis = client;
