import { createClient } from "redis";

const client = createClient({
  url: "redis://livekit.ximi.server:6379",
});

client.on("error", (err) => console.log("Redis Client Error", err));

init();

async function init() {
  await client.connect();

  await client.set("key", "value");
  const value = await client.get("key");
}

export = { redisClient: client };
