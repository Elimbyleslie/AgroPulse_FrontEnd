import { User } from "../models/user";
import { AgroPulseStorage } from "./storage";

export const AgroPulseAuth = {
  isAuthenticated(): boolean {
    return !!AgroPulseStorage.getAccessToken();
  },

  getUser() {
    return AgroPulseStorage.getUser();
  },

  

  login(payload: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }) {
    AgroPulseStorage.setAccessToken(payload.accessToken);
    AgroPulseStorage.setRefreshToken(payload.refreshToken);
    AgroPulseStorage.setUser(payload.user);
  },

  logout() {
    AgroPulseStorage.clear();
    window.location.href = "/auth/login";
  },
};
