/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ActivityLog {
  id: number;
  userId?: number | null;
  action?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  createdAt: Date | string;
  user?: {
    id: number;
    name?: string;
    email?: string;
  } | null;
}

export interface Audit {
  id: number;
  userId?: number | null;
  organizationId?: number | null;
  farmId?: number | null;
  tableTarget: string;
  action: string;
  recordId?: number | null;
  description?: string | null;
  previousData?: any | null;
  newData?: any | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date | string;
  user?: {
    id: number;
    name?: string;
    email?: string;
  } | null;
  farm?: {
    id: number;
    name?: string;
  } | null;
  organization?: {
    id: number;
    name?: string;
  } | null;
}
