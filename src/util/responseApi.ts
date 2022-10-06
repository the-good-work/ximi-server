import {
  ErrorTypeResponse,
  StatusCode,
  GenericResponse,
} from "../../types/response";
let statusCode: StatusCode;
let response: GenericResponse;

export async function errorHandler(type: ErrorTypeResponse) {
  switch (type) {
    case "ROOM_EXIST": {
      statusCode = 422;
      response = {
        success: false,
        code: statusCode,
        message: "Room already exist",
      };
      break;
    }
    case "ROOM_MAX": {
      statusCode = 403;
      response = {
        success: false,
        code: statusCode,
        message: "Max 10 rooms allowed",
      };
      break;
    }
    default: {
      statusCode = 500;
      response = {
        success: false,
        code: statusCode,
        message: "Internal server error",
      };
      break;
    }
  }
  return { statusCode, response };
}

export async function successHandler(data: any) {
  statusCode = 200;
  response = {
    success: true,
    code: statusCode,
    message: "Create room success",
    data,
  };
  return { statusCode, response };
}
