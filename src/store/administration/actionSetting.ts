/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { handleApiResult } from "../../lib/handleApiResult";
import { ROUTES } from "../../constants/apiRoutes";
import { Settings } from "../../models/administration"; 

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

export const fetchSettings = createAsyncThunk<
  ApiResponse<any>,
  {
    organizationId?: number;
    farmId?: number;
    page?: number;
    limit?: number;
  } | void,
  { rejectValue: ApiError }
>("settings/list", async (params, apiThunk) => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (params?.organizationId)
      qs.set("organizationId", String(params.organizationId));
    if (params?.farmId) qs.set("farmId", String(params.farmId));

    const result = await fetchWithAuth(`${ROUTES.LIST_SETTINGS}?${qs}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const error = handleApiResult(result, "Paramètres introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getSettingsById = createAsyncThunk<
  ApiResponse<Settings>,
  number,
  { rejectValue: ApiError }
>("settings/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_SETTINGS_BY_ID(id), {
      method: "GET",
    });
    const error = handleApiResult(result, "Paramètres introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

/** Récupérer les settings d'une ferme (pratique) */
export const getSettingsByFarmId = createAsyncThunk<
  ApiResponse<Settings>,
  number,
  { rejectValue: ApiError }
>("settings/byFarm", async (farmId, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.LIST_SETTINGS}?farmId=${farmId}&limit=1`,
      { method: "GET" },
    );
    const error = handleApiResult(result, "Paramètres de la ferme introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createSettings = createAsyncThunk<
  ApiResponse<Settings>,
  Partial<Settings>,
  { rejectValue: ApiError }
>("settings/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.CREATE_SETTINGS, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création des paramètres");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateSettings = createAsyncThunk<
  ApiResponse<Settings>,
  { id: number; data: Partial<Settings> },
  { rejectValue: ApiError }
>("settings/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_SETTINGS(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la mise à jour des paramètres");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const deleteSettings = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  { rejectValue: ApiError }
>("settings/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.DELETE_SETTINGS(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Erreur lors de la suppression");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});