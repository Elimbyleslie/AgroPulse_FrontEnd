import { AuthUser } from "../models/user";

const JWT = btoa("GETSMARTER-0001");
const REFRESH_TOKEN = btoa("GETSMARTER-0002");
const EXPIRES_IN_SECONDS = btoa("GETSMARTER-0003");
const EXPIRES_AT = btoa("GETSMARTER-00895");
const USER = btoa("GETSMARTER-0004");
const LANGUAGE = btoa("GETSMARTER-0005");

const REFS = {
  JWT,
  REFRESH_TOKEN,
  EXPIRES_IN_SECONDS,
  EXPIRES_AT,
  USER,
  LANGUAGE,
};

class Utils {
  static formatData = (value: object) => {
    const data = new FormData();
    for (const [key, val] of Object.entries(value)) {
      if (Array.isArray(val)) {
        val.forEach((item) => {
          data.append(key, item);
        });
      } else {
        data.append(key, val);
      }
    }
    return data;
  };

  static saveInLocalStorage = (payload: AuthUser) => {
    const { token } = payload;
    this.setJWT(token?.accessToken);
    this.setRefreshToken(token?.refreshToken ? token?.refreshToken : "");
    this.setExpiresInSeconds(
      token?.expires_in ? token?.expires_in : Date.now()
    );
    this.setLocalUser(payload);
  };

  static setJWT = (jwtStr: string) => {
    localStorage.setItem(REFS.JWT, jwtStr);
  };

  static getJWT = () => localStorage.getItem(REFS.JWT);

  static setRefreshToken = (rStr: string) => {
    localStorage.setItem(REFS.REFRESH_TOKEN, rStr);
  };

  static getRefreshToken = () => localStorage.getItem(REFS.REFRESH_TOKEN);

  static setExpiresInSeconds = (exp: number) => {
    localStorage.setItem(
      REFS.EXPIRES_AT,
      (Date.now() + exp * 1000)?.toString()
    );
    localStorage.setItem(REFS.EXPIRES_IN_SECONDS, exp.toString());
  };

  static getExpiresInSeconds = () =>
    localStorage.getItem(REFS.EXPIRES_IN_SECONDS);

  static getExpiresAt = () => localStorage.getItem(REFS.EXPIRES_AT);

  static setLocalUser = (user: unknown) => {
    localStorage.setItem(REFS.USER, JSON.stringify(user));
  };

  static getLocalUser = () => {
    const userData = localStorage.getItem(REFS.USER);
    if (!userData) return null;
    return JSON.parse(userData);
  };

  static clearLocalUser = () => {
    localStorage.removeItem(REFS.USER);
  };

  static clearTokens = () => {
    localStorage.removeItem(REFS.EXPIRES_IN_SECONDS);
    localStorage.removeItem(REFS.JWT);
    localStorage.removeItem(REFS.REFRESH_TOKEN);
    localStorage.removeItem(REFS.EXPIRES_AT);
    localStorage.removeItem(REFS.USER);
  };

  static hasRole = (requiredRoles: string[] | undefined) => {
    const user = this.getLocalUser();
    if(!requiredRoles?.length)  return false;

    if (user) {
      if (!user.roles || !requiredRoles) return false;

      return requiredRoles.every((role: string) =>
        user.roles.includes(role)
      );
    }
    return false;
  };

  static hasPermission = (requiredPermissions: string[] | undefined) => {
    const user = this.getLocalUser();
if(!requiredPermissions?.length)  return false;

    if (user) {
      if (!user.permissions || !requiredPermissions) return false;
      return requiredPermissions.every((permission: string) =>
        user.permissions.includes(permission)
      );
    }
    return false;
  };
}

export default Utils;
