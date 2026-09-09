/* eslint-disable @typescript-eslint/no-explicit-any */
import { Invoice } from "./historyPayment";
import { Subscription } from "./abonnementFacturation";
import { PaymentMethod } from "./historyPayment";

export enum SubscriptionPaymentStatus {
  PENDING ="PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export interface SubscriptionPayment {
  id: number;
  organizationId: number;
  subscriptionId?: number | null;
  invoiceId?: number | null;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: SubscriptionPaymentStatus;
  provider?: string | null;
  providerRef?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;

  organization?: any;
  subscription?: Subscription | null;
  invoice?: Invoice | null;
}


// models/SubcriptionPayment.ts (complément)

export type CreateSubscriptionPaymentPayload = {
  organizationId: number;
  subscriptionId?: number | null;
  invoiceId?: number | null;
  amount: number;
  currency?: string;
  method: PaymentMethod | string;
  status?: SubscriptionPaymentStatus | string;
  provider?: string | null;
  providerRef?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type UpdateSubscriptionPaymentStatusPayload = {
  status: SubscriptionPaymentStatus | string;
  providerRef?: string | null;
  paidAt?: string | null;
  notes?: string | null;
};