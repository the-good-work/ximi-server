import express from "express";
import { obtainAccessToken } from "./controller/obtainAccessToken";
import { config } from "dotenv";
import { createRoom } from "./controller/createRoom";
import { listRoom } from "./controller/listRoom";

config();

const app = express();
const port = 3000;
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger_output.json");

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.post("/rooms/create", async (_req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to create a new room'
  */
  const data = await createRoom();
  res.status(200).send(data);
});

app.get("/rooms/list", async (_req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to fetch list of available rooms'
  */
  const data = await listRoom();
  res.status(200).send(data);
});

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
