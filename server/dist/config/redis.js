import { createClient } from "redis";
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
// Create client with full type
const client = createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
});
client.on("connect", () => console.log("✅ Redis connected"));
client.on("error", (err) => console.error("❌ Redis error:", err));
// Immediately connect and guarantee it's ready
export const redis = await client.connect()
    .then(() => client)
    .catch((err) => {
    console.error("Failed to connect Redis:", err);
    process.exit(1);
});
//# sourceMappingURL=redis.js.map