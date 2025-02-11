import { EventBridge } from "aws-sdk";
import { APIGatewayProxyEvent } from "aws-lambda";

import { UserActionDTO } from "../dto";
import { UserAction, validateDto } from "../utils";

const eventBridge = new EventBridge();

export const handler = async (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    return { statusCode: 400, body: "Request body is missing" };
  }
  const { paymentId, saleId, action } = await validateDto(
    UserActionDTO,
    JSON.parse(event.body!)
  );

  const detailType =
    action === UserAction.CONFIRM ? "PaymentCreated" : "PaymentCancelled";

  const status = action === UserAction.CONFIRM ? "PAID" : "FAILED";

  await eventBridge
    .putEvents({
      Entries: [
        {
          Source: "payment.service",
          DetailType: detailType,
          Detail: JSON.stringify({ paymentId, saleId, status: status }),
          EventBusName: process.env.EVENT_BUS_NAME!,
        },
      ],
    })
    .promise();

  return { statusCode: 200, body: { message: "action registered" } };
};
