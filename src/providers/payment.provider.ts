import Stripe from "stripe";
import { PaymentGateway, PaymentGatewayResponse } from "../utils";

export class StripeGateway implements PaymentGateway {
  private readonly stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-01-27.acacia",
    });
  }
  async processPayment(
    amount: number,
    currency: string,
    paymentMethod: string
  ) {
    const payment = await this.stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethod,
      confirm: true,
    });

    return {
      status: payment.status === "succeeded" ? "succeeded" : "failed",
      id: payment.id,
      error: payment.last_payment_error,
    } as PaymentGatewayResponse;
  }
}

class MockPaymentGateway implements PaymentGateway {
  async processPayment(
    amount: number,
    currency: string,
    paymentMethod: string
  ) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (paymentMethod.startsWith("mock_success")) {
      return {
        status: "succeeded",
        id: `mock_api_${Math.random().toString(36).slice(2)}`,
      } as PaymentGatewayResponse;
    }

    if (paymentMethod.startsWith("mock_failure")) {
      return {
        status: "failed",
        error: { message: "Fundos insuficientes" },
      } as PaymentGatewayResponse;
    }

    throw new Error("Método de pagamento mock inválido");
  }
}

export function getPaymentGateway(): PaymentGateway {
  return new MockPaymentGateway();
  // return process.env.USE_MOCK_GATEWAY === "true"
  //   ? new MockPaymentGateway()
  //   : new StripeGateway();
}
