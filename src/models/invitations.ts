export interface Invitation {
  id: number;
  token: string;
  organizationId: number;
  farmId?: number | null;
  roleId?: number | null;
  createdBy: number;
  expiresAt?: string | null;
  maxUses?: number | null;
  usedCount: number;
  createdAt: string;
  farm?: { id: number; name: string } | null;
}

export interface InvitationValidation {
  organizationName: string;
  farmName: string | null;
  token: string;
}

export interface InvitationCreateInput {
  farmId?: number;
  roleId?: number;
  expiresAt?: string;
  maxUses?: number | null; 
}