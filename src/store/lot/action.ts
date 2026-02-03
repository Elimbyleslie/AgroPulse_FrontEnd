/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ThunkApi, ApiError } from "../../models/store";
import { ROUTES } from "../../constants/apiRoutes";
import { FecthLot } from "../../models/lot";
import { handleApiResult } from "../../lib/handleApiResult";

// Get All with pagination
export const getAllLots = createAsyncThunk(
  "lot/list",
  async (
    args: { limit?: number; page?: number; farmId: number; search: string },
    apiThunk,
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", args.limit?.toString() || "10");
      params.append("page", (args.page || 1).toString());
      params.append("search", args.search || "");

      if (args.farmId) {
        params.append("farmId", args.farmId.toString());
      } else {
        return apiThunk.rejectWithValue("farmId obligatoire");
      }

      // Correction : suppression de l'espace après le '?'
      const response = await fetchWithAuth(
        `${ROUTES.LOT_LIST}?${params.toString()}`,
      );
      return response;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  },
);

// Get by ID
export const getLotById = createAsyncThunk<
  ApiResponse<FecthLot>,
  number,
  ThunkApi
>("lots/byId", async (id, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.GET_LOT_BY_ID}/${id}`);
    const error = handleApiResult(response, "lot introuvable");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);

    return response!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// Create Lot
export const createLot = createAsyncThunk<
  ApiResponse<FecthLot>,
  FormData, // On attend bien un FormData ici
  ThunkApi
>("lots/create", async (formData, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.LOT_CREATE}`, {
      method: "POST",
      // Note: Ne PAS ajouter de header Content-Type ici. 
      // fetchWithAuth doit être assez intelligent pour ne pas forcer 'application/json' 
      // si le body est un FormData.
      body: formData,
    });

    const error = handleApiResult(response, "erreur lors de la creation");
    if (error) {
      // On extrait l'erreur complète du backend (qui contient farmId, name, etc.)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    }
    
    return response;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// Update Lot
export const updateLot = createAsyncThunk<
  ApiResponse<FecthLot>,
  { id: number; data: any },
  ThunkApi
>("lots/update", async ({ id, data }, apiThunk) => {
  try {
    const isFormData = data instanceof FormData;
    const response = await fetchWithAuth(`${ROUTES.LOT_UPDATE(id)}`, {
      method: "PUT",
      body: isFormData ? data : JSON.stringify(data),
    });

    const error = handleApiResult(response, "Erreur lors de la modification");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);

    return response!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

// Delete Lot
export const deleteLot = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  ThunkApi
>("lots/delete", async ({ id }, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.LOT_DELETE(id)}`, {
      method: "DELETE",
    });
    const error = handleApiResult(response, "Erreur lors de la suppression");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return response!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});