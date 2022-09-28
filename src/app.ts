import express from "express";
import { obtainAccessToken } from "./obtainAccessToken";
import { config } from "dotenv";

config();

const app = express();
const port = 3000;

/*
app.post("/room/create", createRoom);
app.post("/room/:type/join", joinRoom);
*/

// check whether name is taken
app.get("/participantName/validate", () => {});

app.get("/rooms", async (req, res) => {
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
