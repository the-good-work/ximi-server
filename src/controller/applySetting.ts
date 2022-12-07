import { storeRoom, getRoom } from "../util/redisClient";
import {
  Participant,
  ParticipantPerformer,
  RoomUpdateAction,
} from "@thegoodwork/ximi-types";
import { publishState } from "../util/livekitClient";

const applySetting = async (params: RoomUpdateAction) => {
  const room = await getRoom(params.room_name);
  if (!room) {
    throw Error("ROOM_NOT_EXIST");
  }

  const participantData = room.participants.find(
    (participant: Participant) => participant.name === params.participant
  ) as ParticipantPerformer;

  switch (params.type) {
    case "MUTE_AUDIO": {
      participantData.audioMixMute.push(params.target);
      break;
    }
    case "UNMUTE_AUDIO": {
      participantData.audioMixMute = participantData.audioMixMute.filter(
        (name) => name !== params.target
      );
      break;
    }
    case "UPDATE_DELAY": {
      participantData.audioOutDelay = params.delay;
      break;
    }
    case "UPDATE_LAYOUT": {
      participantData.video.layout = params.layout;
      participantData.video.slots = params.slots;
      break;
    }
  }

  await storeRoom(params.room_name, room);

  await publishState(room.name, "CONTROL");

  if (participantData.type === "PERFORMER") {
    await publishState(room.name, "PERFORMER", params.participant);

    const outputs = room.participants.filter(
      (p) => p.type === "OUTPUT" && p.target === params.participant
    );

    await Promise.all(
      outputs.map((o) => publishState(room.name, "OUTPUT", o.name))
    );
  }

  room.participants.forEach((participant: Participant, index) => {
    if (participant.name === params.participant) {
      room.participants[index] = participantData;
    }
  });

  return;
};

export { applySetting };
