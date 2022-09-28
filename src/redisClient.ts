import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("connect", () => {
  console.log("hooray");
});

client.on("error", (err) => console.log("Redis Client Error", err));

init();

async function init() {
  await client.connect();

  await client.set("key", "value");
  const value = await client.get("key");
  console.log({ value });
}

export = { redisClient: client };
