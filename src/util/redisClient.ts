import { config } from "dotenv";
import { Room } from "@thegoodwork/ximi-types";
import Redis from "ioredis";

config();

const redis = new Redis(process.env.REDIS_URL);

export async function storeRoom(roomName: string, room: Room) {
  redis.set(roomName, JSON.stringify(room));
}

export async function getRoom(roomName: string) {
  const roomData = JSON.parse(await redis.get(roomName));

  return roomData;
}

export async function getAllRooms() {
  const list = await redis.keys("*");
  const result = await Promise.all(
    list.map(async (key) => {
      const room = JSON.parse(await redis.get(key));
      return room;
    })
  );
  return result;
}
