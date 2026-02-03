

const ACCESS_TOKEN_KEY = "ap_access_token";
const REFRESH_TOKEN_KEY = "ap_refresh_token";
const USER_KEY = "ap_user";

// lib/storage.ts
export const AgroPulseStorage = {
  setAccessToken(token: string) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken(): string |null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser(user: any) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getUser(): any | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clear() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};