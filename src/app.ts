import express from "express";
import { obtainAccessToken } from "./controller/obtainAccessToken";
import { config } from "dotenv";
import { createRoom } from "./controller/createRoom";
import { listRoom } from "./controller/listRoom";
import { errorHandler, successHandler } from "./util/responseApi";
import { StatusCode, GenericResponse } from "@thegoodwork/ximi-types";

config();

const cors = require("cors");
const app = express();
const port = 3000;
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger_output.json");

let statusCode: StatusCode;
let response: GenericResponse;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.post("/rooms/create", async (_req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to create a new room'
  */
  try {
    const data = await createRoom();

    const result = await successHandler(data);
    statusCode = result.statusCode;
    response = result.response;
  } catch (e) {
    const type = e.message;
    const result = await errorHandler(type);
    statusCode = result.statusCode;
    response = result.response;
  }
  res.status(statusCode).send(response);
});

app.get("/rooms/list", async (_req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to fetch list of available any rooms'
  #swagger.responses[200] = {
    description: 'Get room list success',
    schema: [{ room: "room_name", participants: 0 }]
  }
  */
  const data = await listRoom();

  return res.status(200).send(data);
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
