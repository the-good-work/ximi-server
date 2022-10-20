import express from "express";
import { obtainAccessToken } from "./controller/obtainAccessToken";
import { config } from "dotenv";
import { createRoom } from "./controller/createRoom";
import { listRoom } from "./controller/listRoom";
import { checkName } from "./controller/checkName";
import { ErrorTypeResponse } from "@thegoodwork/ximi-types";
import { checkPasscode } from "./controller/checkPasscode";
import { webhookHandler } from "./controller/webhookHandler";

config();

const cors = require("cors");
const app = express();
const port = 3000;
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger_output.json");

let response;
let errorType: ErrorTypeResponse;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.post("/rooms/create", async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to create a new room'
  #swagger.responses[200] = {
    schema: {
      accessToken: '<token_object>'
    }
  }
  #swagger.responses[422] = {
    schema: {
      message: 'Max 10 rooms allowed'
    }
  }
  #swagger.responses[500] = {
    schema: {
      message: 'Internal server error'
    }
  }
  */

  try {
    const { name, passcode } = req.body;
    const data = await createRoom(name, passcode);

    return res.status(200).send(data);
  } catch (e) {
    console.log(e);
    errorType = e.message;
    switch (errorType) {
      case "ROOM_MAX": {
        response = { message: "Max 10 rooms allowed" };
        return res.status(422).send(response);
      }
      default: {
        response = { message: "Internal server error" };
        return res.status(500).send(response);
      }
    }
  }
});

app.get("/rooms/list", async (_req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to fetch list of available rooms'
  #swagger.responses[200] = {
    schema: [
      {
        room: "<room_name>",
        participants: 2
      }
    ]
  }
  #swagger.responses[500] = {
    schema: {
      message: 'Internal server error'
    }
  }
  */

  try {
    const data = await listRoom();

    return res.status(200).send(data);
  } catch (e) {
    console.log(e);
    errorType = e.message;

    switch (errorType) {
      default:
        return res.status(500).send(response);
    }
  }
});

app.post("/rooms/validate-name", async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to validate participant nickname availability'
  #swagger.responses[200] = {
    schema: [
      {
        available: true,
      }
    ]
  }
  #swagger.responses[500] = {
    schema: {
      message: 'Internal server error'
    }
  }
  */
  try {
    const { name } = req.body;

    return res.status(200).send({ available: await checkName(name) });
  } catch (e) {
    console.log(e);
    errorType = e.message;

    switch (errorType) {
      default:
        return res.status(500).send(response);
    }
  }
});

app.post("/rooms/validate-passcode", async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to validate room passcode for joining a room'
  #swagger.parameters['body'] = {
    in: 'body',
    schema: {
      room_name: 'myRoom',
      participant_name: 'user1',
      participant_type: 'CONTROL | PERFORMER | OUTPUT',
      passcode: '12345'
    }
  }
  #swagger.responses[200] = {
    schema: {
      accessToken: '<token_object>'
    }
  }
  #swagger.responses[422] = {
    schema: {
      message: 'Incorrect passcode'
    }
  }
  #swagger.responses[422] = {
    schema: {
      message: 'Room does not exist'
    }
  }
  #swagger.responses[500] = {
    schema: {
      message: 'Internal server error'
    }
  }
  */
  try {
    const { room_name, participant_name, participant_type, passcode } =
      req.body;
    const data = await checkPasscode(
      room_name,
      participant_name,
      participant_type,
      passcode
    );

    return res.status(200).send(data);
  } catch (e) {
    console.log(e);
    errorType = e.message;

    switch (errorType) {
      case "INCORRECT_PASSCODE": {
        response = { message: "Incorrect passcode" };
        return res.status(422).send(response);
      }
      case "ROOM_NOT_EXIST": {
        response = { message: "Room does not exist" };
        return res.status(422).send(response);
      }
      default:
        return res.status(500).send(response);
    }
  }
});

app.post("/webhook-receiver", async (req, res) => {
  /*
  #swagger.tags = ['Webhook']
  #swagger.description = 'Handle api request sent from livekit'
  #swagger.responses[500] = {
    schema: {
      message: 'Internal server error'
    }
  }
  */
  try {
    await webhookHandler(req.body);

    return res.status(200).send();
  } catch (e) {
    console.log(e);
    errorType = e.message;

    switch (errorType) {
      default:
        return res.status(500).send(response);
    }
  }
});

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
