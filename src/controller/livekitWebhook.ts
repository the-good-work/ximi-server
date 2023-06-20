import { deleteRoom, getRoom, storeRoom } from "../util/redisClient";
import { publishState, tick } from "../util/livekitClient";
import { Participant } from "@thegoodwork/ximi-types";
import { WebhookEvent } from "livekit-server-sdk/dist/proto/livekit_webhook";

const livekitWebhook = async (data: WebhookEvent) => {
  const roomName = data.room.name;
  const room = await getRoom(roomName);

  switch (data.event) {
    case "participant_joined": {
      const metadata = JSON.parse(data.participant.metadata);
      const participantType = metadata.type;

      let participantData: Participant;
      if (participantType === "CONTROL") {
        participantData = {
          sid: data.participant.sid,
          name: data.participant.identity,
          type: participantType,
          audioMixMute: [],
        };
      } else if (participantType === "PERFORMER") {
        participantData = {
          sid: data.participant.sid,
          name: data.participant.identity,
          type: participantType,
          audioMixMute: [],
          audioOutDelay: 0,
          video: {
            slots: [
              {
                nickname: data.participant.identity,
                size: { w: 1, h: 1 },
                position: { x: 0, y: 0 },
              },
            ],
            layout: "Default",
          },
        };
      } else if (participantType === "SCOUT") {
        participantData = {
          sid: data.participant.sid,
          name: data.participant.identity,
          type: participantType,
          audioMixMute: [],
          audioOutDelay: 0,
          textPoster: "hello",
        };
      } else if (participantType === "OUTPUT") {
        const outputTargetName = metadata.target;
        participantData = {
          sid: data.participant.sid,
          name: data.participant.identity,
          type: participantType,
          target: outputTargetName,
        };
      }
      room.participants.push(participantData);
      await storeRoom(roomName, room);

      await publishState(room.name, participantType, data.participant.identity);

      if (participantType !== "CONTROL") {
        await publishState(room.name, "CONTROL");
      }
      break;
    }
    case "participant_left": {
      room.participants = [...room.participants].filter(
        (participant: Participant) =>
          participant.name !== data.participant.identity
      );

      await storeRoom(roomName, room);
      break;
    }
    case "track_published":
    case "track_unpublished":
      await tick(roomName);
      break;
    case "room_finished": {
      await deleteRoom(roomName);
      break;
    }
  }
};

export { livekitWebhook };
