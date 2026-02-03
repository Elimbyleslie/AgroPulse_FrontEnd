/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ThunkApi, ApiError } from "../../models/store";
import { ROUTES } from "../../constants/apiRoutes";
import { Pen,PenCreatePayload } from "../../models/pen";
import { handleApiResult } from "../../lib/handleApiResult";

// Get All Pens with pagination and filters
export const getAllPens = createAsyncThunk(
  "Pen/list",
  async (
    args: {
      limit?: number;
      page?: number;
      farmId?: number;
      speciesId?: number;
      search?: string;
    },
    apiThunk,
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", args.limit?.toString() || "10");
      params.append("page", (args.page || 1).toString());

      if (args.search) {
        params.append("search", args.search);
      }
      if (args.farmId) {
        params.append("farmId", args.farmId.toString());
      }
      if (args.speciesId) {
        params.append("speciesId", args.speciesId.toString());
      }

      const response = await fetchWithAuth(
        `${ROUTES.PEN_LIST}?${params.toString()}`,
      );
      return response;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  },
);

// Get Pen by ID
export const getPenById = createAsyncThunk<
  ApiResponse<Pen>,
  number,
  ThunkApi
>("Pen/byId", async (id, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.GET_PEN_BY_ID}/${id}`);
    const error = handleApiResult(response, "Pen introuvable");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);

    return response!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// Create Pen
export const createPen = createAsyncThunk<
  ApiResponse<Pen>,
  PenCreatePayload,
  ThunkApi
>("Pen/create", async (data, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.PEN_CREATE}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(response, "Erreur lors de la création");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return response;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// Update Pen
export const updatePen = createAsyncThunk<
  ApiResponse<Pen>,
  { id: number; data: any },
  ThunkApi
>("Pen/update", async ({ id, data }, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.PEN_UPDATE(id)}`, {
      method: "PUT",
      body:  JSON.stringify(data),
    });
    const error = handleApiResult(response, "Erreur lors de la modification");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);

    return response!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

// Delete Pen
export const deletePen = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  ThunkApi
>("Pen/delete", async ({ id }, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.PEN_DELETE(id)}`, {
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