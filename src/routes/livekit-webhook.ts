import { WebhookReceiver } from "livekit-server-sdk";
import { RequestHandler } from "express";
import { livekitWebhook } from "../controller/livekitWebhook";
import { ApiPayload, ErrorType } from "@thegoodwork/ximi-types";

const livekitWebhookHandler: RequestHandler = async (req, res) => {
  /*
  #swagger.tags = ['Webhook']
  #swagger.description = 'Handle api request sent from livekit'
  #swagger.responses[500] = {
    schema: {
      status: 'success',
      message: 'Webhook event triggered success'
    }
  }
  #swagger.responses[500] = {
    schema: {
      status: 'error',
      error: 'Internal server error'
    }
  }
  */

  const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );

  try {
    const successPayload: ApiPayload = {
      status: "success",
      message: "Webhook event triggered success",
    };
    const result = receiver.receive(
      (req as any).rawBody,
      req.headers.authorization
    );

    await livekitWebhook(result);

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

export { livekitWebhookHandler };
