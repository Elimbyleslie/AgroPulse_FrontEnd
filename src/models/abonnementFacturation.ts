export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum RenewalType {
  AUTO = "AUTO",
  MANUAL = "MANUAL",
}

export interface Subscription {
  id: number;
  organizationId: number;
  planId: number;
  startDate: Date | string;
  endDate: Date | string;
  renewalType: RenewalType;
  status: SubscriptionStatus;
}

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  description: string;
  billingCycle: BillingCycle;
  userLimit: number;
  storageLimit: number;
  animalLimit: number;
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