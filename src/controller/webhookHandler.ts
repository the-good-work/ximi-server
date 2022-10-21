// import { webhookReceiver } from "../util/livekitClient";
import { deleteRoom, getRoom, storeRoom } from "../util/redisClient";
// import type { WebhookEvent } from "livekit-server-sdk/dist/proto/livekit_webhook";

const webhookHandler = async (data: any) => {
  // const result: WebhookEvent = await webhookReceiver(req);
  console.log("livekit event: ", data);
  const roomName = data.room.name;
  let room = await getRoom(roomName);

  switch (data.event) {
    case "participant_joined": {
      room.participants.push({
        name: data.participant.identity,
        type: data.participant.metadata,
      });
      await storeRoom(roomName, room);
    }
    case "participant_left": {
      room.participants.filter(
        (participant: any) => participant.name !== data.participant.identity
      );
      await storeRoom(roomName, room);
    }
    case "room_finished": {
      await deleteRoom(roomName);
    }
  }
  console.log("room data: ", room);
};

export { webhookHandler };
