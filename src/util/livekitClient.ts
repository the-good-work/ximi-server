import {
  RoomServiceClient,
  AccessToken,
  WebhookReceiver,
} from "livekit-server-sdk";
import type { VideoGrant, AccessTokenOptions } from "livekit-server-sdk";
import { config } from "dotenv";
import { Participant } from "@thegoodwork/ximi-types";

config();

const svc = new RoomServiceClient(
  process.env.LIVEKIT_HOST,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);
const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

export const roomServiceClient = svc;

export async function checkRoom(roomName: string) {
  const existingRooms = await roomServiceClient.listRooms();

  const hasMatchingRoom =
    existingRooms.findIndex((room) => {
      return room.name === roomName;
    }) > 0;

  return hasMatchingRoom;
}
export async function generateToken(
  roomName: string,
  type: Participant["type"],
  identity: string
) {
  let tokenPermission: VideoGrant;
  let tokenOptions: AccessTokenOptions;
  if (type === "CONTROL") {
    tokenPermission = {
      roomCreate: true,
      roomJoin: true,
      roomList: true,
      roomAdmin: true,
    };
  } else if (type === "PERFORMER") {
    tokenPermission = {
      roomJoin: true,
    };
  }
  tokenPermission.room = roomName;
  tokenOptions = { identity, metadata: type };

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    tokenOptions
  );
  token.addGrant(tokenPermission);

  return token.toJwt();
}

export async function webhookReceiver(req: any) {
  const event = receiver.receive(req.body, req.get("Authorization"));
  console.log("event payload: ", event);

  return event;
}
