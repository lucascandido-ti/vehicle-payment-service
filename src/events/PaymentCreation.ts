import { SQSEvent } from "aws-lambda";

import { PaymentRepository } from "../repository";
import { SaleData, SalesAndReservationEventMessage, Topic } from "../utils";

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const event: SalesAndReservationEventMessage<SaleData> = JSON.parse(
      record.body
    );

    console.debug("[SaleVehicle][Event][Sale]", JSON.stringify(event));

    if (!event || event.topic !== Topic.CREATE_SALES_REQUESTS) return;

    const repository = new PaymentRepository();

    try {
      await repository.process(event.data);
    } catch (error: any) {
      console.error("Error process event:", error);
      return { statusCode: error.statusCode, body: error.message };
    }
  }
};
