import { EventBridge } from "aws-sdk";

import { MockPaymentGateway, PaymentCreatedEvent } from "../providers";
import { SaleData } from "../utils";
import { sendPaymentNotification } from "../providers/notification.provider";

const eventBridge = new EventBridge();

export class PaymentRepository {
  async process({ sale, user }: SaleData) {
    const gateway = new MockPaymentGateway();

    const payment = await gateway.createPayment(sale.price, "boleto");

    console.debug(
      "[PaymentRepository][process][payment]",
      JSON.stringify(payment)
    );

    await sendPaymentNotification({
      amount: sale.price,
      paymentId: payment.paymentId,
      paymentUrl: payment.paymentUrl,
      saleId: sale.id!,
      userEmail: user.email!,
      userPhone: user.phone_number,
    });

    console.debug(
      "[PaymentRepository][process][eventBridge]",
      JSON.stringify({
        Source: "payment.service",
        DetailType: "PaymentPending",
        Detail: JSON.stringify({
          paymentId: payment.paymentId,
          saleId: sale.id,
          userId: user.id,
          paymentUrl: payment.paymentUrl,
        }),
        EventBusName: process.env.EVENT_BUS_NAME!,
      })
    );

    await eventBridge
      .putEvents({
        Entries: [
          {
            Source: "payment.service",
            DetailType: "PaymentPending",
            Detail: JSON.stringify({
              paymentId: payment.paymentId,
              saleId: sale.id,
              userId: user.id,
              paymentUrl: payment.paymentUrl,
            }),
            EventBusName: process.env.EVENT_BUS_NAME!,
          },
        ],
      })
      .promise();
  }
}
