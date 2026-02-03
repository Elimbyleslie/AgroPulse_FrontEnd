// lib/utils.ts
import { AgroPulseStorage } from "../guards/storage";

let accessToken: string | null = AgroPulseStorage.getAccessToken();

export const authStore = {
  getToken: () => {
    if (!accessToken) {
      accessToken = AgroPulseStorage.getAccessToken();
    }
    return accessToken;
  },
  
  setToken: (token: string) => {
    accessToken = token;
    AgroPulseStorage.setAccessToken(token);
  },
  
  clear: () => {
    accessToken = null;
    AgroPulseStorage.clear();
  },
};