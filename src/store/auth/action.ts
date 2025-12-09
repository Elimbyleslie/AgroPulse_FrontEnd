import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ThunkApi } from "../../models/store";
import { AuthUser, UserLoginForm , UserRegisterForm , UpdatePasswordForm, ChangePasswordForm} from "../../models/user";
import { ROUTES } from "../../constants/apiRoutes";
import { fetchApi } from "../../lib/fecthApi";
import  extractApiError from "../../lib/errorextrator";



export const loginAction = createAsyncThunk<
  ApiResponse<AuthUser>,
  UserLoginForm,
  ThunkApi
>("auth/login", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<AuthUser>>(ROUTES.AUTH_LOGIN, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (result.data) {
      localStorage.setItem("token", result.data.token.accessToken);
    }
    if (result.data) {
      localStorage.setItem("user", JSON.stringify(result.data.user));
    }
    

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
})

export const register = createAsyncThunk<
  ApiResponse<AuthUser>,
  UserRegisterForm,
  ThunkApi
>("auth/register", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<AuthUser>>(ROUTES.AUTH_REGISTER, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const verifyOtp = createAsyncThunk<
  ApiResponse<AuthUser>,
  { email: string; otp: string },
  ThunkApi
>("auth/verify-otp", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<AuthUser>>(
      ROUTES.AUTH_VERIFY_OTP,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const resendOtp = createAsyncThunk<
  ApiResponse<AuthUser>,
  { email: string },
  ThunkApi
>("auth/resend-otp", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<AuthUser>>(
      ROUTES.AUTH_RESEND_OTP,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});


export const refreshToken = createAsyncThunk<
  ApiResponse<{ accessToken: string; refreshToken: string }>,
  { refreshToken: string },
  ThunkApi
>("auth/refresh", async (data, apiThunk) => {
  try {
    const result = await fetchApi<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >(ROUTES.AUTH_REFRESH_TOKEN, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});


export const logout = createAsyncThunk<
  ApiResponse<{ message: string }>,
  undefined,
  ThunkApi
>("auth/logout", async (_, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<{ message: string }>>(
      ROUTES.AUTH_LOGOUT,
      {
        method: "POST",
      }
    );

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const resetPassword = createAsyncThunk<
  ApiResponse<{ message: string }>,
  { email: string },
  ThunkApi
>("auth/reset-password", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<{ message: string }>>(
      ROUTES.AUTH_RESET_PASSWORD,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});


export const sendEmailVerificationOtp = createAsyncThunk<
  ApiResponse<{ message: string }>,
  { email: string },
  ThunkApi
>("auth/send-email-verification-otp", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<{ message: string }>>(
      ROUTES.AUTH_SEND_EMAIL_VERIFICATION,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});



export const updatePassword = createAsyncThunk<
  ApiResponse<{ message: string }>,
  UpdatePasswordForm,
  ThunkApi
>("auth/update-password", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<{ message: string }>>(
      ROUTES.AUTH_UPDATE_PASSWORD,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});


export const changePassword = createAsyncThunk<
  ApiResponse<{ message: string }>,
  ChangePasswordForm,
  ThunkApi
>("auth/change-password", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<{ message: string }>>(
      ROUTES.AUTH_CHANGE_PASSWORD,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const verifyEmail = createAsyncThunk<
  ApiResponse<{ message: string }>,
  { email: string; otp: string },
  ThunkApi
>("auth/verify-email", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<{ message: string }>>(
      ROUTES.AUTH_VERIFY_EMAIL,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return result;
  } catch (err: unknown) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});