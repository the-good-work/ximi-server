import { storeRoom, getRoom } from "../util/redisClient";
import { Preset, RoomPresetRequest } from "@thegoodwork/ximi-types";

const editPreset = async (params: RoomPresetRequest) => {
  const room = await getRoom(params.room_name);
  if (!room) {
    throw Error("ROOM_NOT_EXIST");
  }

  let loadedPreset: Preset;
  switch (params.type) {
    case "SAVE_PRESET": {
      room.presets.push(params.preset);
      break;
    }
    case "LOAD_PRESET": {
      loadedPreset = room.presets.find(
        (preset) => preset.index === params.index
      );
      room.currentSetting = loadedPreset.participant;
      room.currentPreset = loadedPreset.name;
      break;
    }
  }

  await storeRoom(params.room_name, room);

  return loadedPreset;
};

export { editPreset };
