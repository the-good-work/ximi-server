import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { ErrorTypeResponse, Participant } from "@thegoodwork/ximi-types";

import { createRoom } from "./controller/createRoom";
import { listRoom } from "./controller/listRoom";
import { checkName } from "./controller/checkName";
import { checkPasscode } from "./controller/checkPasscode";
import { webhookHandler } from "./controller/webhookHandler";
import validator from "validator";

const { isAlphanumeric, isNumeric } = validator;

config();

const app = express();
const port = 3000;

let response;
let errorType: ErrorTypeResponse;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

var rawBodySaver = function (
  req: Request,
  _res: Response,
  buf: Buffer,
  encoding: BufferEncoding
) {
  if (buf && buf.length) {
    (req as any).rawBody = buf.toString(encoding || "utf8");
  }
};

app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: "*/*" }));

app.post("/livekit-webhook", webhookHandler);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(require("../swagger_output.json"))
);

app.post("/rooms/create", async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to create a new room'
  #swagger.responses[200] = {
    schema: {
      token: '<token_value>'
    }
  }
  #swagger.responses[422] = {
    content: {
      "application/json": {
        schema: {
          anyOf: [
            {
              $ref: '#/definitions/MaximumRoomErrorResponse'
            },
            {
              $ref: '#/definitions/InvalidRoomErrorResponse'
            }
          ]
        }
      }
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
    if (
      !isAlphanumeric(name) ||
      name.length > 10 ||
      !isNumeric(passcode) ||
      passcode.length != 5
    ) {
      errorType = "CREATE_ROOM_INVALID";
      throw Error(errorType);
    }
    const data = await createRoom(name.toUpperCase(), passcode);

    return res.status(200).send(data);
  } catch (e) {
    errorType = e.message;
    switch (errorType) {
      case "ROOM_MAX": {
        response = { message: "Max 10 rooms allowed" };
        return res.status(422).send(response);
      }
      case "CREATE_ROOM_INVALID": {
        response = { message: "Invalid room name or passcode" };
        return res.status(422).send(response);
      }
      default: {
        console.log(e);
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
    if (!isAlphanumeric(name) || name.length > 5) {
      errorType = "PARTICIPANT_NAME_INVALID";
      throw Error(errorType);
    }

    return res
      .status(200)
      .send({ available: await checkName(name.toUpperCase()) });
  } catch (e) {
    errorType = e.message;

    switch (errorType) {
      case "PARTICIPANT_NAME_INVALID": {
        response = { message: "Invalid participant name" };
        return res.status(422).send(response);
      }
      default:
        console.log(e);
        response = { message: "Internal server error" };
        return res.status(500).send(response);
    }
  }
});

app.post("/rooms/validate-passcode", async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to validate room passcode for joining a room'
  #swagger.requestBody = {
    required: true,
    content: {
      "applciation/json": {
        schema: {
          $ref: '#/definitions/ValidatePasscodeRequest'
        },
        examples: {
          PERFORMER: { $ref: '#/components/examples/ValidatePasscodePerformerRequest' },
          CONTROL: { $ref: '#/components/examples/ValidatePasscodeControlRequest' },
          OUTPUT: { $ref: '#/components/examples/ValidatePasscodeOutputRequest' }
        }
      }
    }
  }
  #swagger.responses[200] = {
    schema: {
      token: '<token_value>'
    }
  }
  #swagger.responses[422] = {
    content: {
      "application/json": {
        schema: {
          anyOf: [
            {
              $ref: '#/definitions/IncorrectPasscodeErrorResponse'
            },
            {
              $ref: '#/definitions/RoomNotExistErrorResponse'
            }
          ]
        }
      }
    }
  }
  #swagger.responses[500] = {
    schema: {
      message: 'Internal server error'
    }
  }
  */
  try {
    let params: {
      room_name: string;
      participant_name?: string;
      participant_type: Participant["type"];
      passcode: string;
    } = {
      ...req.body,
      ...(req.body.participant_name && {
        participant_name: req.body.participant_name as string,
      }),
    };

    let data = await checkPasscode(params);

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

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
