import type { ErrorType, ApiPayload } from "@thegoodwork/ximi-types";
import { createRoom } from "../controller/createRoom";
import validator from "validator";
const { isAlphanumeric, isNumeric } = validator;

const createRoomHandler = async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to create a new room'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: '#/definitions/CreateRoomRequest'
        },
      }
    }
  }
  #swagger.responses[200] = {
    schema: {
      status: 'success',
      message: 'create room suuccess',
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
      status: 'error',
      message: 'Internal server error'
    }
  }
  */
  try {
    const successPayload: ApiPayload = {
      status: "success",
      message: "Create room success",
    };
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

    successPayload.data = data;
    return res.status(200).send(successPayload);
  } catch (e) {
    const errorType: ErrorType = e.message;
    const errorPayload: ApiPayload = {
      status: "error",
      error: "",
    };

    switch (errorType) {
      case "ROOM_MAX": {
        errorPayload.error = "Max 10 rooms allowed";
        return res.status(422).send(errorPayload);
      }
      case "ROOM_EXIST": {
        errorPayload.error = "Room already exist";
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
