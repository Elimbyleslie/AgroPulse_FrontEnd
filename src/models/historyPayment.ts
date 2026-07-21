// src/models/invoice.ts

export enum InvoiceStatus {
  pending = "pending",
  paid = "paid",
  overdue = "overdue",
}

export interface Invoice {
  id: number;
  organizationId: number;
  subscriptionId: number;
  amount: number;
  status: InvoiceStatus;
  paymentMethod: string;
  currency: string;
  issuedAt: string;
  // Présent dans createInvoice (req.body.dueAt) mais absent de l'interface fournie.
  dueAt?: string;
}

export interface InvoiceWithSubscription extends Invoice {
  subscription?: {
    id: number;
    planId?: number;
    status?: string;
  } | null;
}

export enum PaymentMethod {
  card = "card",
  mobile_money = "mobile_money",
  orange_money = "orange_money",
  paypal = "paypal",
  cash = "cash",
  others = "others",
}
 
export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}
 
export interface Payment {
  id: number;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  status?: PaymentStatus;
  reference: string;
  description?: string;
  userId?: number;
  saleId?: number;
  organizationId?: number;
  farmId?: number;
  purchaseId?: number;
  createdAt?: string;
  updatedAt?: string;
}
 
// Forme retournée par la liste (avec relations incluses par le controller)
export interface PaymentWithRelations extends Payment {
  user?: { id: number; name?: string; email?: string } | null;
  sale?: { id: number; reference?: string } | null;
  organization?: { id: number; name?: string } | null;
  farm?: { id: number; name?: string } | null;
  purchase?: { id: number; reference?: string } | null;
}