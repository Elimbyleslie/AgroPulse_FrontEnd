import { Invoice } from "./historyPayment";
import { SubscriptionPayment } from "./SubcriptionPayment";

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  PAUSED = "PAUSED",
}

export enum BillingInterval {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}


export interface Subscription {
  id: number;
  organizationId: number;
  planId: number;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  amount: number;
  currency: string;
  trialStart?: string | null;
  trialEnd?: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string | null;
  endedAt?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;

  organization?: organizationRes;
  plan?: Plan;
  invoices?: Invoice[];
  payments?: SubscriptionPayment;
}


export interface Plan {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly?: number | null;
  currency: string;
  maxFarms?: number | null;
  maxUsers?: number | null;
  maxAnimals?: number | null;
  features?: Record<string, unknown> | null;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;

  subscriptions?: Subscription[];
}

export interface SubscriptionWithPlan extends Subscription {
  plan?: Plan;
}

export interface organizationRes {
  id: number;
  name: string;
  address?: string;
  ownerName: string;
  email?: string;
  phone?: string;
  ownerId: number;
  createdAt: string;
}