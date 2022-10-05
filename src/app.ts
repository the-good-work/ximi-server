import express from "express";
import { obtainAccessToken } from "./obtainAccessToken";
import { config } from "dotenv";
import { createRoom } from "./createRoom";
import { listRoom } from "./listRoom";

config();

const app = express();
const port = 3000;

/*
app.post("/room/create", createRoom);
app.post("/room/:type/join", joinRoom);
*/

app.get("/rooms/create", async (_req, res) => {
  const data = await createRoom();
  res.status(200).send(data);
});

app.get("/rooms/list", async (_req, res) => {
  const data = await listRoom();
  res.status(200).send(data);
});

// check whether name is taken
app.get("/participantName/validate", () => {});

app.get("/rooms", async (_req, res) => {
  await obtainAccessToken({
    roomName: "test",
    participantName: "hello",
    participantType: "performer",
    action: "createRoom",
  });
  res.send("lol");
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
