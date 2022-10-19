import { getRoom } from "../util/redisClient";
import { generateToken } from "../util/livekitClient";
import { Participant } from "@thegoodwork/ximi-types";

const checkPasscode = async (params: {
  room_name: string;
  participant_type: Participant["type"];
  participant_name?: string;
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
    let count = room.controlCount + 1;
    params.participant_name = "CONTROL" + count.toString();
    room.controlCount = count;
  } else if (params.participant_type === "OUTPUT") {
    let count = room.outputCount;
    params.participant_name = "OUTPUT" + (count + 1).toString();
    room.controlCount = count;
  }

  const token = await generateToken(
    params.room_name,
    params.participant_type,
    params.participant_name
  );

  return token;
};

export { checkPasscode };
