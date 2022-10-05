import { AccessToken } from "livekit-server-sdk";
import type { AccessToken as TAccessToken } from "livekit-server-sdk";
import { XIMI } from "../../types/room";
import { config } from "dotenv";
import { roomServiceClient } from "../util/livekitClient";

config();

const obtainAccessToken = async ({
  roomName,
  participantName,
  participantType,
  action,
}: {
  roomName: string;
  participantName: string;
  participantType: XIMI.Participant["type"];
  action: "createRoom" | "joinRoom" | "joinRoomControl";
}): Promise<{ err: Error } | { accessToken: TAccessToken }> => {
  if (action === "createRoom" && participantType === "control") {
    // make sure room doesn't already exist

    try {
      const existingRooms = await roomServiceClient.listRooms();

      const hasMatchingRoom =
        existingRooms.findIndex((room) => {
          return room.name === roomName;
        }) > 0;

      if (hasMatchingRoom) {
        return { err: Error("Room exists") };
      }

      await roomServiceClient.createRoom({ name: roomName });

      const token = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        { identity: "CONTROL1" }
      );
      token.addGrant({ roomAdmin: true, roomList: true, room: roomName });
      return { accessToken: token };
    } catch (err) {
      return { err: Error("Some error") };
    }
  }

  if (action === "joinRoom" && participantType === "control") {
  }
};

export { obtainAccessToken };

/*
	 function init() {
// if this room doesn't exist, it'll be automatically created when the first
// client joins
const roomName = "name-of-room";
// identifier to be used for participant.
// it's available as LocalParticipant.identity with livekit-client SDK
const participantName = "user-name";

const at = new AccessToken("api-key", "secret-key", {
identity: participantName,
});

at.addGrant({ roomJoin: true, room: roomName });

const token = at.toJwt();
console.log("access token", token);
}
*/
