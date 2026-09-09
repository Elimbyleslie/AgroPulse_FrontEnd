import { User } from "./user";
import { Farm } from "./farm";

export interface FarmUser {
  id: number;
  farmId: number;
  userId: number;
  farm?: Farm; 
  user?: User;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string | Date;
  farmTaskId?:number
}

export  interface ActivityLog {
    id: number;
    userId: number;
    action: string;
    description: string;
    createdAt?: string | Date;
    ipAddress?: string;
  }
 
  export interface Settings {
  id?: number;
  organizationId?: number;
  farmId?: number;

  // Configuration Générale
  currency: string;
  language: string;
  dateFormat: string;
  timezone: string;

  // Unités de Mesure
  weightUnit: string;
  volumeUnit: string;
  areaUnit: string;

  // Paramètres d'Élevage
  defaultSpeciesId?: number;
  defaultBreedId?: number;
  heatDetectionDays: number;
  gestationDuration: number;

  // Notifications
  enableEmailAlerts: boolean;
  enableSmsAlerts: boolean;
  lowStockThreshold: number;

  // Finance
  taxRate?: number;
  defaultPaymentMethod: PaymentMethod;

  // Apparence
  primaryColor?: string;
  logoUrl?: string;
  farmName?: string;

  createdAt?: string;
  updatedAt?: string;
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