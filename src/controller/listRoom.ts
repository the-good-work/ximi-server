import { getAllRooms } from "../util/redisClient";

const listRoom = async () => {
  const allRooms = await getAllRooms();
  const data = allRooms.map((room: any) => {
    return { room: room.name, participants: room.participants.length };
  });

  return data;
};

export { listRoom };
