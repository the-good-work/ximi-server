import { storeRoom, getRoom } from "../util/redisClient";
import { Preset, RoomPresetRequest } from "@thegoodwork/ximi-types";
import { publishState } from "../util/livekitClient";

const editPreset = async (params: RoomPresetRequest) => {
  const room = await getRoom(params.room_name);
  if (!room) {
    throw Error("ROOM_NOT_EXIST");
  }

  let loadedPreset: Preset;

  console.log(params);

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

      // copy sid of all PERFORMER nodes in case of exit/reenter
      loadedPreset.participants = [
        ...loadedPreset.participants.map((p) => {
          const pRoom = room.participants?.find((pR) => pR.name === p.name);
          if (pRoom) {
            return { ...p, sid: pRoom.sid };
          }
          return p;
        }),
      ];

      // find participants currently in room but not in setting, and merge them
      const participantsNotInSetting = room.participants.filter(
        (p) =>
          loadedPreset.participants.findIndex((p1) => p1.name === p.name) < 0
      );

      room.participants = [
        ...loadedPreset.participants,
        ...participantsNotInSetting,
      ];

      room.currentPreset = loadedPreset.name;
      break;
    }

    case "LOAD_PRESET_FILE": {
      // find active preset index before replacing presets
      const currentPresetIndex = room.presets.findIndex(
        (p, i) =>
          p.name === room.currentPreset || `SLOT${i + 1}` === room.currentPreset
      );

      // const oldPresets = [...room.presets];
      room.presets = [...params.presets];

      room.currentPreset =
        params.presets[currentPresetIndex].name ||
        `SLOT${currentPresetIndex + 1}`;

      // copy sid of all PERFORMER nodes in case of exit/reenter
      room.presets[currentPresetIndex].participants = [
        ...room.presets[currentPresetIndex].participants.map((p) => {
          const pRoom = room.participants?.find((pR) => pR.name === p.name);
          if (pRoom) {
            return { ...p, sid: pRoom.sid };
          }
          return p;
        }),
      ];

      // find participants currently in room but not in setting, and merge them
      const participantsNotInSetting = room.participants.filter(
        (p) =>
          room.presets[currentPresetIndex].participants.findIndex(
            (p1) => p1.name === p.name
          ) < 0
      );

      room.participants = [
        ...room.presets[currentPresetIndex].participants,
        ...participantsNotInSetting,
      ];

      break;
    }
  }

  await storeRoom(params.room_name, room);
  await publishState(room.name, "CONTROL");

  if (params.type === "LOAD_PRESET" || params.type === "LOAD_PRESET_FILE") {
    await Promise.all(
      room.participants
        .filter((p) => p.type === "PERFORMER" || p.type === "SCOUT")
        .map((p) => publishState(room.name, p.type, p.name))
    );
  }

  return loadedPreset;
};

export { editPreset };
