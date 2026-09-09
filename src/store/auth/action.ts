import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ThunkApi, ApiError } from "../../models/store";
import {
  AuthUser,
  UserLoginForm,
  UserRegisterForm,
  UpdatePasswordForm,
  ChangePasswordForm,
  User,
} from "../../models/user";
import { ROUTES } from "../../constants/apiRoutes";
import { fetchApi } from "../../lib/fecthApi";
import extractApiError from "../../lib/errorextrator";
import { handleApiResult } from "../../lib/handleApiResult";
import { env } from "../../constants/env";
import { authStore } from "../../lib/utils";
import { fetchWithAuth } from "../../lib/fetchwithAuth";

// --- HELPERS ---
const handleThunkError = (err: unknown) => extractApiError(err) as ApiError;

// 🔑 Action de connexion
export const loginAction = createAsyncThunk<
  ApiResponse<AuthUser>,
  UserLoginForm,
  ThunkApi
>("auth/login", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<AuthUser>>(ROUTES.AUTH_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur de connexion");
    if (error) return apiThunk.rejectWithValue(handleThunkError(error));

    // Stocker l'access token pour les futurs appels fetchWithAuth
    if (result?.token) {
      authStore.setToken(result.token.accessToken);
    }
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(handleThunkError(err));
  }
});

// 🔑 Action d'inscription
export const register = createAsyncThunk<
  ApiResponse<AuthUser>,
  UserRegisterForm,
  ThunkApi
>("auth/register", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<AuthUser>>(ROUTES.AUTH_REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur d'inscription");
    if (error) return apiThunk.rejectWithValue(handleThunkError(error));

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(handleThunkError(err));
  }
});

// 🔑 Action de verification du code OTP
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    const error = handleApiResult(result, "Code OTP invalide");
    if (error) return apiThunk.rejectWithValue(handleThunkError(error));

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(handleThunkError(err));
  }
});

// 🔑 Mise à jour mot de passe (via profil)
export const updatePassword = createAsyncThunk<
  ApiResponse<null>,
  UpdatePasswordForm,
  ThunkApi
>("auth/update-password", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.AUTH_UPDATE_PASSWORD, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur mise à jour mot de passe");
    if (error) return apiThunk.rejectWithValue(handleThunkError(error));

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(handleThunkError(err));
  }
});

// 🔑 Renvoyer OTP
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    const error = handleApiResult(result, "Erreur renvoi OTP");
    if (error) return apiThunk.rejectWithValue(handleThunkError(error));

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(handleThunkError(err));
  }
});

// 🔑 Changer mot de passe (oublié)
export const changePassword = createAsyncThunk<
  ApiResponse<null>,
  ChangePasswordForm,
  ThunkApi
>("auth/change-password", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<null>>(
      ROUTES.AUTH_CHANGE_PASSWORD,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    const error = handleApiResult(result, "Erreur changement mot de passe");
    if (error) return apiThunk.rejectWithValue(handleThunkError(error));

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(handleThunkError(err));
  }
});

// 🔑 Déconnexion
export const logout = createAsyncThunk<void, void, ThunkApi>(
  "auth/logout",
  async (_, apiThunk) => {
    try {
      await fetchApi<ApiResponse<null>>(ROUTES.AUTH_LOGOUT, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      return apiThunk.rejectWithValue(handleThunkError(err));
    } finally {
      authStore.clear();
      apiThunk.dispatch({ type: "authentification/logoutLocal" }); // Correspondance avec le Slice
    }
  },
);

// 🔑 Vérifier Email OTP
export const verifyEmailOTP = createAsyncThunk<
  ApiResponse<{ user: User }>,
  { otp: string; email: string },
  ThunkApi
>("auth/verify-email-otp", async (data, apiThunk) => {
  try {
    const response = await fetch(
      `${env.apiUrl}${ROUTES.AUTH_VERIFY_EMAIL_OTP}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return apiThunk.rejectWithValue(handleThunkError(errorData));
    }

    return await response.json();
  } catch (error) {
    return apiThunk.rejectWithValue(handleThunkError(error));
  }
});

// 🔑 Envoi OTP vérification email
export const sendEmailVerificationOtp = createAsyncThunk<
  ApiResponse<null>,
  { email: string },
  ThunkApi
>("auth/send-email-verification-otp", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<null>>(
      ROUTES.AUTH_SEND_EMAIL_VERIFICATION,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    const error = handleApiResult(result, "Erreur envoi email de vérification");
    if (error) return apiThunk.rejectWithValue(handleThunkError(error));

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(handleThunkError(err));
  }
});

// 🔑 Réinitialisation mot de passe (Email d'envoi)
export const resetPassword = createAsyncThunk<
  ApiResponse<null>,
  { email: string },
  ThunkApi
>("auth/reset-password", async (data, apiThunk) => {
  try {
    const result = await fetchApi<ApiResponse<null>>(
      ROUTES.AUTH_RESET_PASSWORD,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    const error = handleApiResult(result, "Erreur réinitialisation");
    if (error) return apiThunk.rejectWithValue(handleThunkError(error));

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(handleThunkError(err));
  }
});

// 🔑 Refresh Token
export const refreshToken = createAsyncThunk<
  { accessToken: string },
  void,
  ThunkApi
>("auth/refresh-token", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchApi<ApiResponse<{ accessToken: string }>>(
      ROUTES.AUTH_REFRESH_TOKEN,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!res?.data?.accessToken) {
      authStore.clear();
      return rejectWithValue({
        meta: { message: "Session expirée", status: 409 },
      } as ApiError);
    }

    authStore.setToken(res.data.accessToken);
    return res.data;
  } catch (error) {
    authStore.clear();
    return rejectWithValue(handleThunkError(error));
  }
});

// 🔑 Google Login (Reçoit le token du callback)
export const googleLoginAction = createAsyncThunk<
  ApiResponse<AuthUser>,
  string,
  ThunkApi
>("auth/google-login", async (token, apiThunk) => {
  try {
    authStore.setToken(token);
    // On retourne un objet compatible ApiResponse pour le Slice
    return {
      data: { token: { accessToken: token } } as unknown as AuthUser,
      meta: { status: 200, message: "Google login success" },
    } as unknown as ApiResponse<AuthUser>;
  } catch (err) {
    return apiThunk.rejectWithValue(handleThunkError(err));
  }
});

// 🔑 Get Me (Récupérer profil complet)
export const getMe = createAsyncThunk<
  ApiResponse<{ user: User }>,
  void,
  ThunkApi
>("auth/get-me", async (_, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.PROFILE, {
      method: "GET",
    });
    return result ;
  } catch (error) {
    return apiThunk.rejectWithValue(handleThunkError(error));
  }
});


export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchMe",
  async (_, thunkAPI) => {
    try {
      const response = await fetchWithAuth(`${ROUTES.AUTH_ME}`,
        {
          method:"GET",
        }
      );
      return response.data; 
    } catch (error) {
      console.log(error)
      return thunkAPI.rejectWithValue("Session expirée");
    }
  }
);


