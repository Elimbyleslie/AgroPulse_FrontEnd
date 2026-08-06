  /* eslint-disable @typescript-eslint/no-explicit-any */
  import { createAsyncThunk } from "@reduxjs/toolkit";
  import { ApiResponse, ApiError } from "../../models/store";
  import { fetchWithAuth } from "../../lib/fetchwithAuth";
  import extractApiError from "../../lib/errorextrator";
  import { handleApiResult } from "../../lib/handleApiResult";
  import { ROUTES } from "../../constants/apiRoutes";
  import { FarmUser, Notification, ActivityLog } from "../../models/administration"; 

  // ══════════════════════════════════════════════════════════════════════════════
  // FARM USER
  // ══════════════════════════════════════════════════════════════════════════════

  export const fetchFarmUsers = createAsyncThunk<
    ApiResponse<any>,
    { farmId?: number; userId?: number; page?: number; limit?: number } | void,
    { rejectValue: ApiError }
  >("farmUsers/list", async (params, apiThunk) => {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 50;
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (params?.farmId) qs.set("farmId", String(params.farmId));
      if (params?.userId) qs.set("userId", String(params.userId));

      const result = await fetchWithAuth(`${ROUTES.LIST_FARM_USER}?${qs}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const error = handleApiResult(result, "Membres de ferme introuvables");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const createFarmUser = createAsyncThunk<
    ApiResponse<FarmUser>,
    { farmId: number; userId: number },
    { rejectValue: ApiError }
  >("farmUsers/create", async (data, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.CREATE_FARM_USER, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const error = handleApiResult(result, "Erreur lors de l'ajout du membre");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const getFarmUserById = createAsyncThunk<
    ApiResponse<FarmUser>,
    number,
    { rejectValue: ApiError }
  >("farmUsers/byId", async (id, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.GET_FARM_USER_BY_ID(id), {
        method: "GET",
      });
      const error = handleApiResult(result, "Affiliation introuvable");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const getFarmUsersByFarmId = createAsyncThunk<
    ApiResponse<FarmUser[]>,
    number,
    { rejectValue: ApiError }
  >("farmUsers/byFarm", async (farmId, apiThunk) => {
    try {
      const result = await fetchWithAuth(
        ROUTES.GET_FARM_USER_BY_FARM_ID(farmId),
        { method: "GET" },
      );
      const error = handleApiResult(result, "Membres de la ferme introuvables");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const deleteFarmUser = createAsyncThunk<
    ApiResponse<FarmUser>,
    { id: number },
    { rejectValue: ApiError }
  >("farmUsers/delete", async ({ id }, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.DELETE_FARM_USER(id), {
        method: "DELETE",
      });
      const error = handleApiResult(result, "Erreur lors du retrait du membre");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // NOTIFICATION
  // ══════════════════════════════════════════════════════════════════════════════

  export const fetchNotifications = createAsyncThunk<
    ApiResponse<any>,
    { userId?: number; read?: boolean; page?: number; limit?: number } | void,
    { rejectValue: ApiError }
  >("notifications/list", async (params, apiThunk) => {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 30;
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (params?.userId != null) qs.set("userId", String(params.userId));
      if (params?.read !== undefined) qs.set("read", String(params.read));

      const result = await fetchWithAuth(`${ROUTES.LIST_NOTIFICATIONS}?${qs}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const error = handleApiResult(result, "Notifications introuvables");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const createNotification = createAsyncThunk<
    ApiResponse<Notification>,
    { userId: number; title: string; message: string },
    { rejectValue: ApiError }
  >("notifications/create", async (data, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.CREATE_NOTIFICATION, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const error = handleApiResult(
        result,
        "Erreur lors de la création de la notification",
      );
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const getNotificationById = createAsyncThunk<
    ApiResponse<Notification>,
    number,
    { rejectValue: ApiError }
  >("notifications/byId", async (id, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.GET_NOTIFICATION_BY_ID(id), {
        method: "GET",
      });
      const error = handleApiResult(result, "Notification introuvable");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const markNotificationAsRead = createAsyncThunk<
    ApiResponse<Notification>,
    number,
    { rejectValue: ApiError }
  >("notifications/markRead", async (id, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.MARK_AS_READ(id), {
        method: "PATCH",
      });
      const error = handleApiResult(result, "Erreur lors du marquage");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const markNotificationAsUnread = createAsyncThunk<
    ApiResponse<Notification>,
    number,
    { rejectValue: ApiError }
  >("notifications/markUnread", async (id, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.MARK_AS_UNREAD(id), {
        method: "PATCH",
      });
      const error = handleApiResult(result, "Erreur lors du marquage");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const markAllNotificationsAsRead = createAsyncThunk<
    ApiResponse<{ count: number }>,
    void,
    { rejectValue: ApiError }
  >("notifications/markAllRead", async (_, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.MARK_ALL_AS_READ, {
        method: "PATCH",
      });
      const error = handleApiResult(result, "Erreur lors du marquage");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const getUnreadCount = createAsyncThunk<
    ApiResponse<{ count: number }>,
    void,
    { rejectValue: ApiError }
  >("notifications/unreadCount", async (_, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.GET_UNREAD_COUNT, {
        method: "GET",
      });
      const error = handleApiResult(result, "Erreur lors du comptage");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const deleteNotification = createAsyncThunk<
    ApiResponse<Notification>,
    { id: number },
    { rejectValue: ApiError }
  >("notifications/delete", async ({ id }, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.DELETE_NOTIFICATION(id), {
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
  // ACTIVITY LOG
  // ══════════════════════════════════════════════════════════════════════════════

  export const fetchActivityLogs = createAsyncThunk<
    ApiResponse<any>,
    { userId?: number; action?: string; page?: number; limit?: number } | void,
    { rejectValue: ApiError }
  >("activityLogs/list", async (params, apiThunk) => {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 30;
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (params?.userId) qs.set("userId", String(params.userId));
      if (params?.action) qs.set("action", params.action);

      const result = await fetchWithAuth(`${ROUTES.LIST_ACTIVITY_LOGS}?${qs}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const error = handleApiResult(result, "Logs d'activité introuvables");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const createActivityLog = createAsyncThunk<
    ApiResponse<ActivityLog>,
    {
      userId?: number;
      action: string;
      description?: string;
      ipAddress?: string;
    },
    { rejectValue: ApiError }
  >("activityLogs/create", async (data, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.CREATE_ACTIVITY_LOG, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const error = handleApiResult(result, "Erreur lors de la création du log");
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
  >("activityLogs/byId", async (id, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.GET_ACTIVITY_LOG_BY_ID(id), {
        method: "GET",
      });
      const error = handleApiResult(result, "Log introuvable");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));
      return result!;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  });

  export const updateActivityLog = createAsyncThunk<
    ApiResponse<ActivityLog>,
    {
      id: number;
      data: Partial<{
        action: string;
        description: string;
        ipAddress: string;
      }>;
    },
    { rejectValue: ApiError }
  >("activityLogs/update", async ({ id, data }, apiThunk) => {
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
    ApiResponse<ActivityLog>,
    { id: number },
    { rejectValue: ApiError }
  >("activityLogs/delete", async ({ id }, apiThunk) => {
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