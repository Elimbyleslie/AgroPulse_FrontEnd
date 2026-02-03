// src/hooks/useAuth.ts
import { useAppSelector } from "../hooks/store";
import {
  selectIsAuthenticated,
  selectCurrentUser, 
  selectAuthStatus,
  selectAccessToken,
} from "../store/auth/slice";

export function useAuth() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const auth = useAppSelector(selectCurrentUser);
  const status = useAppSelector(selectAuthStatus)
  const token = useAppSelector(selectAccessToken);
  return {
    isAuthenticated,
    user: auth,
    token: token,
    status: status,
  };
}
