import { AppDispatch, RootState } from "../store";

export type AsyncState<T> = {
  entities: T;
  pagination?: Pagination | null;
  status: LoadingType;
  error: null | undefined | string | Record<string, unknown>;
};

export type Pagination = {
  limit: number;
  page: number;
  previousPage: number | null;
  currentPage: number;
  nextPage: number | null;
  totalPage: number;
  totalItems: number;
};

export enum LoadingType {
  IDLE = "idle",
  PENDING = "pending",
  SUCCESS = "success",
  REJECTED = "rejected",
}

export type ApiResponse<T> = {
  meta: {
    message: string;
    status: number;
  };
  data: T;
  error: null | string | Record<string, unknown>;
};

export type ApiErrorResponse = {
  message: string;
  code?: number;
  errorFields?: Record<string, string>;
};

export interface ThunkApi {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: ApiErrorResponse;
}
