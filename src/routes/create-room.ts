import { RequestHandler } from "express";
import type { ErrorType, ApiPayload } from "@thegoodwork/ximi-types";
import { createRoom } from "../controller/createRoom";
import validator from "validator";
const { isAlphanumeric, isNumeric } = validator;

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

const createRoomHandler: RequestHandler = async (req, res) => {
  const successPayload: ApiPayload = {
    status: "success",
    message: "Success",
  };

  try {
    const { name, passcode } = req.body;
    if (
      !isAlphanumeric(name) ||
      name.length > 10 ||
      !isNumeric(passcode) ||
      passcode.length != 5
    ) {
      const error: ErrorType = "CREATE_ROOM_INVALID";
      throw Error(error);
    }
    const data = await createRoom(name.toUpperCase(), passcode);

    successPayload.message = "Success";
    successPayload.data = data;
    return res.status(200).send(successPayload);
  } catch (e) {
    let errorType: ErrorType = e.message;

    const errorPayload: ApiPayload = {
      status: "error",
      error: "",
    };
    switch (errorType) {
      case "ROOM_MAX": {
        errorPayload.error = "Max 10 rooms allowed";
        return res.status(422).send(errorPayload);
      }
      case "CREATE_ROOM_INVALID": {
        errorPayload.error = "Invalid room name or passcode";
        return res.status(422).send(errorPayload);
      }
      default: {
        console.error(e);
        errorPayload.error = "Internal server error";
        return res.status(500).send(errorPayload);
      }
    }
  }
};

export { createRoomHandler };
