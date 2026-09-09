import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import { handleApiResult } from "../../lib/handleApiResult";
import extractApiError from "../../lib/errorextrator";
import { ApiError, ApiResponse, Pagination } from "../../models/store";
import {
  PaymentWithRelations,
  Invoice,
  InvoiceStatus,
  InvoiceWithSubscription,
  CreateInvoicePayload,
} from "../../models/historyPayment";
import { Payment, CreatePaymentPayload } from "../../models/gestionFinanciere";

// =====================================================
// PAYMENTS (ferme)
// =====================================================

export const fetchPayments = createAsyncThunk<
  ApiResponse<{ payments: PaymentWithRelations[]; pagination: Pagination }>,
  {
    farmId?: number;
    saleId?: number;
    page?: number;
    limit?: number;
    method?: string;
    status?: string;
    search?: string;
  },
  { rejectValue: ApiError }
>("payment/list", async (params, thunkAPI) => {
  try {
    const query = new URLSearchParams();
    if (params.farmId) query.append("farmId", String(params.farmId));
    if (params.saleId) query.append("saleId", String(params.saleId));
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.method) query.append("method", params.method);
    if (params.status) query.append("status", params.status);
    if (params.search) query.append("search", params.search);

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

export const getPaymentById = createAsyncThunk<
  ApiResponse<PaymentWithRelations>,
  number,
  { rejectValue: ApiError }
>("payment/byId", async (id, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.PAYMENT_GET_BY_ID(id), {
      method: "GET",
    });

    const error = handleApiResult(result, "Paiement introuvable");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

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

    const error = handleApiResult(
      result,
      "Échec de l'enregistrement du paiement",
    );
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

export const updatePayment = createAsyncThunk<
  ApiResponse<Payment>,
  { id: number; data: Partial<Payment> },
  { rejectValue: ApiError }
>("payment/update", async ({ id, data }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_PAYMENTS(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const error = handleApiResult(
      result,
      "Erreur lors de la mise à jour du paiement",
    );
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

export const deletePayment = createAsyncThunk<
  ApiResponse<Payment>,
  { id: number },
  { rejectValue: ApiError }
>("payment/delete", async ({ id }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.DELETE_PAYMENTS(id), {
      method: "DELETE",
    });

    const error = handleApiResult(
      result,
      "Erreur lors de la suppression du paiement",
    );
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// =====================================================
// INVOICES (abonnement)
// =====================================================

export const fetchOrganizationInvoices = createAsyncThunk<
  ApiResponse<{ invoices: InvoiceWithSubscription[]; pagination: Pagination }>,
  {
    organizationId?: number;
    page?: number;
    limit?: number;
    status?: InvoiceStatus | string;
    search?: string;
  },
  { rejectValue: ApiError }
>("invoice/list", async (params = {}, thunkAPI) => {
  try {
    const query = new URLSearchParams();
    if (params.organizationId)
      query.append("organizationId", String(params.organizationId));
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.status) query.append("status", String(params.status));
    if (params.search) query.append("search", params.search);

    const qs = query.toString();
    const url = qs ? `${ROUTES.LIST_INVOICES}?${qs}` : ROUTES.LIST_INVOICES;

    const result = await fetchWithAuth(url, { method: "GET" });

    const error = handleApiResult(result, "Factures introuvables");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

export const getInvoiceById = createAsyncThunk<
  ApiResponse<InvoiceWithSubscription>,
  number,
  { rejectValue: ApiError }
>("invoice/byId", async (id, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.GET_INVOICE_BY_ID(id), {
      method: "GET",
    });

    const error = handleApiResult(result, "Facture introuvable");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

export const createInvoice = createAsyncThunk<
  ApiResponse<InvoiceWithSubscription>,
  CreateInvoicePayload,
  { rejectValue: ApiError }
>("invoice/create", async (data, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.CREATE_INVOICES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const error = handleApiResult(
      result,
      "Erreur lors de la création de la facture",
    );
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

export const updateInvoiceStatus = createAsyncThunk<
  ApiResponse<InvoiceWithSubscription>,
  { id: number; status: InvoiceStatus },
  { rejectValue: ApiError }
>("invoice/updateStatus", async ({ id, status }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_INVOICES(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const error = handleApiResult(
      result,
      "Erreur lors de la mise à jour du statut",
    );
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

export const deleteInvoice = createAsyncThunk<
  ApiResponse<Invoice>,
  { id: number },
  { rejectValue: ApiError }
>("invoice/delete", async ({ id }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.DELETE_INVOICES(id), {
      method: "DELETE",
    });

    const error = handleApiResult(
      result,
      "Erreur lors de la suppression de la facture",
    );
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});
