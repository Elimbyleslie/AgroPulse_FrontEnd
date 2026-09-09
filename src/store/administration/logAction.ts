/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { handleApiResult } from "../../lib/handleApiResult";
import { ROUTES } from "../../constants/apiRoutes";
import { ActivityLog } from "../../models/activityLog"; 

// ══════════════════════════════════════════════════════════════════════════════
// ACTIVITY LOG
// ══════════════════════════════════════════════════════════════════════════════

export const fetchActivityLogs = createAsyncThunk<
  ApiResponse<any>,
  {
    userId?: number;
    page?: number;
    limit?: number;
  } | void,
  { rejectValue: ApiError }
>("activityLog/list", async (params, apiThunk) => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (params?.userId) qs.set("userId", String(params.userId));

    const result = await fetchWithAuth(`${ROUTES.LIST_ACTIVITY_LOGS}?${qs}`, {
      method: "GET",
    });
    const error = handleApiResult(result, "Journaux d'activité introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getActivityLogById = createAsyncThunk<
  ApiResponse<ActivityLog>,
  number,
  { rejectValue: ApiError }
>("activityLog/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_ACTIVITY_LOG_BY_ID(id), {
      method: "GET",
    });
    const error = handleApiResult(result, "Journal d'activité introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createActivityLog = createAsyncThunk<
  ApiResponse<ActivityLog>,
  Partial<ActivityLog>,
  { rejectValue: ApiError }
>("activityLog/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.CREATE_ACTIVITY_LOG, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création du journal");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateActivityLog = createAsyncThunk<
  ApiResponse<ActivityLog>,
  { id: number; data: Partial<ActivityLog> },
  { rejectValue: ApiError }
>("activityLog/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_ACTIVITY_LOG(id), {
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

export const deleteActivityLog = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  { rejectValue: ApiError }
>("activityLog/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.DELETE_ACTIVITY_LOG(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Erreur lors de la suppression");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});