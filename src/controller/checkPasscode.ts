import { getRoom, storeRoom } from "../util/redisClient";
import { generateToken } from "../util/livekitClient";
import { Participant } from "@thegoodwork/ximi-types";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 5 });

const checkPasscode = async (params: {
  room_name: string;
  participant_type: Participant["type"];
  participant_name?: string;
  performer_target?: string;
  passcode: string;
}) => {
  const room = await getRoom(params.room_name);

  if (!room) {
    const type = "ROOM_NOT_EXIST";
    throw Error(type);
  }

  if (room.passcode !== params.passcode) {
    const type = "INCORRECT_PASSCODE";
    throw Error(type);
  }

  if (params.participant_type === "CONTROL") {
    params.participant_name = `CONTROL-${
      params.room_name
    }-${uid().toUpperCase()}`;
  } else if (params.participant_type === "OUTPUT") {
    params.participant_name = `OUTPUT-${
      params.room_name
    }-${uid().toUpperCase()}`;
  }

  await storeRoom(params.room_name, room);

  const data = {
    roomName: params.room_name,
    type: params.participant_type,
    identity: params.participant_name,
    performer_target: params.performer_target,
  };
  const token = await generateToken(data);

  return token;
};

export { checkPasscode };
