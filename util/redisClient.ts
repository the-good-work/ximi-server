import { createClient } from "redis";
import { config } from "dotenv";
import { XIMI } from "../types/room";

config();

export const client = createClient({
  url: process.env.REDIS_URL,
});

export async function storeRoom(roomName: string, room: XIMI.Room) {
  await client.connect();
  await client.set(roomName, JSON.stringify(room));
}
