import { deleteRoom, getRoom, storeRoom } from "../util/redisClient";
import { publishState } from "../util/livekitClient";
import { Participant, UpdateStatePayload } from "@thegoodwork/ximi-types";

const livekitWebhook = async (data) => {
  const roomName = data.room.name;
  const room = await getRoom(roomName);
  const participantType = JSON.parse(data.participant.metadata).type;
  console.log(participantType);

  switch (data.event) {
    case "participant_joined": {
      let updatePayload: UpdateStatePayload;
      let participantData: Participant;
      if (participantType === "CONTROL") {
        room.controlCount = room.controlCount++;
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

        const performerTarget = JSON.parse(data.participant.metadata).target;
        updatePayload = room.participants.find(
          (participant: Participant) => participant.name === performerTarget
        );
      }
      console.log(updatePayload);
      await publishState(room.name, updatePayload);

      console.log("room data: ", room);
      await storeRoom(roomName, room);
      break;
    }
    case "participant_left": {
      room.participants.filter(
        (participant: any) => participant.name !== data.participant.identity
      );
      if (participantType === "CONTROL") {
        room.controlCount = room.controlCount;
      } else if (participantType === "OUTPUT") {
        room.outputCount = room.outputCount;
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
