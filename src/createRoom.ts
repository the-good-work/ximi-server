import { generateName, generatePasscode } from "./util/roomGenerator";
import { storeRoom } from "./util/redisClient";
import {
  checkRoom,
  generateToken,
  roomServiceClient,
} from "./util/livekitClient";
import type { XIMI } from "../types/room";

const createRoom = async () => {
  const roomName = await generateName();
  const passcode = await generatePasscode();
  const room: XIMI.Room = {
    name: roomName,
    passcode,
    participants: [
      { name: "user1", type: "control" },
      { name: "user2", type: "output" },
    ],
  };

  if (await checkRoom(roomName)) {
    return { message: "already exist" };
  }

  await roomServiceClient.createRoom({ name: roomName });
  await storeRoom(roomName, room);
  const token = await generateToken(roomName, "CONTROLLER1");

  return {
    roomName,
    passcode,
    token,
  };
};

export { createRoom };
