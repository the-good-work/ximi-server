import type { ErrorType, ApiPayload } from "@thegoodwork/ximi-types";
import { getRoom } from "../util/redisClient";

const retrieveRoomHandler = async (req, res) => {
  /*
  #swagger.tags = ['Rooms']
  #swagger.description = 'Send a request to fetch the room state for performer participant'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: '#/definitions/RetrieveRoomRequest'
        },
      }
    }
  }
  #swagger.responses[200] = {
    schema: {
      status: 'success',
      message: 'Get room state success',
      data: {
          name: "USER1",
          type: "PERFORMER",
          audioMixMute: [""],
          audioOutputDelay: 0,
          video: {
            slots: [
              {
                nickname: "slot1",
                size: {
                  x: 0,
                  y: 0
                },
                position: {
                  x: 0,
                  y: 0
                }
              }
            ]
          },
          layout: "Default"
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
      message: "Get room state success",
    };
    const { room_name, participant_name } = req.body;

    const room = await getRoom(room_name);
    if (!room) {
      const type = "ROOM_NOT_EXIST";
      throw Error(type);
    }

    const state = room.participants.find(
      (participant) => participant.name === participant_name
    );

    successPayload.data = state;
    return res.status(200).send(successPayload);
  } catch (e) {
    const errorType: ErrorType = e.message;
    const errorPayload: ApiPayload = {
      status: "error",
      error: "",
    };

    switch (errorType) {
      case "ROOM_NOT_EXIST":
        errorPayload.error = "Room does not exist";
        return res.status(422).send(errorPayload);
      default:
        console.log(e);
        errorPayload.error = "Internal server error";
        return res.status(500).send(errorPayload);
    }
  }
};

export { retrieveRoomHandler };
