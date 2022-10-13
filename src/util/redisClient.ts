import { createClient } from "redis";
import { config } from "dotenv";
import { Room } from "@thegoodwork/ximi-types";

config();

export const client = createClient({
  url: process.env.REDIS_URL,
  database: 1,
});

export async function storeRoom(roomName: string, room: Room) {
  await client.connect();
  await client.set(roomName, JSON.stringify(room));
  await client.disconnect();
}

export async function getRoom(roomName: string) {
  await client.connect();
  const roomData = JSON.parse(await client.get(roomName));
  await client.disconnect();

  return roomData;
}

export async function getAllRooms() {
  await client.connect();
  const list = await client.keys("*");
  const result = await Promise.all(
    list.map(async (key) => {
      const room = JSON.parse(await client.get(key));
      return room;
    })
  );
  await client.disconnect();
  return result;
}
