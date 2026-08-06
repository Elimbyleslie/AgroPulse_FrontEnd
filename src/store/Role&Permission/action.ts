/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { handleApiResult } from "../../lib/handleApiResult";
import { ROUTES } from "../../constants/apiRoutes";
import {
  Role,
  Permission,
  UserRole,
  RolePermission,
} from "../../models/UserRolePermission"; 

// ══════════════════════════════════════════════════════════════════════════════
// ROLE
// ══════════════════════════════════════════════════════════════════════════════

export const fetchRoles = createAsyncThunk<
  ApiResponse<any>,
  { page?: number; limit?: number; search?: string } | void,
  { rejectValue: ApiError }
>("roles/list", async (params, apiThunk) => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const search = params?.search ? `&search=${encodeURIComponent(params.search)}` : "";
    const result = await fetchWithAuth(
      `${ROUTES.LIST_ROLES}?page=${page}&limit=${limit}${search}`,
      { method: "GET", headers: { "Content-Type": "application/json" } },
    );
    const error = handleApiResult(result, "Rôles introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createRole = createAsyncThunk<
  ApiResponse<Role>,
  { name: string; description?: string; permissionIds?: number[] },
  { rejectValue: ApiError }
>("roles/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.CREATE_ROLE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création du rôle");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getRoleById = createAsyncThunk<
  ApiResponse<Role>,
  number,
  { rejectValue: ApiError }
>("roles/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.GET_ROLE_BY_ID}/${id}`, {
      method: "GET",
    });
    const error = handleApiResult(result, "Rôle introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateRole = createAsyncThunk<
  ApiResponse<Role>,
  { id: number; data: { name?: string; description?: string; permissionIds?: number[] } },
  { rejectValue: ApiError }
>("roles/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_ROLE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la mise à jour du rôle");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const deleteRole = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  { rejectValue: ApiError }
>("roles/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.DELETE_ROLE(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Erreur lors de la suppression du rôle");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PERMISSION
// ══════════════════════════════════════════════════════════════════════════════

export const fetchPermissions = createAsyncThunk<
  ApiResponse<any>,
  { page?: number; limit?: number; search?: string } | void,
  { rejectValue: ApiError }
>("permissions/list", async (params, apiThunk) => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 100;
    const search = params?.search ? `&search=${encodeURIComponent(params.search)}` : "";
    const result = await fetchWithAuth(
      `${ROUTES.LIST_PERMISSIONS}?page=${page}&limit=${limit}${search}`,
      { method: "GET", headers: { "Content-Type": "application/json" } },
    );
    const error = handleApiResult(result, "Permissions introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createPermission = createAsyncThunk<
  ApiResponse<Permission>,
  { code: string; description: string },
  { rejectValue: ApiError }
>("permissions/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.CREATE_PERMISSION, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création de la permission");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getPermissionById = createAsyncThunk<
  ApiResponse<Permission>,
  number,
  { rejectValue: ApiError }
>("permissions/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.GET_PERMISSION_BY_ID}/${id}`, {
      method: "GET",
    });
    const error = handleApiResult(result, "Permission introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updatePermission = createAsyncThunk<
  ApiResponse<Permission>,
  { id: number; data: { code?: string; description?: string } },
  { rejectValue: ApiError }
>("permissions/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_PERMISSION(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la mise à jour de la permission");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const deletePermission = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  { rejectValue: ApiError }
>("permissions/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.DELETE_PERMISSION(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Erreur lors de la suppression de la permission");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ROLE ↔ PERMISSION
// ══════════════════════════════════════════════════════════════════════════════

export const assignPermissionToRole = createAsyncThunk<
  ApiResponse<RolePermission>,
  { roleId: number; permissionId: number },
  { rejectValue: ApiError }
>("rolePermissions/assign", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.ASSIGN_PERMISSION_TO_ROLE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de l'assignation");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const removePermissionFromRole = createAsyncThunk<
  ApiResponse<null>,
  { roleId: number; permissionId: number },
  { rejectValue: ApiError }
>("rolePermissions/remove", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.REMOVE_PERMISSION_TO_ROLE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors du retrait de la permission");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getRolePermissions = createAsyncThunk<
  ApiResponse<RolePermission[]>,
  number,
  { rejectValue: ApiError }
>("rolePermissions/byRole", async (roleId, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_ROLE_PERMISSION(roleId), {
      method: "GET",
    });
    const error = handleApiResult(result, "Permissions du rôle introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// USER ↔ ROLE
// ══════════════════════════════════════════════════════════════════════════════

export const assignRoleToUser = createAsyncThunk<
  ApiResponse<UserRole>,
  { userId: number; roleId: number; assignedBy: string },
  { rejectValue: ApiError }
>("userRoles/assign", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.ASSIGN_ROLE_TO_USER, {
      method: "POST",
      body: JSON.stringify(data),
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
  { userId: number; roleId: number },
  { rejectValue: ApiError }
>("userRoles/remove", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.REMOVE_ROLE_TO_USER, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors du retrait du rôle");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getUserRoles = createAsyncThunk<
  ApiResponse<UserRole[]>,
  number,
  { rejectValue: ApiError }
>("userRoles/byUser", async (userId, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_USER_ROLE(userId), {
      method: "GET",
    });
    const error = handleApiResult(result, "Rôles de l'utilisateur introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getRoleUsers = createAsyncThunk<
  ApiResponse<UserRole[]>,
  number,
  { rejectValue: ApiError }
>("userRoles/byRole", async (roleId, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_ROLES_USER(roleId), {
      method: "GET",
    });
    const error = handleApiResult(result, "Utilisateurs du rôle introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});