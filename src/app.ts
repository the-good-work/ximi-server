import express, { Request, Response } from "express";
import bodyParser, { json } from "body-parser";
import { config } from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { createRoomHandler } from "./routes/create-room";
import { listRoomHandler } from "./routes/list-room";
import { validateNameHandler } from "./routes/validate-name";
import { validatePasscodeHandler } from "./routes/validate-passcode";
import { livekitWebhookHandler } from "./routes/livekit-webhook";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

var rawBodySaver = function (
  req: Request,
  _res: Response,
  buf: Buffer,
  encoding: BufferEncoding
) {
  if (buf && buf.length) {
    (req as any).rawBody = buf.toString(encoding || "utf8");
  }
};

app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: "*/*" }));

app.post("/livekit-webhook", livekitWebhookHandler);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(require("../swagger_output.json"))
);

app.post("/rooms/create", createRoomHandler);

app.get("/rooms/list", listRoomHandler);

app.post("/rooms/validate-name", validateNameHandler);

app.post("/rooms/validate-passcode", validatePasscodeHandler);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
