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
    ValidatePasscodeRequest: {
      room_name: "myRoom",
      participant_name: "user1",
      participant_type: "PERFORMER | CONTROL | OUTPUT",
      passcode: "12345",
    },
    IncorrectPasscodeErrorResponse: {
      message: "Incorrect passcode",
    },
    RoomNotExistErrorResponse: {
      message: "Room does not exist",
    },
    MaximumRoomErrorResponse: {
      message: "Max 10 rooms allowed",
    },
    InvalidRoomErrorResponse: {
      message: "Invalid room name or passcode",
    },
  },
  components: {
    examples: {
      ValidatePasscodePerformerRequest: {
        room_name: "myRoom",
        participant_name: "user1",
        participant_type: "PERFORMER",
        passcode: "12345",
      },
      ValidatePasscodeControlRequest: {
        room_name: "myRoom",
        participant_type: "CONTROL",
        passcode: "12345",
      },
      ValidatePasscodeOutputRequest: {
        room_name: "myRoom",
        participant_type: "OUTPUT",
        passcode: "12345",
      },
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, doc);
