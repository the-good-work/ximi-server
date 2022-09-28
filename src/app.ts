import express from "express";
import { AccessToken } from "livekit-server-sdk";
import { XIMI } from "../types/room";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

init();

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

const room: XIMI.Room = {
  participants: [
    {
      type: "control",
    },
  ],
};

function init() {
  // if this room doesn't exist, it'll be automatically created when the first
  // client joins
  const roomName = "name-of-room";
  // identifier to be used for participant.
  // it's available as LocalParticipant.identity with livekit-client SDK
  const participantName = "user-name";

  const at = new AccessToken("api-key", "secret-key", {
    identity: participantName,
  });
  at.addGrant({ roomJoin: true, room: roomName });

  const token = at.toJwt();
  console.log("access token", token);
}
