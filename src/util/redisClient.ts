import { createClient } from "redis";
import { config } from "dotenv";
import { XIMI } from "../../types/room";

config();

export const client = createClient({
  url: process.env.REDIS_URL,
  database: 1,
});

export async function storeRoom(roomName: string, room: XIMI.Room) {
  await client.connect();
  await client.set(roomName, JSON.stringify(room));
  await client.disconnect();
}

export async function getRooms() {
  await client.connect();
  const list = await client.keys("*");
  const result = await Promise.all(
    list.map(async (key) => {
      const room = JSON.parse(await client.get(key));
      return { room: key, participants: room.participants.length };
    })
  );
  await client.disconnect();
  return result;
}
