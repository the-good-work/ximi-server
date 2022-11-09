import { storeRoom, getRoom } from "../util/redisClient";
import {
  Participant,
  ParticipantPerformer,
  RoomUpdateAction,
} from "@thegoodwork/ximi-types";

const applySetting = async (params: RoomUpdateAction) => {
  const room = await getRoom(params.room_name);
  const participantData = room.participants.find(
    (participant: Participant) => participant.name === params.participant
  ) as ParticipantPerformer;

  switch (params.type) {
    case "MUTE_AUDIO": {
      participantData.audioMixMute.push(params.target);
      break;
    }
    case "UNMUTE_AUDIO": {
      participantData.audioMixMute.filter((name) => name !== params.target);
      break;
    }
    case "UPDATE_DELAY": {
      participantData.audioOutDelay = params.delay;
      break;
    }
    case "UPDATE_LAYOUT": {
      participantData.video.layout = params.layout;
      break;
    }
  }
  room.participants.forEach((participant: Participant, index) => {
    if (participant.name === params.participant) {
      room.participants[index] = participantData;
    }
  });

  await storeRoom(params.room_name, room);

  return;
};

export { applySetting };
