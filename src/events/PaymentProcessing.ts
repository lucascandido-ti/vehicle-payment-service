import { EventBridge } from "aws-sdk";
import { EventBridgeEvent } from "aws-lambda";

import { MockPaymentProcessor, PaymentCreatedEvent } from "../providers";

const eventBridge = new EventBridge();

export const handler = async (
  event: EventBridgeEvent<
    "PaymentCreated" | "PaymentCancelled",
    PaymentCreatedEvent
  >
) => {
  const paymentCreated = event.detail;
  const processor = new MockPaymentProcessor();

  const result = await processor.simulateAsyncPayment(paymentCreated);

  console.debug(
    "[PaymentProcessing][handler]|[result] => ",
    JSON.stringify(result)
  );

  await eventBridge
    .putEvents({
      Entries: [
        {
          Source: "payment.service",
          DetailType:
            result.status === "PAID" ? "PaymentCompleted" : "PaymentFailed",
          Detail: JSON.stringify({
            ...result,
          }),
          EventBusName: process.env.EVENT_BUS_NAME!,
        },
      ],
    })
    .promise();
};
