import { User } from "./user.js";
export interface Equipement {
  id: number;
  farmId: number;
  name: string;
  description?: string;
  purchaseDate: Date;
  status: EquipmentStatus;
  value?: number;
  maintenanceFrequency?: MaintenanceFrequency;
}



export enum EquipmentStatus {
  operational = "operational",
  underMaintenance = "underMaintenance",
  outOfService = "outOfService",
}


export interface EquipmentMaintenance {
  id: number;
  equipmentId: number;
  farmId: number;
  name: string;
  maintenanceDate: string | Date;
  cost?: number | null;
  notes?: string | null;
  userId?: number | null;

  
  equipment?: Equipement;
  user?: User;
}

export enum MaintenanceFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
  CUSTOM = "custom",
}

// DTO pour création / mise à jour
export interface CreateEquipmentDto {
  farmId: number;
  name: string;
  description?: string;
  purchaseDate?: string;
  inventoryId?: number;
  status?: EquipmentStatus;
  value?: number;
  maintenanceFrequency?: MaintenanceFrequency;
}

export interface CreateEquipmentMaintenanceDto {
  equipmentId: number;
  farmId: number;
  name: string;
  maintenanceDate: string;
  cost?: number;
  notes?: string;
  userId?: number;
}