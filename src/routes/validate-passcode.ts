import type {
  ErrorType,
  ApiPayload,
  Participant,
} from "@thegoodwork/ximi-types";
import { checkPasscode } from "../controller/checkPasscode";

const validatePasscodeHandler = async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to validate room passcode for joining a room. If the passcodeis correct, it will generate token with type\'s metadata'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
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
      status: 'success',
      message: 'Validate passcode success',
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
      status: 'error',
      error: 'Internal server error'
    }
  }
  */
  try {
    const successPayload: ApiPayload = {
      status: "success",
      message: "Validate passcode success",
    };

    let params: {
      room_name: string;
      participant_name?: string;
      participant_type: Participant["type"];
      performer_target?: string;
      passcode: string;
    } = {
      ...req.body,
      ...(req.body.participant_name && {
        participant_name: req.body.participant_name as string,
      }),
    };

    successPayload.data = await checkPasscode(params);

    return res.status(200).send(successPayload);
  } catch (e) {
    const errorType: ErrorType = e.message;
    const errorPayload: ApiPayload = {
      status: "error",
      error: "",
    };

    switch (errorType) {
      case "INCORRECT_PASSCODE": {
        errorPayload.error = "Incorrect passcode";
        return res.status(422).send(errorPayload);
      }
      case "ROOM_NOT_EXIST": {
        errorPayload.error = "Room does not exist";
        return res.status(422).send(errorPayload);
      }
      default:
        console.log(e);
        errorPayload.error = "Internal server error";
        return res.status(500).send(errorPayload);
    }
  }
};

export { validatePasscodeHandler };
