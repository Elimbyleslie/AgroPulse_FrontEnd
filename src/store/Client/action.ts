import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import { handleApiResult } from "../../lib/handleApiResult";
import extractApiError from "../../lib/errorextrator";
import { Client } from "../../models/client";

// ====================== FETCH ALL ======================
export const fetchClients = createAsyncThunk<
  ApiResponse<Client>,
  { farmId: number; page?: number; limit?: number },
  { rejectValue: ApiError }
>("client/fetchAll", async ({ farmId, page, limit }, apiThunk) => {
  try {
    const queryParams = new URLSearchParams({ farmId: String(farmId) });
    if (page) queryParams.append("page", String(page));
    if (limit) queryParams.append("limit", String(limit));

    const result = await fetchWithAuth(`${ROUTES.CLIENT_LIST}?${queryParams}`);
    const error = handleApiResult(result, "Impossible de charger les clients");

    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    }
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

// ====================== CREATE ======================
export const createClient = createAsyncThunk<
  ApiResponse<Client>,
  Partial<Client>,
  { rejectValue: ApiError }
>("client/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.CLIENT_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur lors de la création du client");

    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    }
    return result!;
  } catch (err: unknown) {
    const apiErrorCandidate = err as {
      status?: number;
      response?: { status?: number };
      message?: string;
    };
    // Amélioration : message plus explicite pour les conflits (409)
    if (apiErrorCandidate.status === 409 || apiErrorCandidate.response?.status === 409) {
      return apiThunk.rejectWithValue({
       meta:{
         message: apiErrorCandidate.message || "Un client avec cet email existe déjà",
        status: 409,
       }
      } as ApiError);
    }
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

// ====================== UPDATE ======================
export const updateClient = createAsyncThunk<
  ApiResponse<Client>,
  { id: number; data: Partial<Client> },
  { rejectValue: ApiError }
>("client/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.CLIENT_UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur lors de la modification du client");

    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    }
    return result!;
  } catch (err: unknown) {
    const apiErrorCandidate = err as {
      status?: number;
      response?: { status?: number };
    };
    if (apiErrorCandidate.status === 409 || apiErrorCandidate.response?.status === 409) {
      return apiThunk.rejectWithValue({
        meta: {
        message: "Un client avec cet email existe déjà",
        status: 409,
      },
      } as ApiError);
    }
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const deleteClient = createAsyncThunk<
  ApiResponse<null>,
  number,   
    { rejectValue: ApiError }
>("client/delete", async (id, apiThunk) => {
    try {
      const result = await fetchWithAuth(`${ROUTES.CLIENT_DELETE(id)}`, {
        method: "DELETE",
      });
      const error = handleApiResult(result, "Erreur lors de la suppression");
      if (error)
        return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
      return result!;
    } catch (err) {
      return apiThunk.rejectWithValue(extractApiError(err));
    }
});


export const fetchClientById = createAsyncThunk<
  ApiResponse<Client>,
  number,
  { rejectValue: ApiError }
>("client/fetchById", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.CLIENT_GET_BY_ID}/${id}`);
    const error = handleApiResult(result, "Client introuvable");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});