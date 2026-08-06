/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { handleApiResult } from "../../lib/handleApiResult";
import { ROUTES } from "../../constants/apiRoutes";
import { User } from "../../models/user"; 

// ══════════════════════════════════════════════════════════════════════════════
// USER — CRUD
// ══════════════════════════════════════════════════════════════════════════════

export const fetchUsers = createAsyncThunk<
  ApiResponse<User>,
  {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    farmId?: number;
  } | void,
  { rejectValue: ApiError }
>("users/list", async (params, apiThunk) => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (params?.search) qs.set("search", params.search);
    if (params?.status) qs.set("status", params.status);
    if (params?.farmId) qs.set("farmId", String(params.farmId));

    const result = await fetchWithAuth(`${ROUTES.LIST_USERS}?${qs}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const error = handleApiResult(result, "Utilisateurs introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createUser = createAsyncThunk<
  ApiResponse<User>,
  {
    name: string;
    email: string;
    password: string;
    userName?: string;
    phone?: string;
    status?: string;
    defaultFarmId?: number;
    defaultOrganizationId?: number;
    roleIds?: number[];
  },
  { rejectValue: ApiError }
>("users/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.CREATE_USER, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création de l'utilisateur");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getUserById = createAsyncThunk<
  ApiResponse<User>,
  number,
  { rejectValue: ApiError }
>("users/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_USER_BY_ID(id), {
      method: "GET",
    });
    const error = handleApiResult(result, "Utilisateur introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateUser = createAsyncThunk<
  ApiResponse<User>,
  {
    id: number;
    data: Partial<{
      name: string;
      email: string;
      password: string;
     userName: string;
      phone: string;
      photo: string;
      status: string;
      defaultFarmId: number | null;
      defaultOrganizationId: number | null;
      onboardingComplete: boolean;
    }>;
  },
  { rejectValue: ApiError }
>("users/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_USER(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la mise à jour");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const deleteUser = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  { rejectValue: ApiError }
>("users/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.DELETE_USER(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Erreur lors de la suppression");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// USER — PROFILE
// ══════════════════════════════════════════════════════════════════════════════

export const getUserProfile = createAsyncThunk<
  ApiResponse<User>,
  number,
  { rejectValue: ApiError }
>("users/profile", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_USER_PROFILE(id), {
      method: "GET",
    });
    const error = handleApiResult(result, "Profil introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateUserProfile = createAsyncThunk<
  ApiResponse<User>,
  {
    id: number;
    data: Partial<{
      name: string;
      phone: string;
      photo: string;
      userName: string;
      defaultFarmId: number | null;
      defaultOrganizationId: number | null;
    }>;
  },
  { rejectValue: ApiError }
>("users/updateProfile", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_USER_PROFILE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la mise à jour du profil");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// USER — ROLES
// ══════════════════════════════════════════════════════════════════════════════

export const getUserRoles = createAsyncThunk<
  ApiResponse<any[]>,
  number,
  { rejectValue: ApiError }
>("users/roles", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_USER_ROLES(id), {
      method: "GET",
    });
    const error = handleApiResult(result, "Rôles introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const assignRoleToUser = createAsyncThunk<
  ApiResponse<any>,
  { id: number; roleId: number; assignedBy?: string },
  { rejectValue: ApiError }
>("users/assignRole", async ({ id, roleId, assignedBy }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.ASSIGN_ROLE(id), {
      method: "POST",
      body: JSON.stringify({ roleId, assignedBy }),
    });
    const error = handleApiResult(result, "Erreur lors de l'assignation du rôle");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const removeRoleFromUser = createAsyncThunk<
  ApiResponse<null>,
  { id: number; roleId: number },
  { rejectValue: ApiError }
>("users/removeRole", async ({ id, roleId }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.REMOVE_ROLE(id), {
      method: "DELETE",
      body: JSON.stringify({ roleId }),
    });
    const error = handleApiResult(result, "Erreur lors du retrait du rôle");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});