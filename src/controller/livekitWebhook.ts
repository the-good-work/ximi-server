import { deleteRoom, getRoom, storeRoom } from "../util/redisClient";
import { publishState } from "../util/livekitClient";
import { Participant } from "@thegoodwork/ximi-types";

const livekitWebhook = async (data) => {
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
                size: { x: 0, y: 0 },
                position: { x: 0, y: 0 },
              },
            ],
            layout: "Default",
          },
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
      const metadata = JSON.parse(data.participant.metadata);
      const participantType = metadata.type;
      room.participants = room.participants.filter(
        (participant: Participant) =>
          participant.name !== data.participant.identity
      );
      if (participantType === "CONTROL") {
        room.controlCount = room.controlCount - 1;
      } else if (participantType === "OUTPUT") {
        room.outputCount = room.outputCount - 1;
      }

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
