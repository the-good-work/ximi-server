import {
  RoomServiceClient,
  AccessToken,
  DataPacket_Kind,
} from "livekit-server-sdk";
import type { VideoGrant, AccessTokenOptions } from "livekit-server-sdk";
import { config } from "dotenv";
import {
  Participant,
  ParticipantMetadata,
  ParticipantOutput,
  ParticipantPerformer,
} from "@thegoodwork/ximi-types";
import { getRoom } from "./redisClient";
import { ServerUpdate } from "@thegoodwork/ximi-types/src/room";

config();

const svc = new RoomServiceClient(
  process.env.LIVEKIT_HOST,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

export const roomServiceClient = svc;

export async function listRooms() {
  return await roomServiceClient.listRooms();
}

export async function getAllParticipants() {
  const rooms = await listRooms();
  const pAllParticipants = rooms.map((room) => {
    return roomServiceClient.listParticipants(room.name);
  });
  const allParticipants = (await Promise.all(pAllParticipants)).reduce(
    (p, c) => [...p, ...c],
    []
  );
  return allParticipants;
}

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
  let updatePayload: ServerUpdate;

  switch (type) {
    // publish to all CONTROL
    case "CONTROL": {
      updatePayload = {
        type: "room-update",
        update: {
          participants: room.participants,
          currentSetting: room.currentSetting,
          currentPreset: room.currentPreset,
          presets: room.presets,
        },
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
      updatePayload = {
        type: "performer-update",
        update: room.participants.find(
          (participant: Participant) => participant.name === participantName
        ) as ParticipantPerformer,
      };
      if (updatePayload) targetSid.push(updatePayload.update.sid);
      break;
    }
    // publish to relevant OUTPUT only
    case "OUTPUT": {
      const participantOutput = room.participants.find(
        (participant: Participant) => participant.name === participantName
      ) as ParticipantOutput;

      const participantPerformer = room.participants.find(
        (participant: Participant) =>
          participant.name === participantOutput.target
      ) as ParticipantPerformer;

      updatePayload = {
        type: "output-update",
        update: {
          output: participantOutput,
          performer: participantPerformer,
        },
      };
      let outputData = room.participants.find(
        (participant: any) => participant.target === participantName
      ) as ParticipantOutput;
      if (outputData) targetSid.push(outputData.sid);
      break;
    }
  }

  const encoder = new TextEncoder();
  const payload = encoder.encode(JSON.stringify(updatePayload));

  roomServiceClient.sendData(
    roomName,
    payload,
    DataPacket_Kind.RELIABLE,
    targetSid
  );
}
