import { RoomServiceClient, AccessToken } from "livekit-server-sdk";
import { config } from "dotenv";

config();

const svc = new RoomServiceClient(
  process.env.LIVEKIT_HOST,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

export const roomServiceClient = svc;

export async function checkRoom(roomName: string) {
  const existingRooms = await roomServiceClient.listRooms();

  const hasMatchingRoom =
    existingRooms.findIndex((room) => {
      return room.name === roomName;
    }) > 0;

  return hasMatchingRoom;
}
export async function generateToken(roomName: string, identity: string) {
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity }
  );
  token.addGrant({ roomAdmin: true, roomList: true, room: roomName });
  return { accessToken: token };
}
