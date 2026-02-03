export const PATH_AUTH = {
  AUTH: "/auth",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY_OTP: '/auth/Verify-otp',
  SUCCESS_VERIFY_OTP: "/auth/success-verify-otp",
  FORGOT_PASSWORD: "/auth/forgotpassword",
  RESET_PASSWORD: "/auth/reset-password",
  UPDATE_PASSWORD: "/auth/update-password",
  CHANGE_PASSWORD: "/auth/change-password",
  VERIFY_EMAIL_OTP: "/auth/verify-email-otp",
  SEND_EMAIL_VERIFICATION_OTP: "/auth/send-email-verification-otp",
  LOGOUT: "/auth/logout",
  GOOGLE_CALLBACK: "auth/google/callback",
 GOOGLE: "auth/google",

};

export const PATH_MAIN = {
  DASHBOARD: "/main/dashboard",
  SETTINGS: "settings",
  ANIMAL_LIST: "animal",
  ANIMAL_HEALTH: "animal-health",
  ANIMAL_DEATH: "animal-death",
  ORGANISATIONS: "organizations",
  CREATE_FARM: "create-farm",
} as const;



