require("dotenv").config();
const packageJson = require("./package.json");

const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./src/app.ts", "./src/routes/*.ts"];

const doc = {
  info: {
    version: packageJson.version,
    title: "XIMI Server API",
    description: "API documentation list for project XIMI",
  },
  host: process.env.HOST_NAME,
  basePath: "/",
  schemes: ["https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "Rooms",
      description: "List of endpoints related to room",
    },
  ],
  definitions: {
    RetrieveRoomRequest: {
      room_name: "MYROOM",
      participant_name: "USER1"
    },
    CreateRoomRequest: {
      name: "MYROOM",
      passcode: "12345"
    },
    ValidateNameRequest: {
      name: "USER1"
    },
    ValidatePasscodeRequest: {
      room_name: "MYROOM",
      participant_name: "USER1",
      participant_type: "PERFORMER | CONTROL | OUTPUT",
      passcode: "12345",
    },
    IncorrectPasscodeErrorResponse: {
      status: "error",
      error: "Incorrect passcode",
    },
    RoomNotExistErrorResponse: {
      status: "error",
      error: "Room does not exist",
    },
    MaximumRoomErrorResponse: {
      status: "error",
      error: "Max 10 rooms allowed",
    },
    InvalidRoomErrorResponse: {
      status: "error",
      error: "Invalid room name or passcode",
    },
  },
  components: {
    examples: {
      EditPresetSaveRequest: {
        type: "SAVE_PRESET",
        room_name: "MYROOM",
        preset: {
          index: 0,
          name: "PRESET1",
          participant: [{
            sid: "<sid>",
            name: "USER1",
            type: "PERFORMER",
            audioMixMute: [],
            audioOutDelay: 0,
            video: {
              slots: [
                {
                  nickname: "USER1",
                  size: { x: 0, y: 0 },
                  position: { x: 0, y: 0 },
                },
              ],
              layout: "Default",  
            },
          }],
        }
      },
      EditPresetLoadRequest: {
        type: "LOAD_PRESET",
        room_name: "MYROOM",
        index: 0
      },
      ApplySettingMuteRequest: {
        type : "MUTE_AUDIO",
        room_name: "MYROOM",
        participant: "USER1",
        target: "USER2",
      },
      ApplySettingUnmuteRequest: {
        type : "UNMUTE_AUDIO",
        room_name: "MYROOM",
        participant: "USER1",
        target: "USER2",
      },
      ApplySettingDelayRequest: {
        type : "UPDATE_DELAY",
        room_name: "MYROOM",
        participant: "USER1",
        delay: 0,
      },
      ApplySettingLayoutRequest: {
        type : "UPDATE_LAYOUT",
        room_name: "MYROOM",
        participant: "USER1",
        layout: "Default",
        slots: [{
          nickname: "slot1",
          size: { x: 0, y: 0 },
          position: { x: 0, y: 0 },
        }],
      },
      ValidatePasscodePerformerRequest: {
        room_name: "MYROOM",
        participant_name: "USER1",
        participant_type: "PERFORMER",
        passcode: "12345",
      },
      ValidatePasscodeControlRequest: {
        room_name: "MYROOM",
        participant_type: "CONTROL",
        passcode: "12345",
      },
      ValidatePasscodeOutputRequest: {
        room_name: "MYROOM",
        participant_type: "OUTPUT",
        performer_target: "USER1",
        passcode: "12345",
      },
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, doc);
