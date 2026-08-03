// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export enum ExpenseCategory {
  FEED = "FEED",
  LABOR = "LABOR",
  VETERINARY = "VETERINARY",
  EQUIPMENT = "EQUIPMENT",
  MAINTENANCE = "MAINTENANCE",
  FUEL = "FUEL",
  FERTILIZER = "FERTILIZER",
  SEEDS = "SEEDS",
  WATER = "WATER",
  TRANSPORT = "TRANSPORT",
  INSURANCE = "INSURANCE",
  TAXES = "TAXES",
  SUPPLIES = "SUPPLIES",
  UTILITIES = "UTILITIES",
  MARKETING = "MARKETING",
  MISC = "MISC",
  OTHER = "OTHER",
}

export enum PaymentMethod {
  card = "card",
  mobile_money = "mobile_money",
  orange_money = "orange_money",
  paypal = "paypal",
  cash = "cash",
  others = "others",
}

export enum SaleStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/** Miroir de l'enum Prisma ProductCategory */
export enum ProductCategory {
  Product = "Product",
  byproduct = "byproduct",
}

// ─────────────────────────────────────────────────────────────────────────────
// Expense
// ─────────────────────────────────────────────────────────────────────────────

export interface Expense {
  id: number;
  farmId: number;
  category: ExpenseCategory;
  amount: number;
  taxAmount: number | null;
  totalAmount: number;
  date: string;
  paymentMethod: PaymentMethod;
  supplierId: number | null;
  invoiceNumber: string | null;
  notes: string | null;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sale
// ─────────────────────────────────────────────────────────────────────────────

export interface Sale {
  id?: number;
  farmId: number;
  date: string;
  total: number;
  clientId?: number;
  notes?: string;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  createdAt?: string;
  updatedAt?: string;
  saleItems?: SaleItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SaleItem
// ─────────────────────────────────────────────────────────────────────────────

export interface SaleItem {
  id?: number;
  saleId: number;
  productName: string;
  category?: ProductCategory;

  unit?: string;

  quantity: number;

  unitPrice: number;
  totalPrice: number;
  discount?: number;
  productionId?: number;

  lotId?: number;
  animalId?: number;

  description?: string;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}