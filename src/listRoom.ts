import { getRooms } from "./util/redisClient";

const listRoom = async () => {
  const data = await getRooms();

  return data;
};

export { listRoom };
