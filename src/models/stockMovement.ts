import {Inventory} from "./alimentation";
import { User} from "./user";

export interface StockMovement {
  id: number;
  inventoryId: number;
  type: StockMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  date: Date;
  reference?: string;
  notes?: string;
  userId?: number;

  inventory?: Inventory;
  user?: User;
}

export enum StockMovementType {
  PURCHASE = "PURCHASE",
  USAGE = "USAGE",
  ADJUSTMENT = "ADJUSTMENT",
  TRANSFER = "TRANSFER",
  RETURN = "RETURN",
  WASTE = "WASTE",
}

export interface CreateStockMovementDto {
  inventoryId: number;
  type: StockMovementType;
  quantity: number;
  reference?: string;
  notes?: string;
  userId?: number;
  farmId: number; // Pour vérification de sécurité
}

export interface UpdateStockMovementDto {
  quantity?: number;
  notes?: string;
  reference?: string;
}