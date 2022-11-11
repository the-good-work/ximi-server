import { RoomServiceClient, AccessToken } from "livekit-server-sdk";
import type { VideoGrant, AccessTokenOptions } from "livekit-server-sdk";
import { config } from "dotenv";
import {
  Participant,
  ParticipantMetadata,
  ParticipantOutput,
  ParticipantPerformer,
  UpdateStatePayload,
} from "@thegoodwork/ximi-types";
import { getRoom } from "./redisClient";

config();

const svc = new RoomServiceClient(
  process.env.LIVEKIT_HOST,
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

export async function publishState(
  roomName: string,
  type: Participant["type"],
  participantName?: string
) {
  const room = await getRoom(roomName);

  const targetSid: string[] = [];
  let updatePayload: UpdateStatePayload;

  switch (type) {
    // publish to all CONTROL
    case "CONTROL": {
      updatePayload = {
        participants: room.participants,
        currentSetting: room.currentSetting,
        currentPreset: room.currentPreset,
        presets: room.presets,
      };
      room.participants.forEach((participant) => {
        if (participant.type === "CONTROL") {
          targetSid.push(participant.sid);
        }
      });
      break;
    }
    // publish to relevant PERFORMER only
    case "PERFORMER": {
      updatePayload = room.participants.find(
        (participant: Participant) => participant.name === participantName
      ) as ParticipantPerformer;
      if (updatePayload) targetSid.push(updatePayload.sid);
      break;
    }
    // publish to relevant OUTPUT only
    case "OUTPUT": {
      updatePayload = room.participants.find(
        (participant: Participant) => participant.name === participantName
      ) as ParticipantPerformer;
      let outputData = room.participants.find(
        (participant: any) => participant.target === participantName
      ) as ParticipantOutput;
      if (outputData) targetSid.push(outputData.sid);
      break;
    }
  }

  const encoder = new TextEncoder();
  const payload = encoder.encode(JSON.stringify(updatePayload));

  roomServiceClient.sendData(roomName, payload, 1, targetSid);
}
