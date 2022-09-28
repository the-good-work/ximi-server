import { RoomServiceClient } from "livekit-server-sdk";

const svc = new RoomServiceClient(
  process.env.LIVEKIT_HOST,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

export const roomServiceClient = svc;
