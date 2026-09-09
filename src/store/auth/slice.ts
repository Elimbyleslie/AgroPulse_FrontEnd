/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  loginAction,
  register,
  verifyOtp,
  resendOtp,
  refreshToken,
  logout,
  resetPassword,
  sendEmailVerificationOtp,
  updatePassword,
  changePassword,
  verifyEmailOTP,
  getMe,
  fetchCurrentUser,
} from "./action";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "../../models/user";
import { LoadingType, ApiError } from "../../models/store";
import { RootState } from "..";
import { AgroPulseStorage } from "../../guards/storage";

const transformUserData = (data: any): { user: any; token: any } | any => {
  if (!data) return null;

  // Cas : { user: {...}, token: {...} }
  if (data.user && data.token) {
    const user = {
      ...data.user,
      id: data.user.id_user || data.user.id || data.user.uid,
    };
    return { user, token: data.token };
  }

  // Cas : user seul (getMe, fetchCurrentUser)
  return {
    ...data,
    id: data.id_user || data.id || data.uid,
  };
};

type AuthState = {
  auth: {
    status: LoadingType;
    user: Omit<AuthUser, "token"> | null;
    token: string | null;
    error: ApiError | null | undefined;
  };
};

const initialState: AuthState = {
  auth: {
    status: LoadingType.IDLE,
    user:  AgroPulseStorage.getUser(),   
    token: AgroPulseStorage.getAccessToken(),
    error: null,
  },
};

const AuthSlice = createSlice({
  name: "authentification",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.auth.token = action.payload;
      AgroPulseStorage.setAccessToken(action.payload);
    },

    setUserSession: (
      state,
      action: PayloadAction<{ token: string; user?: any }>,
    ) => {
      state.auth.token = action.payload.token;
      AgroPulseStorage.setAccessToken(action.payload.token);

      if (action.payload.user) {
        const transformedUser = transformUserData(action.payload.user);
        state.auth.user = transformedUser;
        AgroPulseStorage.setUser(transformedUser);
      }
    },

    logoutLocal: (state) => {
      state.auth.user = null;
      state.auth.token = null;
      state.auth.status = LoadingType.IDLE;
      state.auth.error = null;
      AgroPulseStorage.clear();
    },

    resetAuthStatus: (state) => {
      state.auth.status = LoadingType.IDLE;
      state.auth.error = null;
    },

    clearAuthError: (state) => {
      state.auth.error = null;
    },
  },

  extraReducers: (builder) => {
    // 🔹 Login
    builder
      .addCase(loginAction.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(loginAction.fulfilled, (state, { payload }) => {
        state.auth.status = LoadingType.SUCCESS;
        const transformed = transformUserData(payload.data);

        // ✅ user et token clairement séparés
        state.auth.user = transformed.user;
        state.auth.token = transformed.token.accessToken;

        AgroPulseStorage.setUser(transformed.user);
        AgroPulseStorage.setAccessToken(transformed.token.accessToken);
        AgroPulseStorage.setRefreshToken(transformed.token.refreshToken);
        state.auth.error = null;
      })
      .addCase(loginAction.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
        state.auth.user = null;
        state.auth.token = null;
        AgroPulseStorage.clear();
      });

    // 🔹 Register
    builder
      .addCase(register.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.auth.status = LoadingType.SUCCESS;
        const transformed = transformUserData(payload.data);
        state.auth.user = transformed.user;
        state.auth.token = transformed.token.accessToken;
        AgroPulseStorage.setUser(transformed.user);
        AgroPulseStorage.setAccessToken(transformed.token.accessToken);
        AgroPulseStorage.setRefreshToken(transformed.token.refreshToken);
        state.auth.error = null;
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    // 🔹 Resend OTP
    builder
      .addCase(resendOtp.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.error = null;
      })
      .addCase(resendOtp.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    // 🔹 Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.auth.status = LoadingType.SUCCESS;
        const transformed = transformUserData(payload.data);
        state.auth.user = transformed.user;
        state.auth.token = transformed.token.accessToken;
        AgroPulseStorage.setUser(transformed.user);
        AgroPulseStorage.setAccessToken(transformed.token.accessToken);
        AgroPulseStorage.setRefreshToken(transformed.token.refreshToken);
        state.auth.error = null;
      })
      .addCase(verifyOtp.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    // 🔹 Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.token = payload.accessToken;
        AgroPulseStorage.setAccessToken(payload.accessToken);
        state.auth.error = null;
      })
      .addCase(refreshToken.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
        state.auth.user = null;
        state.auth.token = null;
        AgroPulseStorage.clear();
      });

    // 🔹 Logout
    builder
      .addCase(logout.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = null;
        state.auth.token = null;
        state.auth.error = null;
        AgroPulseStorage.clear();
      })
      .addCase(logout.rejected, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = null;
        state.auth.token = null;
        state.auth.error = null;
        AgroPulseStorage.clear();
      });

    // 🔹 Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.error = null;
      })
      .addCase(resetPassword.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    // 🔹 Update Password
    builder
      .addCase(updatePassword.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = null;
        state.auth.token = null;
        state.auth.error = null;
        AgroPulseStorage.clear();
      })
      .addCase(updatePassword.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    // 🔹 Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = null;
        state.auth.token = null;
        state.auth.error = null;
        AgroPulseStorage.clear();
      })
      .addCase(changePassword.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    // 🔹 Send Email Verification OTP
    builder
      .addCase(sendEmailVerificationOtp.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(sendEmailVerificationOtp.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.error = null;
      })
      .addCase(sendEmailVerificationOtp.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    // 🔹 Verify Email OTP
    builder
      .addCase(verifyEmailOTP.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(verifyEmailOTP.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.error = null;

        if (state.auth.user) {
          state.auth.user.emailVerified = true;
          AgroPulseStorage.setUser(state.auth.user);
        }
      })
      .addCase(verifyEmailOTP.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });
    // 🔹 Get Me
    builder
      .addCase(getMe.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(getMe.fulfilled, (state, { payload }) => {
        state.auth.status = LoadingType.SUCCESS;
        const transformedUser = transformUserData(payload.data?.user);
        state.auth.user = transformedUser;
        AgroPulseStorage.setUser(transformedUser);
      })
      .addCase(getMe.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    // 🔹 Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.auth.status = LoadingType.SUCCESS;
        const transformedUser = transformUserData(payload);
        state.auth.user = transformedUser;
        AgroPulseStorage.setUser(transformedUser);
      })
      .addCase(fetchCurrentUser.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload as ApiError;
      });
  },
});

export const {
  setAccessToken,
  logoutLocal,
  resetAuthStatus,
  clearAuthError,
  setUserSession,
} = AuthSlice.actions;

// ✅ Sélecteurs
export const selectAuthenticatedUser = (state: RootState) =>
  state.authentification.auth;

export const selectCurrentUser = (state: RootState) =>
  state.authentification.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  !!state.authentification.auth.token && !!state.authentification.auth.user;

export const selectAuthStatus = (state: RootState) =>
  state.authentification.auth.status;

export const selectAuthError = (state: RootState) =>
  state.authentification.auth.error;

export const selectUserId = (state: RootState) =>
  state.authentification.auth.user?.id;
export const selectManagerId = selectUserId;

export const selectUserOrganizations = (state: RootState) =>
  state.authentification.auth.user?.ownedOrganizations ||
  state.authentification.auth.user?.memberOrganizations;

export const selectAccessToken = (state: RootState) =>
  state.authentification.auth.token;


export default AuthSlice;
