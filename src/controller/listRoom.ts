import { getAllRooms } from "../util/redisClient";

const listRoom = async () => {
  const allRooms = await getAllRooms();
  const data = allRooms.map((room: any) => {
    let count = 0;
    room.participants.forEach((participant: any) => {
      if (participant.type === "PERFORMER" || participant.type === "SCOUT") {
        count++;
      }
    });
    return { room: room.name, participants: count };
  });

  return data;
};

export { listRoom };
