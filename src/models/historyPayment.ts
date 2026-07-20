export interface Invoices {
  id: number;
  organizationId: number;
  subscriptionId: number;
  amount: number;
  status: InvoiceStatus;
  paymentMethod: string;
  currency: string;
  issuedAt: Date;
}

export enum InvoiceStatus {
  pending="pending",
  paid= "paid",
  overdue= "overdue"
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
  createdAt?: string;
  updatedAt?: string;
}

export enum PaymentMethod {
  card = "card",
  mobile_money = "mobile_money",
  orange_money = "orange_money",
  paypal = "paypal",
  cash = "cash",
  others = "others",
}


export enum PaymentStatus  {
  PENDING= 'PENDING',
  SUCCESS= 'SUCCESS',
  FAILED= 'FAILED',
  CANCELLED= 'CANCELLED',
  REFUNDED= 'REFUNDED'
}