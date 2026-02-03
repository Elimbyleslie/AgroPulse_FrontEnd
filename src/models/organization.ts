// 🔹 Types
export interface OrganizationInput {
  name: string;
  address?: string;
  ownerName: string;
  email?: string;
  phone?: string;
  ownerId:number;
}

export interface OrganizationUpdateInput {
  name?: string;
  address?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
}
export interface organizationRes{
  id:number
  name: string;
  address?: string;
  ownerName: string;
  email?: string;
  phone?: string;
  ownerId:number;
  createdAt:string;

}

export interface PaginationParams {
  page?: number;
  limit?: number;
}