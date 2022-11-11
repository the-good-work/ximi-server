import type {
  ErrorType,
  ApiPayload,
  RoomPresetRequest,
} from "@thegoodwork/ximi-types";
import { editPreset } from "../controller/editPreset";

const editPresetHandler = async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to save/load a preset'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {},
        examples: {
          SAVE_PRESET: { $ref: '#/components/examples/EditPresetSaveRequest' },
          LOAD_PRESET: { $ref: '#/components/examples/EditPresetLoadRequest' },
        }
      }
    }
  }
  #swagger.responses[200] = {
    schema: {
      status: 'success',
      message: 'Edit preset success'
    }
  }
  #swagger.responses[500] = {
    schema: {
      status: 'error',
      message: 'Room does not exist'
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
      message: "Edit preset success",
    };
    const params: RoomPresetRequest = req.body;

    const data = await editPreset(params);
    if (data) {
      successPayload.data = data;
    }

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

export { editPresetHandler };
