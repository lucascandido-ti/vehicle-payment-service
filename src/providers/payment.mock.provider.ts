export interface PaymentCreatedEvent {
  paymentId: string;
  saleId: number;
  status: "PAID" | "FAILED";
}

export class MockPaymentGateway {
  async createPayment(amount: number, paymentMethod: string) {
    const paymentId = `mock_${Math.random().toString(36).substr(2, 9)}`;

    return {
      paymentId,
      status: "PENDING",
      requiresAction: paymentMethod.includes("3ds"),
      paymentUrl: "",
    };
  }
}

export interface PaymentResultEvent {
  paymentId: string;
  saleId: number;
  status: "PAID" | "FAILED";
  failureReason?: string;
}

export class MockPaymentProcessor {
  async simulateAsyncPayment({
    paymentId,
    saleId,
    status,
  }: PaymentCreatedEvent): Promise<PaymentResultEvent> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (status === "PAID") {
      return {
        paymentId,
        saleId: saleId,
        status: "PAID",
      };
    } else {
      return {
        paymentId,
        saleId: saleId,
        status: "FAILED",
        failureReason: "Insufficient balance",
      };
    }
  }
}
