import type { ErrorType, ApiPayload } from "@thegoodwork/ximi-types";
import { listRoom } from "../controller/listRoom";

const listRoomHandler = async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to fetch list of available rooms'
  #swagger.responses[200] = {
    schema: {
      status: 'success',
      message: 'Get list room success',
      data: [
        {
          room: "<room_name>",
          participants: 2
        }
      ]
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
      message: "Get list room success",
    };
    const data = await listRoom();

    successPayload.data = data;
    return res.status(200).send(successPayload);
  } catch (e) {
    const errorType: ErrorType = e.message;
    const errorPayload: ApiPayload = {
      status: "error",
      error: "",
    };

    switch (errorType) {
      default:
        console.log(e);
        errorPayload.error = "Internal server error";
        return res.status(500).send(errorPayload);
    }
  }
};

export { listRoomHandler };
