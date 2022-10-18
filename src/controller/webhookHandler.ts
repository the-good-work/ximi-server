import { webhookReceiver } from "../util/livekitClient";
import { getRoom, storeRoom } from "../util/redisClient";
import type { WebhookEvent } from "livekit-server-sdk/dist/proto/livekit_webhook";

const webhookHandler = async (req: any) => {
  const result: WebhookEvent = await webhookReceiver(req);
  const roomName = result.room.name;
  let room = await getRoom(roomName);

  switch (result.event) {
    case "participant_joined": {
      room.participants.push({
        name: result.participant.identity,
        type: result.participant.metadata,
      });
      console.log("room list: ", room);
      await storeRoom(roomName, room);
    }
    case "participant_left": {
      room.participants.filter(
        (participant: any) => participant.name !== result.participant.identity
      );
      console.log("room list: ", room);
      await storeRoom(roomName, room);
    }
  }
};

export { webhookHandler };
