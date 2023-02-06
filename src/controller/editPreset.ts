import { storeRoom, getRoom } from "../util/redisClient";
import { Preset, RoomPresetRequest } from "@thegoodwork/ximi-types";
import { publishState } from "../util/livekitClient";

const editPreset = async (params: RoomPresetRequest) => {
  const room = await getRoom(params.room_name);
  if (!room) {
    throw Error("ROOM_NOT_EXIST");
  }

  let loadedPreset: Preset;

  switch (params.type) {
    case "SAVE_PRESET": {
      room.presets[params.preset.index] = params.preset;
      room.presets[params.preset.index].name =
        room.presets[params.preset.index].name.toUpperCase();
      break;
    }
    case "LOAD_PRESET": {
      loadedPreset = room.presets.find(
        (preset) => preset.index === params.index
      );

      // find participants currently in room but not in setting, and merge them
      const participantsNotInSetting = room.participants.filter(
        (p) => loadedPreset.participants.findIndex((p1) => p1.sid === p.sid) < 0
      );

      console.log([...loadedPreset.participants, ...participantsNotInSetting]);

      room.participants = [
        ...loadedPreset.participants,
        ...participantsNotInSetting,
      ];
      room.currentPreset = loadedPreset.name;
      break;
    }
  }

  await storeRoom(params.room_name, room);
  await publishState(room.name, "CONTROL");
  if (params.type === "LOAD_PRESET") {
    await Promise.all(
      room.participants
        .filter((p) => p.type === "PERFORMER")
        .map((p) => p.name)
        .map((name) => publishState(room.name, "PERFORMER", name))
    );
  }

  return loadedPreset;
};

export { editPreset };
