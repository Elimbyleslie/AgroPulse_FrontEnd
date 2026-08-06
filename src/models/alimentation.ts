import {Farm} from "./farm";
import {Supplier} from "./achats&fournisseur";


export interface Inventory {
  id: number;
  farmId: number;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  createdAt?: Date;
  updatedAt?: Date;
  minQuantity?: number;
  unitPrice?: number;
  totalValue?: number;
  expiryDate?: Date;
  location?: string;
  supplierId?: number;
  status?: StockStatus;
  sku?: string;
}



export enum InventoryCategory {
    FEED = "FEED", 
  MEDICINE = "MEDICINE",
  SUPPLEMENT = "SUPPLEMENT",
  FERTILIZER= "FERTILIZER",
  SEED = "SEED",
  EQUIPMENT = "EQUIPMENT",
  TOOL = "TOOL",
  CHEMICAL= "CHEMICAL",
  PACKAGING = "PACKAGING",
  FUEL = "FUEL",
  OTHER= "OTHER"
}

export enum StockStatus {
  IN_STOCK = "IN_STOCK",
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  EXPIRED = "EXPIRED"
}

export interface inventoryEntry { 
  id: number;
  inventoryId: number;
  quantity: number;
  date: string;
  supplierId?: number;
  unitPrice?: number;
  notes?: string;
}

export interface FeedUsage {
  id: number;
  lotId: number;
  inventoryId: number;
  inventory?: Inventory;        // relation typée
  quantity: number;
  date: string;
  animalFeedingId?: number;     // lien vers la distribution
}

// ─── Plan des Rations ─────────────────────────────────────────────────
export type AnimalFeeding = {
  id: number
  animalId: number
  inventoryId: number          
  quantity: number
  unit: string
  date: Date
  lotId: number
  userId: number
  createdAt: Date
  updatedAt: Date

}

export type FeedingPlan = {
  id: number
  feedStockId: number        
  quantity: number
  unit: string
  animalId: number
  frequency: Frequency
  startDate: Date
  endDate: Date | null
  farmId: number
  userId: number
  lotId: number | null
  herdId: number | null
  penId: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  lastDistributedAt: Date | null
  feedStock?: FeedStock

}

export  enum Frequency {
  daily = "daily",
  weekly = "weekly",
  custom ="custom"
}



export enum FeedCategory {
  CONCENTRATE = "CONCENTRATE",
  FORAGE = "FORAGE",
  SUPPLEMENT = "SUPPLEMENT",
  MINERAL = "MINERAL",
  SILAGE = "SILAGE",
  OTHER = "OTHER",
}


export interface FeedStock {
  id: number;
  farmId: number;
  name: string;
  category?: FeedCategory;
  quantity: number;       
  unit: string;
  minQuantity?: number;
  unitPrice?: number;
  totalValue?: number;
  expiryDate?: Date | null;
  location?: string | null;
  supplierId?: number | null;
  sku?: string | null;
  status: StockStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  farm?: Farm;
  supplier?: Supplier;
  feedUsages?: FeedUsage[];
  animalFeedings?: AnimalFeeding[];
  feedingPlans?: FeedingPlan[];
}

// Pour la création
export type CreateFeedStockInput = Omit<FeedStock, 
  'id' | 'createdAt' | 'updatedAt' | 'totalValue' | 'status'
> & {
  quantity: number;
  totalValue?: number;
  status?: StockStatus;
};

// Pour la mise à jour
export type UpdateFeedStockInput = Partial<CreateFeedStockInput>;