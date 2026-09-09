/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subscription } from "./abonnementFacturation";
import { Payment, Sale } from "./gestionFinanciere";
import {SubscriptionPayment} from "./SubcriptionPayment";

export interface Invoice {
  id: number;
  organizationId: number;
  subscriptionId?: number | null;
  number: string;
  status: InvoiceStatus;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  issuedAt: string;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  method: PaymentMethod;

  organization?: any;
  subscription?: Subscription | null;
  payments?: SubscriptionPayment;
}

export enum InvoiceStatus {
  DRAFT="DRAFT",
  OPEN="OPEN",
  PAID="PAID",
  VOID="VOID",
  UNCOLLECTIBLE="UNCOLLECTIBLE",
}




export enum PaymentMethod {
  cash = "cash",
  mobile_money = "mobile_money",
  bank_transfer = "bank_transfer",
  orange_money = "orange_money",
  check = "check",
  card = "card",
  other = "other",
}
export enum PaymentStatus {
  PENDING = "PENDING",
  PARTIAL= "PARTIAL",
  COMPLETED= "COMPLETED",
  FAILED= "FAILED",
  CANCELLED= "CANCELLED",
  REFUNDED= "REFUNDED"
}


export interface PaymentWithRelations extends Payment {
  user?: { id: number; name?: string; email?: string } | null;
  sale?: Sale | null;
  organization?: { id: number; name?: string } | null;
  farm?: { id: number; name?: string } | null;
  purchase?: { id: number; reference?: string } | null;
}


export interface InvoiceWithSubscription extends Invoice {
  subscription?: Subscription | null;
  payments?: SubscriptionPayment;
}

export type CreateInvoicePayload = {
  organizationId: number;
  subscriptionId?: number | null;
  amount: number;
  taxAmount?: number;
  currency?: string;
  status?: InvoiceStatus;
  periodStart?: string | null;
  periodEnd?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  method:PaymentMethod
};

