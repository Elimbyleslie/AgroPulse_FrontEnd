export enum TaskStatus {
  pending = "pending",
  inProgress = "inProgress",
  completed = "completed",
  cancelled = "cancelled",
}

export interface FarmTask {
  id: number;
  farmId: number;
  title: string;
  description?: string | null;
  assignedTo?: number | null;
  status: TaskStatus;
  createdBy: number;
  dueDate?: string | null;
  creator?: { id: number; name: string; email?: string } | null;
  assignedUser?: { id: number; name: string; email?: string } | null;
  farm?: { id: number; name: string } | null;
}

export interface FarmTaskCreateInput {
  farmId: number;
  title: string;
  description?: string;
  assignedTo?: number | null;
  status?: TaskStatus;
  dueDate?: string | null;
}

export type FarmTaskUpdateInput = Partial<
  Omit<FarmTaskCreateInput, "farmId">
> & {
  id: number;
};

export interface FetchFarmTasksArgs {
  farmId?: number;
  status?: TaskStatus;
  search?: string;
  page?: number;
  limit?: number;
  assignedTo?: number;
}

export interface FarmTaskPagination {
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
