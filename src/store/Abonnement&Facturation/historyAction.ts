/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import { handleApiResult } from "../../lib/handleApiResult";
import extractApiError from "../../lib/errorextrator";
import { ApiError, ApiResponse, Pagination } from "../../models/store";
import { Payment, PaymentWithRelations, Invoice, InvoiceStatus, InvoiceWithSubscription } from "../../models/historyPayment";

export const fetchPayments = createAsyncThunk<
  ApiResponse<{ payments: PaymentWithRelations[]; pagination: Pagination }>,
  {
    organizationId: number;
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
    query.append("organizationId", params.organizationId.toString());
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.method) query.append("method", params.method);
    if (params.status) query.append("status", params.status);
    if (params.search) query.append("search", params.search);

    const result = await fetchWithAuth(
      `${ROUTES.LIST_PAYMENTS}?${query.toString()}`,
      { method: "GET" },
    );

    const error = handleApiResult(result, "Paiements introuvables");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ── Détail ───────────────────────────────────────────────────────────────
export const getPaymentById = createAsyncThunk<
  ApiResponse<PaymentWithRelations>,
  number,
  { rejectValue: ApiError }
>("payment/byId", async (id, thunkAPI) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.GET_PAYMENTS_BY_ID}/${id}`,
      { method: "GET" },
    );

    const error = handleApiResult(result, "Paiement introuvable");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ── Création ─────────────────────────────────────────────────────────────
export const createPayment = createAsyncThunk<
  ApiResponse<Payment>,
  any,
  { rejectValue: ApiError }
>("payment/create", async (data, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.CREATE_PAYMENTS, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Échec de l'enregistrement du paiement");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ── Mise à jour ──────────────────────────────────────────────────────────
export const updatePayment = createAsyncThunk<
  ApiResponse<Payment>,
  { id: number; data: Partial<Payment> },
  { rejectValue: ApiError }
>("payment/update", async ({ id, data }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_PAYMENTS(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur lors de la mise à jour du paiement");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ── Suppression ──────────────────────────────────────────────────────────
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
  
export const fetchOrganizationInvoices = createAsyncThunk<
  ApiResponse<InvoiceWithSubscription[]>,
  void,   
  { rejectValue: ApiError }
>("invoice/list", async (_, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.LIST_INVOICES, { 
      method: "GET" 
    });

    const error = handleApiResult(result, "Factures introuvables");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});
 
// ── Détail ───────────────────────────────────────────────────────────────
export const getInvoiceById = createAsyncThunk<
  ApiResponse<InvoiceWithSubscription>,
  number,
  { rejectValue: ApiError }
>("invoice/byId", async (id, thunkAPI) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.GET_INVOICES_BY_ID}/${id}`,
      { method: "GET" },
    );
 
    const error = handleApiResult(result, "Facture introuvable");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));
 
    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});
 
// ── Création ─────────────────────────────────────────────────────────────
export const createInvoice = createAsyncThunk<
  ApiResponse<Invoice>,
  {
    organizationId: number;
    subscriptionId: number;
    amount: number;
    currency: string;
    status?: InvoiceStatus;
    paymentMethod?: string;
    dueAt?: string;
  },
  { rejectValue: ApiError }
>("invoice/create", async (data, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.CREATE_INVOICES, {
      method: "POST",
      body: JSON.stringify(data),
    });
 
    const error = handleApiResult(result, "Erreur lors de la création de la facture");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));
 
    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});
 
// ── Mise à jour du statut ───────────────────────────────────────────────
// Le controller (updateInvoiceStatus) n'accepte que `status` dans le body.
export const updateInvoiceStatus = createAsyncThunk<
  ApiResponse<Invoice>,
  { id: number; status: InvoiceStatus },
  { rejectValue: ApiError }
>("invoice/updateStatus", async ({ id, status }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_INVOICES(id), {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
 
    const error = handleApiResult(result, "Erreur lors de la mise à jour du statut");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));
 
    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});
 
// ── Suppression ──────────────────────────────────────────────────────────
export const deleteInvoice = createAsyncThunk<
  ApiResponse<Invoice>,
  { id: number },
  { rejectValue: ApiError }
>("invoice/delete", async ({ id }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(ROUTES.DELETE_INVOICES(id), {
      method: "DELETE",
    });
 
    const error = handleApiResult(result, "Erreur lors de la suppression de la facture");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));
 
    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});