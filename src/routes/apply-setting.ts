import type {
  ErrorType,
  ApiPayload,
  RoomUpdateAction,
} from "@thegoodwork/ximi-types";
import { createRoom } from "../controller/createRoom";
import validator from "validator";
import { applySetting } from "../controller/applySetting";
const { isAlphanumeric, isNumeric } = validator;

const applySettingHandler = async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to apply performer\'s setting'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {},
        examples: {
          MUTE: { $ref: '#/components/examples/ApplySettingMuteRequest' },
          UNMUTE: { $ref: '#/components/examples/ApplySettingUnmuteRequest' },
          DELAY: { $ref: '#/components/examples/ApplySettingDelayRequest' },
          LAYOUT: { $ref: '#/components/examples/ApplySettingLayoutRequest' }
        }
      }
    }
  }
  #swagger.responses[200] = {
    schema: {
      status: 'success',
      message: 'Apply setting success'
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
      message: "Apply setting success",
    };
    const params: RoomUpdateAction = req.body;

    await applySetting(params);

    return res.status(200).send(successPayload);
  } catch (e) {
    const errorType: ErrorType = e.message;
    const errorPayload: ApiPayload = {
      status: "error",
      error: "",
    };

    switch (errorType) {
      case "ROOM_NOT_EXIST": {
        errorPayload.error = "Room does not exist";
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

export { applySettingHandler };
