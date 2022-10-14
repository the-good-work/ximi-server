import { webhookReceiver } from "../util/livekitClient";
import { getRoom, storeRoom } from "../util/redisClient";

const joinRoomHandler = async (req: any) => {
  const result = await webhookReceiver(req);
  if (result.event === "participant_joined") {
    const roomName = result.room.name;
    let room = await getRoom(roomName);
    room.participants.push({
      name: result.participant.identity,
      type: result.participant.metadata,
    });
    console.log("room list: ", room);
    await storeRoom(roomName, room);
  }
};

export { joinRoomHandler };
