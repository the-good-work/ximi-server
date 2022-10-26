import { WebhookReceiver } from "livekit-server-sdk";
import { deleteRoom, getRoom, storeRoom } from "../util/redisClient";
import { RequestHandler } from "express";

const webhookHandler: RequestHandler = async (req, res) => {
  const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );
  console.log((req as any).rawBody);
  try {
    const result = receiver.receive(req.body, req.headers.authorization);
    console.log("livekit event: ", { result });
  } catch (err) {
    console.log(err);
  }

  return res.send({ ok: true });
};

export { webhookHandler };
