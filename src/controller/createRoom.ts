import { generateName, generatePasscode } from "../util/roomGenerator";
import { storeRoom, getRooms } from "../util/redisClient";
import {
  checkRoom,
  generateToken,
  roomServiceClient,
} from "../util/livekitClient";
import type { XIMI } from "../../types/room";
import { ErrorTypeResponse } from "../../types/response";

const createRoom = async () => {
  let errorType: ErrorTypeResponse;
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
    errorType = "ROOM_EXIST";
    throw Error(errorType);
  }

  if ((await getRooms()).length >= 10) {
    errorType = "ROOM_MAX";
    throw Error(errorType);
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
