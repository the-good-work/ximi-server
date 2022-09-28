import { RequestHandler } from "express";

const createRoom: RequestHandler = (req, res) => {
  const { roomName } = req.body;
  res.send(200);
};

export { createRoom };
