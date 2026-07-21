export enum SupplierCategory {
  FEED = "FEED",
  MEDICAL = "MEDICAL",
  EQUIPMENT = "EQUIPMENT",
  SERVICE = "SERVICE",
  OTHER = "OTHER",
}
export interface Supplier {
  id?: number;
  category: SupplierCategory;
  name: string;
  email?: string | null;
  phone?: string | null;
  farmId: number;
}

export interface FeedPurchase {
  id?: number;
  supplierId: number;
  farmId: number;
  itemName: string;
  quantity: number;
  unitPrice?: number | null;
  totalAmount: number;
}


export interface Purchase {
  id: number;
  supplierId: number;
  farmId: number;
  totalAmount: number;
  notes?: string;
  purchaseDate: string; 
  itemName:string;
  invoiceNumber?: string;
  createdAt: string;
  taxAmount?: number;
  status: PurchaseStatus;
  createdById?: number;
}

export enum PurchaseStatus {
  PENDING = "PENDING",
  RECEIVED="RECEIVED",
  CANCELLED = "CANCELLED",
}


