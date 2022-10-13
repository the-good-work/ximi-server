import { getRoom } from "../util/redisClient";
import { generateToken } from "../util/livekitClient";
import { Participant } from "@thegoodwork/ximi-types";

const checkPasscode = async (
  roomName: string,
  participantName: string,
  participantType: Participant["type"],
  passcode: string
) => {
  const room = await getRoom(roomName);
  if (!room) {
    const type = "ROOM_NOT_EXIST";
    throw Error(type);
  }

  if (room.passcode !== passcode) {
    const type = "INCORRECT_PASSCODE";
    throw Error(type);
  }

  const token = await generateToken(roomName, participantType, participantName);

  return token;
};

export { checkPasscode };
