/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ThunkApi, ApiError } from "../../models/store";
import { ROUTES } from "../../constants/apiRoutes";
import { Herd } from "../../models/herd";
import { handleApiResult } from "../../lib/handleApiResult";

export const getAllHerds = createAsyncThunk(
  "herd/list",
  async (
    args: { limit?: number; page?: number; farmId?: number; barnId?: number; speciesId?: number; search?: string },
    apiThunk,
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", args.limit?.toString() || "10");
      params.append("page", (args.page || 1).toString());
      if (args.search) params.append("search", args.search);
      if (args.farmId) params.append("farmId", args.farmId.toString());
      if (args.barnId) params.append("barnId", args.barnId.toString());
      if (args.speciesId) params.append("speciesId", args.speciesId.toString());

      const response = await fetchWithAuth(`${ROUTES.HERD_LIST}?${params.toString()}`);
      return response;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  },
);

export const getHerdById = createAsyncThunk<
  ApiResponse<Herd>,
  number,
  ThunkApi
>("herd/byId", async (id, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.GET_HERD_BY_ID}/${id}`);
    const error = handleApiResult(response, "Troupeau introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return response!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createHerd = createAsyncThunk<
  ApiResponse<Herd>,
  FormData,
  ThunkApi
>("herd/create", async (formData, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.HERD_CREATE}`, {
      method: "POST",
      body: formData,
    });
    const error = handleApiResult(response, "Erreur lors de la création");
    if (error) return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return response!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateHerd = createAsyncThunk<
  ApiResponse<Herd>,
  { id: number; data: any },
  ThunkApi
>("herd/update", async ({ id, data }, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.HERD_UPDATE(id)}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    const error = handleApiResult(response, "Erreur lors de la modification");
    if (error) return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return response!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const deleteHerd = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  ThunkApi
>("herd/delete", async ({ id }, apiThunk) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.HERD_DELETE(id)}`, {
      method: "DELETE",
    });
    const error = handleApiResult(response, "Erreur lors de la suppression");
    if (error) return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return response!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});