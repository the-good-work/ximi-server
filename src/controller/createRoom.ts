import { generateName, generatePasscode } from "../util/roomGenerator";
import { storeRoom, getAllRooms } from "../util/redisClient";
import {
  checkRoom,
  generateToken,
  roomServiceClient,
} from "../util/livekitClient";
import { Room } from "@thegoodwork/ximi-types";
import { ErrorTypeResponse } from "@thegoodwork/ximi-types";

const createRoom = async (roomName: string, passcode: string) => {
  let errorType: ErrorTypeResponse;
  const controllerId = "CONTROL-" + roomName + "-1";
  const room: Room = {
    name: roomName,
    passcode,
    participants: [],
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
  const token = await generateToken(roomName, "CONTROL", controllerId);

  return {
    token,
  };
};

export { createRoom };
