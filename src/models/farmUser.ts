export interface FarmUser {
  id: number;
  farmId: number;
  userId: number;
  farm?: { id: number; name: string };
  user?: { id: number; name: string; email?: string };
}

export interface FarmUserCreateInput {
  farmId: number;
  userId: number;
}

export interface FetchFarmUsersArgs {
  farmId: number;
}