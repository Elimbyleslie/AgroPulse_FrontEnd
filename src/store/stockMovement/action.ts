import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiError, ApiResponse, Pagination } from "../../models/store";
import { ROUTES } from "../../constants/apiRoutes";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { StockMovement } from "../../models/stockMovement";


export const fetchStockMovements = createAsyncThunk<
  ApiResponse<{ movements: StockMovement[]; pagination: Pagination }>,
  { farmId?: number; page?: number; limit?: number; inventoryId?: number },
  { rejectValue: ApiError }
>("stockMovements/fetch", async (params, thunkAPI) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.farmId) queryParams.append("farmId", params.farmId.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.inventoryId) queryParams.append("inventoryId", params.inventoryId.toString());

    const url = `${ROUTES.STOCK_MOVEMENT_LIST}?${queryParams.toString()}`;

    return await fetchWithAuth(url, { method: "GET" });
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

export const createStockMovement = createAsyncThunk<
  ApiResponse<StockMovement>,
  Partial<StockMovement>,
  { rejectValue: ApiError }
>("stockMovement/create", async (data, thunkAPI) => {
  try {
    return await fetchWithAuth(ROUTES.STOCK_MOVEMENT_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

export const updateStockMovement = createAsyncThunk<
  ApiResponse<StockMovement>,
  { id: number; data: Partial<StockMovement> },
  { rejectValue: ApiError }
>("stockMovement/update", async ({ id, data }, thunkAPI) => {
  try {
    return await fetchWithAuth(ROUTES.STOCK_MOVEMENT_UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

export const deleteStockMovement = createAsyncThunk<
  ApiResponse<{ id: number }>,
  number,
  { rejectValue: ApiError }
>("stockMovement/delete", async (id, thunkAPI) => {
  try {
    return await fetchWithAuth(ROUTES.STOCK_MOVEMENT_DELETE(id), {
      method: "DELETE",
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

export const getStockMovementById = createAsyncThunk<
  ApiResponse<StockMovement>,
  number,
  { rejectValue: ApiError }
>("stockMovement/byId", async (id, thunkAPI) => {
  try {
    return await fetchWithAuth(ROUTES.STOCK_MOVEMENT_GET_BY_ID(id), {
      method: "GET",
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});