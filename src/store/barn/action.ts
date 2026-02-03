/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ThunkApi, ApiError } from "../../models/store";
import { ROUTES } from "../../constants/apiRoutes";
import { Barn } from "../../models/barn";
import { handleApiResult } from "../../lib/handleApiResult";

// Get All Barns with pagination
export const getAllBarns = createAsyncThunk(
  "barn/list",
  async (
    args: {
      limit?: number;
      page?: number;
      farmId?: number;
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

      const response = await fetchWithAuth(
        `${ROUTES.BARN_LIST}?${params.toString()}`,
      );
      return response;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  },
);

// Get Barn by ID
export const getBarnById = createAsyncThunk<
  ApiResponse<Barn>,
  number,
  ThunkApi
>("barn/byId", async (id, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.BARN_GET_BY_ID}/${id}`);
    const error = handleApiResult(response, "Étable introuvable");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);

    return response!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// Create Barn
export const createBarn = createAsyncThunk<
  ApiResponse<Barn>,
  FormData,
  ThunkApi
>("barn/create", async (formData, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.BARN_CREATE}`, {
      method: "POST",
      body: formData,
    });
    const error = handleApiResult(response, "Erreur lors de la création");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return response;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// Update Barn
export const updateBarn = createAsyncThunk<
  ApiResponse<Barn>,
  { id: number; data: any },
  ThunkApi
>("barn/update", async ({ id, data }, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.BARN_UPDATE(id)}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    const error = handleApiResult(response, "Erreur lors de la modification");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);

    return response!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

// Delete Barn
export const deleteBarn = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  ThunkApi
>("barn/delete", async ({ id }, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.BARN_DELETE(id)}`, {
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