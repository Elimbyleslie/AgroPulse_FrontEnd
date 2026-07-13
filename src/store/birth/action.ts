import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { handleApiResult } from "../../lib/handleApiResult";
import { ROUTES } from "../../constants/apiRoutes";
import { Birth, ReproductionWithBirth } from "../../models/birth";

// ── BIRTH CRUD ────────────────────────────────────────────────────────────────

export const fetchBirths = createAsyncThunk<
  ApiResponse<Birth[]>,
  { farmId?: number; motherId?: number; page?: number; limit?: number },
  { rejectValue: ApiError }
>("birth/list", async (params, apiThunk) => {
  try {
    const query = new URLSearchParams();
    if (params.farmId)   query.append("farmId",   String(params.farmId));
    if (params.motherId) query.append("motherId",  String(params.motherId));
    if (params.page)     query.append("page",      String(params.page));
    if (params.limit)    query.append("limit",     String(params.limit));

    const result = await fetchWithAuth(
      `${ROUTES.BIRTH_LIST}?${query.toString()}`,
      { method: "GET", headers: { "Content-Type": "application/json" } },
    );
    const error = handleApiResult(result, "Naissances introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getBirthById = createAsyncThunk<
  ApiResponse<Birth>,
  number,
  { rejectValue: ApiError }
>("birth/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.BIRTH_BY_ID(id), {
      method: "GET",
    });
    const error = handleApiResult(result, "Naissance introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createBirth = createAsyncThunk<
  ApiResponse<Birth>,
  Omit<Birth, "id" | "createdAt">,
  { rejectValue: ApiError }
>("birth/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.BIRTH_CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateBirth = createAsyncThunk<
  ApiResponse<Birth>,
  { id: number; data: Partial<Birth> },
  { rejectValue: ApiError }
>("birth/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.BIRTH_UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Naissance introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const deleteBirth = createAsyncThunk<
  ApiResponse<Birth>,
  { id: number },
  { rejectValue: ApiError }
>("birth/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.BIRTH_DELETE(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Naissance introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ── REPRODUCTION + BIRTH AUTO ─────────────────────────────────────────────────

export const createReproductionWithBirth = createAsyncThunk<
  ApiResponse<ReproductionWithBirth>,
  ReproductionWithBirth,
  { rejectValue: ApiError }
>("birth/createWithReproduction", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.REPRODUCTION_BIRTH_CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const fetchReproductionsWithBirth = createAsyncThunk<
  ApiResponse<ReproductionWithBirth[]>,
  void,
  { rejectValue: ApiError }
>("birth/listWithReproduction", async (_, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.REPRODUCTION_BIRTH_LIST, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const error = handleApiResult(result, "Introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const deleteReproductionWithBirth = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
    { rejectValue: ApiError }
>("birth/deleteReproductionWithBirth", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.REPRODUCTION_BIRTH_DELETE(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Naissance introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getReproductionWithBirthById = createAsyncThunk<
  ApiResponse<ReproductionWithBirth>,
  number,   
  { rejectValue: ApiError }
>("birth/getReproductionWithBirthById", async (id, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.REPRODUCTION_BIRTH_GET_BY_ID(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const error = handleApiResult(result, "Introuvable");
        if (error) return apiThunk.rejectWithValue(extractApiError(error));
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
})

export const updateReproductionWithBirth = createAsyncThunk<
  ApiResponse<ReproductionWithBirth>,
  { id: number; data: Partial<ReproductionWithBirth> },
  { rejectValue: ApiError }
>("birth/updateReproductionWithBirth", async ({ id, data }, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.REPRODUCTION_BIRTH_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const error = handleApiResult(result, "Introuvable");
        if (error) return apiThunk.rejectWithValue(extractApiError(error));
        return result!;
    }
    catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
})