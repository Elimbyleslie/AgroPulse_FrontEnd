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
  verifyEmail,
} from "./action";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "../../models/user";
import { LoadingType, ApiErrorResponse } from "../../models/store";
import Utils from "../../lib/utils";
import { RootState } from "..";

type AuthState = {
  auth: {
    status: LoadingType;
    user: Omit<AuthUser, "token"> | null;
    token: string | null;
    error: ApiErrorResponse | null | undefined;
  };
};

const initialState: AuthState = {
  auth: {
    status: LoadingType.IDLE,
    user: Utils.getLocalUser() || null,
    token: Utils.getJWT() || null,
    error: null,
  },
};

const AuthSlice = createSlice({
   name: "authentification",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      if (state.auth && state.auth.user && action.payload) {
        state.auth.token = action.payload;
      }
    },
    logout: (state) => {
      state.auth.user = null;
      state.auth.token = null;
      state.auth.status = LoadingType.IDLE;
      Utils.clearTokens();
    },
    resetAuthStatus: (state) => {
      state.auth.status = LoadingType.IDLE;
    },
  },

  extraReducers: (builder) => {
    // login
    builder
      .addCase(loginAction.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(loginAction.fulfilled, (state, { payload }) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = payload.data;
        state.auth.token = payload.data.token.accessToken;
        Utils.saveInLocalStorage(payload.data);
      })
      .addCase(loginAction.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(register.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = payload.data;
        state.auth.token = payload.data.token.accessToken;
        Utils.saveInLocalStorage(payload.data);
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(resendOtp.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.user = null;
        state.auth.token = null;
        state.auth.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
      })
      .addCase(resendOtp.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(verifyOtp.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = payload.data;
        state.auth.token = payload.data.token.accessToken;
        Utils.saveInLocalStorage(payload.data);
      })
      .addCase(verifyOtp.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(refreshToken.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.token = payload.data.accessToken;
        Utils.saveInLocalStorage(
          { ...state.auth.user, token: payload.data } as AuthUser
        )
      })

      .addCase(refreshToken.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(logout.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(logout.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
      })
      .addCase(logout.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(resetPassword.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = null;
        state.auth.token = null;
        Utils.clearTokens();
      })
      .addCase(resetPassword.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(updatePassword.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = null;
        state.auth.token = null;
        Utils.clearTokens();
      })
      .addCase(updatePassword.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(changePassword.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = null;
        state.auth.token = null;
        Utils.clearTokens();
      })
      .addCase(changePassword.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(sendEmailVerificationOtp.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(sendEmailVerificationOtp.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = null;
        state.auth.token = null;
        Utils.clearTokens();
      })
      .addCase(sendEmailVerificationOtp.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(changePassword.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = null;
        state.auth.token = null;
        Utils.clearTokens();
      })
      .addCase(changePassword.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });

    builder
      .addCase(verifyEmail.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.user = null;
        state.auth.token = null;
        Utils.clearTokens();
      })
      .addCase(verifyEmail.rejected, (state, { payload }) => {
        state.auth.status = LoadingType.REJECTED;
        state.auth.error = payload;
      });
  },

});




export const selectAuthenticatedUser = (state: RootState) => state.authentification.auth;

export default AuthSlice;
