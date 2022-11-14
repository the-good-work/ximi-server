import type { ErrorType, ApiPayload } from "@thegoodwork/ximi-types";
import { RequestHandler } from "express";
import validator from "validator";
import { checkName } from "../controller/checkName";
import { getAllParticipants } from "../util/livekitClient";
const { isAlphanumeric } = validator;

const validateNameHandler: RequestHandler = async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to validate participant nickname availability'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: '#/definitions/ValidateNameRequest'
        },
      }
    }
  }
  #swagger.responses[200] = {
    schema: {
      status: 'success',
      message: 'Validate name success',
      data: {
        available: true
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
      message: "Validate name success",
    };
    const { name } = req.body;

    if (!isAlphanumeric(name) || name.length > 5) {
      throw Error("PARTICIPANT_NAME_INVALID");
    }

    const allParticipants = await getAllParticipants();

    if (allParticipants.findIndex((p) => p.identity === name) > -1) {
      throw Error("PARTICIPANT_NAME_EXIST");
    }

    successPayload.data = { available: await checkName(name.toUpperCase()) };
    return res.status(200).send(successPayload);
  } catch (e) {
    const errorType: ErrorType = e.message;
    const errorPayload: ApiPayload = {
      status: "error",
      error: "",
    };

    switch (errorType) {
      case "PARTICIPANT_NAME_INVALID": {
        errorPayload.error = "Invalid participant name";
        return res.status(422).send(errorPayload);
      }

      case "PARTICIPANT_NAME_EXIST": {
        errorPayload.error = "Participant name in use";
        return res.status(422).send(errorPayload);
      }

      default:
        console.log(e);
        errorPayload.error = "Internal server error";
        return res.status(500).send(errorPayload);
    }
  }
};

export { validateNameHandler };
