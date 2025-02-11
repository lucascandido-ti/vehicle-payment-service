import { Topic } from "./enums";

export interface SaleData {
  sale: Sale;
  user: IUser;
}

export interface IUser {
  id?: string;
  email?: string;
  phone_number?: string;
  name?: string;
  address?: string;
  cnh?: string;
  rg?: string;
  user_type?: string;
}

export enum SalesStatus {
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  CONCLUDED = "CONCLUDED",
}

export interface Sale {
  id?: number;
  reservation_id: number;
  price: number;
  status: SalesStatus;
}

export interface SaleEvent {
  sale: SaleData;
}

export interface SalesAndReservationEventMessage<T> {
  topic: Topic;
  data: T;
}
export interface EventMessage {
  reservation?: SalesAndReservationEventMessage<SaleData>;
}

export interface PaymentResultEvent {
  saleId: number;
  status: "PAID" | "FAILED";
  timestamp: string;
  message?: string;
}

export interface PaymentGatewayResponse {
  status: "succeeded" | "failed";
  id?: string;
  error?: { message: string };
}

export interface PaymentGateway {
  processPayment(
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<PaymentGatewayResponse>;
}
