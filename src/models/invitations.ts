export interface Invitation {
     id: number;
     token: string;
     organizationId: number;
     farmId: number;
     roleId: number;
     createdBy: number;
     expiresAt?: string | null;
     maxUses: number | null;
     usedCount: number;
     createdAt: string;
     farm?: { id: number; name: string };
     creator?: { id: number; name: string };
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