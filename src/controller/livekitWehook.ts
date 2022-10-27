import { deleteRoom, getRoom, storeRoom } from "../util/redisClient";

const livekitWebhook = async (data) => {
  const roomName = data.room.name;
  let room = await getRoom(roomName);

  switch (data.event) {
    case "participant_joined": {
      room.participants.push({
        name: data.participant.identity,
        type: data.participant.metadata,
      });
      if (data.participant.metadata === "CONTROL") {
        room.controlCount = room.controlCount++;
      } else if (data.participant.metadata === "OUTPUT") {
        room.outputCount = room.outputCount++;
      }

      console.log("room data: ", room);
      await storeRoom(roomName, room);
      break;
    }
    case "participant_left": {
      room.participants.filter(
        (participant: any) => participant.name !== data.participant.identity
      );
      if (data.participant.metadata === "CONTROL") {
        room.controlCount = room.controlCount;
      } else if (data.participant.metadata === "OUTPUT") {
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
