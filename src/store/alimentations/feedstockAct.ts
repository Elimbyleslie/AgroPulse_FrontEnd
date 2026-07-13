/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { handleApiResult } from "../../lib/handleApiResult";
import { ROUTES } from "../../constants/apiRoutes";
import { FeedStock } from "../../models/alimentation";

// ── FeedStock Actions ───────────────────────────────────────────────────────

export const fetchFeedStock = createAsyncThunk<
  ApiResponse<FeedStock[]>,
  number, // farmId
  { rejectValue: ApiError }
>("FeedStock/list", async (farmId, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.FEED_STOCK_LIST}?farmId=${farmId}`,
      { method: "GET" }
    );

    const error = handleApiResult(result, "Stocks introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createFeedStock = createAsyncThunk<
  ApiResponse<FeedStock>,
  FeedStock,
  { rejectValue: ApiError }
>("FeedStock/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.FEED_STOCK_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur lors de la création du stock");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getFeedStockById = createAsyncThunk<
  ApiResponse<FeedStock>,
  number,
  { rejectValue: ApiError }
>("FeedStock/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.FEED_STOCK_GET_BY_ID}/${id}`);
    const error = handleApiResult(result, "Stock introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateFeedStock = createAsyncThunk<
  ApiResponse<FeedStock>,
  { id: number; data: FeedStock },
  { rejectValue: ApiError }
>("FeedStock/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.FEED_STOCK_UPDATE(id), {
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

export const deleteFeedStock = createAsyncThunk<
  ApiResponse<FeedStock>,
  { id: number },
  { rejectValue: ApiError }
>("FeedStock/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.FEED_STOCK_DELETE(id), {
      method: "DELETE",
    });

    const error = handleApiResult(result, "Erreur lors de la suppression");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});