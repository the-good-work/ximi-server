export namespace XIMI {
  type Room = {
    name: string;
    passcode: string;
    participants?: Participant[];
    audioCurrent?: AudioPreset;
    audioPresets?: AudioPreset[];
    layoutCurrent?: LayoutPreset;
    layoutPresets?: LayoutPreset[];
  };

  type Participant = {
    name: string;
    type: "performer" | "control" | "output";
    // participant audio configuration
    mute?: string[];
    delay?: number;
    // participant layout configuration
    icon?: string;
    slots?: {
      list: SlotTemplate[];
      layout: LayoutType;
    };
  };

  type AudioPreset = {
    name: string;
    participant: Participant[];
  };

  type LayoutPreset = {
    name: string;
    participant: Participant[];
  };

  type SlotTemplate = {
    size: number[];
    position: number[];
    nickname: string;
  };

  type LayoutType = "Default" | "A" | "B" | "C";
}
