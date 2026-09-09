/* eslint-disable @typescript-eslint/no-explicit-any */
import { Supplier } from "./achats&fournisseur";
import { Inventory } from "./alimentation";
import { Client } from "./client";
import { Farm } from "./farm";

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────
export interface Expense {
  id: number;
  farmId: number;
  category: ExpenseCategory;
  amount: number;
  taxAmount?: number | null;
  totalAmount: number;
  date: string;
  paymentMethod: PaymentMethod;
  supplierId?: number | null;
  invoiceNumber?: string | null;
  notes?: string | null;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: number | null;

  farm?: Farm;
  supplier?: Supplier | null;
  createdBy?: { id: number; name?: string } | null;
}

export interface Sale {
  id: number;
  farmId: number;
  date: string;
  total?: number | null;
  notes?: string | null;
  clientId?: number | null;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;

  farm?: Farm;
  client?: Client | null;
  saleItems?: SaleItem[];
  payments?: Payment[];
}

export interface SaleItem {
  id: number;
  saleId: number;
  productName: string;
  category: string; // ProductCategory
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  productionId?: number | null;
  lotId?: number | null;
  animalId?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;

  sale?: Sale;
  production?: any | null;
  lot?: any | null;
  animal?: any | null;
}

export type CreateSalePayload = {
  farmId: number;
  date: string;
  notes?: string | null;
  clientId?: number | null;
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
  saleItems: Array<{
    productName: string;
    category: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount?: number;
    productionId?: number | null;
    lotId?: number | null;
    animalId?: number | null;
    notes?: string | null;
  }>;
};
export type CreateExpensePayload = Omit<
  Expense,
  "id" | "createdAt" | "updatedAt" | "farm" | "supplier" | "createdBy"
>;

export type UpdateExpensePayload =  Partial<CreateExpensePayload>;


export enum ExpenseCategory {
  FEED= "FEED",
  VETERINARY= "VETERINARY",
  EQUIPMENT= "EQUIPMENT",
  MAINTENANCE= "MAINTENANCE",
  LABOR= "LABOR",
  FUEL= "FUEL",
  FERTILIZER= "FERTILIZER",
  SEEDS= "SEEDS", 
  WATER= "WATER", 
  TRANSPORT ="TRANSPORT",
  INSURANCE= "INSURANCE",
  TAXES= "TAXES",
  SUPPLIES= "SUPPLIES",
  UTILITIES= "UTILITIES",
  MARKETING= "MARKETING",
  MISC= "MISC",
  OTHER= "OTHER",
}
export enum SaleStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
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
export enum ProductCategory {
  Product = "Product",
  byproduct = "byproduct",
}



export interface Payment {
  id: number;
  farmId: number;
  saleId?: number | null;
  purchaseId?: number | null;
  expenseId?: number | null;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  recordedById?: number | null;
  createdAt: string;
  updatedAt: string;

  farm?: any;
  sale?: Sale | null;
  purchase?: any | null;
  expense?: Expense | null;
  recordedBy?: { id: number; name?: string } | null;
  inventory?:Inventory;
}


export type CreatePaymentPayload = {
  farmId: number;
  saleId?: number | null;
  purchaseId?: number | null;
  expenseId?: number | null;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  status?: PaymentStatus;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string | null;
};

