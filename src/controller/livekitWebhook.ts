import { deleteRoom, getRoom, storeRoom } from "../util/redisClient";
import { publishState } from "../util/livekitClient";
import {
  Participant,
  ParticipantPerformer,
  UpdateStatePayload,
} from "@thegoodwork/ximi-types";

const livekitWebhook = async (data) => {
  const roomName = data.room.name;
  const room = await getRoom(roomName);

  switch (data.event) {
    case "participant_joined": {
      const metadata = JSON.parse(data.participant.metadata);
      const participantType = metadata.type;
      const performerTarget = metadata.target;

      let updatePayload: UpdateStatePayload;
      let participantData: Participant;
      if (participantType === "CONTROL") {
        participantData = {
          name: data.participant.identity,
          type: participantType,
        };
        room.participants.push(participantData);
        updatePayload = {
          participants: room.participants,
          audioCurrent: room.audioCurrent,
          audioPresets: room.audioPresets,
          layoutCurrent: room.layoutCurrent,
          layoutPresets: room.layoutPresets,
        };
      } else if (participantType === "PERFORMER") {
        participantData = {
          name: data.participant.identity,
          type: participantType,
          audioMixMute: [""],
          audioOutDelay: 0,
          video: {
            slots: [
              {
                nickname: "slot1",
                size: { x: 0, y: 0 },
                position: { x: 0, y: 0 },
              },
            ],
            layout: "Default",
          },
        };
        room.participants.push(participantData);
        updatePayload = participantData;
      } else if (participantType === "OUTPUT") {
        room.outputCount = room.outputCount++;
        participantData = {
          name: data.participant.identity,
          type: participantType,
        };
        room.participants.push(participantData);

        updatePayload = room.participants.find(
          (participant: Participant) => participant.name === performerTarget
        ) as ParticipantPerformer;
      }
      await publishState(room.name, updatePayload);

      console.log("room data: ", room);
      await storeRoom(roomName, room);
      break;
    }
    case "participant_left": {
      const metadata = JSON.parse(data.participant.metadata);
      const participantType = metadata.type;
      room.participants.filter(
        (participant: any) => participant.name !== data.participant.identity
      );
      if (participantType === "CONTROL") {
        room.controlCount = room.controlCount - 1;
      } else if (participantType === "OUTPUT") {
        room.outputCount = room.outputCount - 1;
      }

      console.log("room data: ", room);
      await storeRoom(roomName, room);
      break;
    }
    case "room_finished": {
      await deleteRoom(roomName);
      break;
    }
  }
};

export { livekitWebhook };
