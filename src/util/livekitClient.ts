import { RoomServiceClient, AccessToken } from "livekit-server-sdk";
import type { VideoGrant, AccessTokenOptions } from "livekit-server-sdk";
import { config } from "dotenv";
import {
  Participant,
  ParticipantMetadata,
  UpdateStatePayload,
} from "@thegoodwork/ximi-types";

config();

const svc = new RoomServiceClient(
  process.env.LIVEKIT_HOST,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

export const roomServiceClient = svc;

export async function checkRoom(roomName: string) {
  const existingRooms = await roomServiceClient.listRooms();
  console.log(existingRooms);
  const hasMatchingRoom =
    existingRooms.findIndex((room) => {
      return room.name === roomName;
    }) > 0;
  return hasMatchingRoom;
}
export async function generateToken(data: {
  roomName: string;
  type: Participant["type"];
  identity: string;
  performer_target?: string;
}) {
  let tokenPermission: VideoGrant;
  let tokenOptions: AccessTokenOptions;
  let metadata: ParticipantMetadata;
  if (data.type === "CONTROL") {
    tokenPermission = {
      roomCreate: true,
      roomJoin: true,
      roomList: true,
      roomAdmin: true,
    };
    metadata = { type: data.type };
  } else if (data.type === "OUTPUT") {
    tokenPermission = {
      roomJoin: true,
    };
    metadata = { type: data.type, target: data.performer_target };
  } else if (data.type === "PERFORMER") {
    tokenPermission = {
      roomJoin: true,
    };
    metadata = { type: data.type };
  }
  tokenPermission.room = data.roomName;
  tokenOptions = {
    identity: data.identity,
    metadata: JSON.stringify(metadata),
  };

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    tokenOptions
  );
  token.addGrant(tokenPermission);

  return token.toJwt();
}

export async function publishState(room: string, data: UpdateStatePayload) {
  const encoder = new TextEncoder();
  const payload = encoder.encode(JSON.stringify(data));
  console.log("payload: ", payload);

  roomServiceClient.sendData(room, payload, 0);
}
