/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import { handleApiResult } from "../../lib/handleApiResult";
import extractApiError from "../../lib/errorextrator";

import { Production, FetchProduction, ProductionStats } from "../../models/production";

// ================================================
// CREATE
// ================================================
export const createProduction = createAsyncThunk<
  ApiResponse<FetchProduction>,
  Production,
  { rejectValue: ApiError }
>("production/create", async (productionData, thunkAPI) => {
  try {
    const response = await fetchWithAuth(ROUTES.PRODUCTION_CREATE, {
      method: "POST",
      body: JSON.stringify(productionData),
    });

    const error = handleApiResult(response, "Erreur lors de la création de la production");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return response as ApiResponse<FetchProduction>;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ================================================
// FETCH LIST
// ================================================
export const fetchProductions = createAsyncThunk<
  ApiResponse<{ productions: FetchProduction[]; pagination: any }>,
  {
    farmId: number;          
    page?: number;
    limit?: number;
    lotId?: number;
    animalId?: number;
    herdId?: number;
    penId?: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: ApiError }
>("production/list", async (filters, thunkAPI) => {
  try {
    const queryParams = new URLSearchParams();

    // farmId est obligatoire
    queryParams.append("farmId", filters.farmId.toString());

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.lotId) queryParams.append("lotId", filters.lotId.toString());
    if (filters.animalId) queryParams.append("animalId", filters.animalId.toString());
    if (filters.herdId) queryParams.append("herdId", filters.herdId.toString());
    if (filters.penId) queryParams.append("penId", filters.penId.toString());
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);

    const url = `${ROUTES.PRODUCTION_LIST}?${queryParams.toString()}`;

    const response = await fetchWithAuth(url, { method: "GET" });

    const error = handleApiResult(response, "Impossible de charger les productions");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return response as ApiResponse<{ productions: FetchProduction[]; pagination: any }>;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ================================================
// FETCH STATS
// ================================================
export const fetchProductionStats = createAsyncThunk<
  ApiResponse<ProductionStats>,
  {
    farmId: number;         
    lotId?: number;
    herdId?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
    category?: string;
    groupBy?: 'Type' | 'Category' | 'month';
  },
  { rejectValue: ApiError }
>("production/stats", async (filters, thunkAPI) => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append("farmId", filters.farmId.toString());

    if (filters.lotId !== undefined) queryParams.append("lotId", filters.lotId.toString());
    if (filters.herdId !== undefined) queryParams.append("herdId", filters.herdId.toString());
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.groupBy) queryParams.append("groupBy", filters.groupBy);

    const url = `${ROUTES.PRODUCTION_STATS}?${queryParams.toString()}`;

    const response = await fetchWithAuth(url, { method: "GET" });

    const error = handleApiResult(response, "Erreur lors de la récupération des statistiques");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return response as ApiResponse<ProductionStats>;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ================================================
// GET BY ID
// ================================================
export const getProductionById = createAsyncThunk<
  ApiResponse<FetchProduction>,
  number,
  { rejectValue: ApiError }
>("production/byId", async (id, thunkAPI) => {
  try {
    const response = await fetchWithAuth(ROUTES.PRODUCTION_GET_BY_ID(id), {
      method: "GET",
    });

    const error = handleApiResult(response, "Production introuvable");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return response as ApiResponse<FetchProduction>;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ================================================
// UPDATE
// ================================================
export const updateProduction = createAsyncThunk<
  ApiResponse<FetchProduction>,
  { id: number; data: Partial<Production> },
  { rejectValue: ApiError }
>("production/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await fetchWithAuth(ROUTES.PRODUCTION_UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const error = handleApiResult(response, "Erreur lors de la mise à jour");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return response as ApiResponse<FetchProduction>;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ================================================
// DELETE
// ================================================
export const deleteProduction = createAsyncThunk<
  ApiResponse<{ id: number }>,
  number,
  { rejectValue: ApiError }
>("production/delete", async (id, thunkAPI) => {
  try {
    const response = await fetchWithAuth(ROUTES.PRODUCTION_DELETE(id), {
      method: "DELETE",
    });

    const error = handleApiResult(response, "Erreur lors de la suppression");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return response as ApiResponse<{ id: number }>;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

