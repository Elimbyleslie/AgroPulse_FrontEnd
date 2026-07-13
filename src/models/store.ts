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


export type ApiError<TError = unknown> = {
  meta: {
    status: number;
    message: string;
  };
  error?: TError;
};


export type AuthErrorPayload = {
  emailVerified?: boolean;
  email?: string;
};




// Fonction helper pour typer les erreurs
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'message' in error)
  );
}

export interface ThunkApi {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: ApiError;
}


// --- Types Utilitaires ---
export enum LoadingType {
  IDLE = "idle",
  PENDING = "pending",
  SUCCESS = "success",
  REJECTED = "rejected",
}

export type Token = {
  type: string;
  accessToken: string;
  refreshToken: string;
  expires_in: number;
};

// --- Domaines ---
export interface AuthUser {
  id: number;
  name: string;
  userName: string;
  email: string;
  phone?: string | null;
  photo?: string;
  status: string;
  emailVerified: boolean;
  roles: string[]; // On garde le tableau de strings pour simplifier
  permissions: string[];
}

// --- État Global du Slice ---
export type AuthState = {
  user: AuthUser | null;
  token: string | null; // Juste l'accessToken pour les headers
  status: LoadingType;
  error: ApiError | null;
};

// --- Structure de réponse API standard ---
export type ApiResponse<T> = {
  meta: {
    message: string;
    status: number;
  };
  data: T;
  token?: Token;
};