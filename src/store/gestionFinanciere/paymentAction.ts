/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import { handleApiResult } from "../../lib/handleApiResult";
import extractApiError from "../../lib/errorextrator";
import { ApiError, ApiResponse, Pagination } from "../../models/store";
import {
  Payment,
  CreatePaymentPayload,
} from "../../models/gestionFinanciere"; 

// =====================================================
// LIST
// =====================================================
export const fetchPayments = createAsyncThunk<
  ApiResponse<{ payments: Payment[]; pagination: Pagination }>,
  {
    farmId?: number;
    saleId?: number;
    method?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  { rejectValue: ApiError }
>("payment/list", async (params = {}, thunkAPI) => {
  try {
    const query = new URLSearchParams();
    if (params.farmId) query.append("farmId", String(params.farmId));
    if (params.saleId) query.append("saleId", String(params.saleId));
    if (params.method) query.append("method", params.method);
    if (params.status) query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    const url = qs ? `${ROUTES.LIST_PAYMENTS}?${qs}` : ROUTES.LIST_PAYMENTS;

    const result = await fetchWithAuth(url, { method: "GET" });

    const error = handleApiResult(result, "Paiements introuvables");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// =====================================================
// GET BY ID
// =====================================================
export const getPaymentById = createAsyncThunk<
  ApiResponse<Payment>,
  number,
  { rejectValue: ApiError }
>("payment/byId", async (id, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_PAYMENTS_BY_ID(id), {
      method: "GET",
    });

    const error = handleApiResult(result, "Paiement introuvable");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// =====================================================
// CREATE
// =====================================================
export const createPayment = createAsyncThunk<
  ApiResponse<Payment>,
  CreatePaymentPayload,
  { rejectValue: ApiError }
>("payment/create", async (data, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.CREATE_PAYMENTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur lors de la création du paiement");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// =====================================================
// UPDATE
// =====================================================
export const updatePayment = createAsyncThunk<
  ApiResponse<Payment>,
  { id: number; data: Partial<CreatePaymentPayload> },
  { rejectValue: ApiError }
>("payment/update", async ({ id, data }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_PAYMENTS(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur lors de la mise à jour du paiement");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// =====================================================
// DELETE
// =====================================================
export const deletePayment = createAsyncThunk<
  ApiResponse<Payment>,
  { id: number },
  { rejectValue: ApiError }
>("payment/delete", async ({ id }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.DELETE_PAYMENTS(id), {
      method: "DELETE",
    });

    const error = handleApiResult(result, "Erreur lors de la suppression du paiement");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});