
export interface FarmCreateInput {
  organizationId: number; 
  name: string;
  location: string;
  managerId: number;
  area?: number;
  areaUnit?: string;
  photo?: string;
}

export interface FarmUpdateInput {
  id: number;
  organizationId?: number;
  name: string;
  location: string;
  area?: number;
  areaUnit?: string;
  photo?: string;
}

export interface Farm {
  id: number;
  organizationId: number;
  name: string;
  location: string;
  area?: number;
  managerId: number;
  areaUnit?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FetchFarmsArgs = {
  limit: number;
  page?: number;
  search?: string;
};



export type FarmPagination = {
  limit: number;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  totalPage: number;
  totalItems: number;
};

export type BackendFarmResponse<T> = {
  meta: {
    status: number;
    message: string;
  };
  data: T;
  error: null | string;
};