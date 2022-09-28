export namespace XIMI {
  type Room = {
    participants: Participant[];
    password: string;
    name: string;
  };

  type Participant = {
    type: "performer" | "control" | "output";
  };
}
