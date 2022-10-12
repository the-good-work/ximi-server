import { generateName, generatePasscode } from "../util/roomGenerator";
import { storeRoom, getAllRooms } from "../util/redisClient";
import {
  checkRoom,
  generateToken,
  roomServiceClient,
} from "../util/livekitClient";
import { Room } from "@thegoodwork/ximi-types";
import { ErrorTypeResponse } from "@thegoodwork/ximi-types";

const createRoom = async () => {
  let errorType: ErrorTypeResponse;
  const roomName = await generateName();
  const passcode = await generatePasscode();
  const room: Room = {
    name: roomName,
    passcode,
    participants: [
      { name: "user3", type: "control" },
      { name: "user4", type: "output" },
    ],
  };

  if (await checkRoom(roomName)) {
    errorType = "ROOM_EXIST";
    throw Error(errorType);
  }

  if ((await getAllRooms()).length >= 10) {
    errorType = "ROOM_MAX";
    throw Error(errorType);
  }

  await roomServiceClient.createRoom({ name: roomName });
  await storeRoom(roomName, room);
  const token = await generateToken(roomName, "CONTROLLER1");

  return {
    // roomName,
    // passcode,
    token,
  };
};

export { createRoom };
