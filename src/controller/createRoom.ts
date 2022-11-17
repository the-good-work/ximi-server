import { storeRoom, getAllRooms } from "../util/redisClient";
import {
  checkRoom,
  generateToken,
  roomServiceClient,
} from "../util/livekitClient";
import { Participant, Room } from "@thegoodwork/ximi-types";
import { ErrorType } from "@thegoodwork/ximi-types";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 5 });

const createRoom = async (roomName: string, passcode: string) => {
  let errorType: ErrorType;
  const controllerId = `CONTROL_${roomName}_${uid().toUpperCase()}`;
  const room: Room = {
    name: roomName,
    passcode,
    participants: [],
    currentSetting: [],
    currentPreset: "",
    presets: new Array(12)
      .fill(0)
      .map((_c, n) => ({ index: n, name: "", participants: [] })),
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
  const data: {
    roomName: string;
    type: Participant["type"];
    identity: string;
  } = {
    roomName: roomName,
    type: "CONTROL",
    identity: controllerId,
  };
  const token = await generateToken(data);

  return {
    token,
  };
};

export { createRoom };
