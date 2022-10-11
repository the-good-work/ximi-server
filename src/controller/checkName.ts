import { getAllRooms } from "../util/redisClient";

const checkName = async (name: string) => {
  const allRooms = await getAllRooms();
  let nameExist = false;
  allRooms.forEach((room: any) => {
    if (room.name === name) {
      nameExist = true;
    }
  });

  return nameExist;
};

export { checkName };
