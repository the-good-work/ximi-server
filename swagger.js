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
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "Rooms",
      description: "List of endpoints related to room",
    },
  ],
  definitions: {
    CreateRoomRequest: {
      name: "myRoom",
      passcode: "12345"
    },
    ValidateNameRequest: {
      name: "user1"
    },
    ValidatePasscodeRequest: {
      room_name: "myRoom",
      participant_name: "user1",
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
