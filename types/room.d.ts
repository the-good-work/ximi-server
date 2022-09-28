export namespace XIMI {
  type Room = {
    participants: Participant[];
  };

  type Participant = {
    type: "performer" | "control" | "output";
  };
}
