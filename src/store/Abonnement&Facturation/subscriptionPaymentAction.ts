/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { SUBSCRIPTION_PAYMENT_ROUTES } from "../../constants/apiRoutes";
import { handleApiResult } from "../../lib/handleApiResult";
import extractApiError from "../../lib/errorextrator";
import { ApiError, ApiResponse, Pagination } from "../../models/store";
import {
  SubscriptionPayment,
  SubscriptionPaymentStatus,
  CreateSubscriptionPaymentPayload,
  UpdateSubscriptionPaymentStatusPayload,
} from "../../models/SubcriptionPayment";

// =====================================================
// LIST
// =====================================================
export const fetchSubscriptionPayments = createAsyncThunk<
  ApiResponse<{ payments: SubscriptionPayment[]; pagination: Pagination }>,
  {
    organizationId?: number;
    subscriptionId?: number;
    invoiceId?: number;
    status?: SubscriptionPaymentStatus | string;
    method?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  { rejectValue: ApiError }
>("subscriptionPayment/list", async (params = {}, thunkAPI) => {
  try {
    const query = new URLSearchParams();
    if (params.organizationId)
      query.append("organizationId", String(params.organizationId));
    if (params.subscriptionId)
      query.append("subscriptionId", String(params.subscriptionId));
    if (params.invoiceId) query.append("invoiceId", String(params.invoiceId));
    if (params.status) query.append("status", String(params.status));
    if (params.method) query.append("method", params.method);
    if (params.search) query.append("search", params.search);
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    const url = qs
      ? `${SUBSCRIPTION_PAYMENT_ROUTES.LIST}?${qs}`
      : SUBSCRIPTION_PAYMENT_ROUTES.LIST;

    const result = await fetchWithAuth(url, { method: "GET" });

    const error = handleApiResult(
      result,
      "Paiements d'abonnement introuvables",
    );
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// =====================================================
// GET BY ID
// =====================================================
export const getSubscriptionPaymentById = createAsyncThunk<
  ApiResponse<SubscriptionPayment>,
  number,
  { rejectValue: ApiError }
>("subscriptionPayment/byId", async (id, thunkAPI) => {
  try {
    const result = await fetchWithAuth(
      SUBSCRIPTION_PAYMENT_ROUTES.GET_BY_ID(id),
      { method: "GET" },
    );

    const error = handleApiResult(result, "Paiement d'abonnement introuvable");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// =====================================================
// CREATE
// =====================================================
export const createSubscriptionPayment = createAsyncThunk<
  ApiResponse<SubscriptionPayment>,
  CreateSubscriptionPaymentPayload,
  { rejectValue: ApiError }
>("subscriptionPayment/create", async (data, thunkAPI) => {
  try {
    const result = await fetchWithAuth(SUBSCRIPTION_PAYMENT_ROUTES.CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const error = handleApiResult(
      result,
      "Erreur lors de l'enregistrement du paiement d'abonnement",
    );
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// =====================================================
// UPDATE STATUS
// =====================================================
export const updateSubscriptionPaymentStatus = createAsyncThunk<
  ApiResponse<SubscriptionPayment>,
  { id: number; data: UpdateSubscriptionPaymentStatusPayload },
  { rejectValue: ApiError }
>("subscriptionPayment/updateStatus", async ({ id, data }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(
      SUBSCRIPTION_PAYMENT_ROUTES.UPDATE_STATUS(id),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    const error = handleApiResult(
      result,
      "Erreur lors de la mise à jour du statut du paiement",
    );
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// =====================================================
// DELETE
// =====================================================
export const deleteSubscriptionPayment = createAsyncThunk<
  ApiResponse<SubscriptionPayment>,
  { id: number },
  { rejectValue: ApiError }
>("subscriptionPayment/delete", async ({ id }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(
      SUBSCRIPTION_PAYMENT_ROUTES.DELETE(id),
      { method: "DELETE" },
    );

    const error = handleApiResult(
      result,
      "Erreur lors de la suppression du paiement d'abonnement",
    );
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});