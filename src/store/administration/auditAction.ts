/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { handleApiResult } from "../../lib/handleApiResult";
import { ROUTES } from "../../constants/apiRoutes";
import { Audit } from "../../models/activityLog"

// ══════════════════════════════════════════════════════════════════════════════
// AUDIT
// ══════════════════════════════════════════════════════════════════════════════

export const fetchAudits = createAsyncThunk<
  ApiResponse<any>,
  {
    userId?: number;
    organizationId?: number;
    farmId?: number;
    tableTarget?: string;
    action?: string;
    dateDebut?: string;
    dateFin?: string;
    page?: number;
    limit?: number;
  } | void,
  { rejectValue: ApiError }
>("audit/list", async (params, apiThunk) => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (params?.userId) qs.set("userId", String(params.userId));
    if (params?.organizationId) qs.set("organizationId", String(params.organizationId));
    if (params?.farmId) qs.set("farmId", String(params.farmId));
    if (params?.tableTarget) qs.set("tableTarget", params.tableTarget);
    if (params?.action) qs.set("action", params.action);
    if (params?.dateDebut) qs.set("dateDebut", params.dateDebut);
    if (params?.dateFin) qs.set("dateFin", params.dateFin);

    const result = await fetchWithAuth(`${ROUTES.LIST_AUDITS}?${qs}`, {
      method: "GET",
    });
    const error = handleApiResult(result, "Audits introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getAuditById = createAsyncThunk<
  ApiResponse<Audit>,
  number,
  { rejectValue: ApiError }
>("audit/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_AUDIT_BY_ID(id), {
      method: "GET",
    });
    const error = handleApiResult(result, "Audit introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const searchAudits = createAsyncThunk<
  ApiResponse<any>,
  { search: string; page?: number; limit?: number },
  { rejectValue: ApiError }
>("audit/search", async ({ search, page = 1, limit = 50 }, apiThunk) => {
  try {
    const qs = new URLSearchParams({
      search,
      page: String(page),
      limit: String(limit),
    });
    const result = await fetchWithAuth(`${ROUTES.SEARCH_AUDITS}?${qs}`, {
      method: "GET",
    });
    const error = handleApiResult(result, "Erreur lors de la recherche");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getAuditStats = createAsyncThunk<
  ApiResponse<any>,
  { periode?: number } | void,
  { rejectValue: ApiError }
>("audit/stats", async (params, apiThunk) => {
  try {
    const periode = params?.periode ?? 30;
    const result = await fetchWithAuth(
      `${ROUTES.AUDIT_STATS}?periode=${periode}`,
      { method: "GET" }
    );
    const error = handleApiResult(result, "Impossible de récupérer les statistiques");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getRecentActivities = createAsyncThunk<
  ApiResponse<any>,
  { limit?: number } | void,
  { rejectValue: ApiError }
>("audit/recent", async (params, apiThunk) => {
  try {
    const limit = params?.limit ?? 20;
    const result = await fetchWithAuth(
      `${ROUTES.RECENT_ACTIVITIES}?limit=${limit}`,
      { method: "GET" }
    );
    const error = handleApiResult(result, "Impossible de récupérer les activités récentes");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const exportAudits = createAsyncThunk<
  any,
  { format?: "json" | "csv"; dateDebut?: string; dateFin?: string } | void,
  { rejectValue: ApiError }
>("audit/export", async (params, apiThunk) => {
  try {
    const qs = new URLSearchParams();
    if (params?.format) qs.set("format", params.format);
    if (params?.dateDebut) qs.set("dateDebut", params.dateDebut);
    if (params?.dateFin) qs.set("dateFin", params.dateFin);

    const result = await fetchWithAuth(
      `${ROUTES.EXPORT_AUDITS}?${qs.toString()}`,
      { method: "GET" }
    );
    // Note : pour le CSV le backend renvoie du texte brut
    return result;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});