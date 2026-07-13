/* eslint-disable @typescript-eslint/no-explicit-any */
import { Supplier, Purchase } from "../../models/achats&fournisseur";
import { ApiError, ApiResponse, Pagination } from "../../models/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import { handleApiResult } from "../../lib/handleApiResult";
import extractApiError from "../../lib/errorextrator";

export const fetchSuppliers = createAsyncThunk<
    ApiResponse<Supplier[]>,
    { page?: number; limit?: number },
    { rejectValue: ApiError }
>("Supplier/list", async ({ page, limit }, apiThunk) => {
    try {
        const result = await fetchWithAuth(
            `${ROUTES.SUPPLIER_LIST}?page=${page}&limit=${limit}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        if (!result) return apiThunk.rejectWithValue({ meta: { message: "Aucune réponse du serveur", status: 500 } });
        const error = handleApiResult(result, "Fournisseur introuvables");
        if (error) return apiThunk.rejectWithValue(extractApiError(error));
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});

export const createSupplier = createAsyncThunk<
  ApiResponse<Supplier>,
  any,
  { rejectValue: ApiError }
>("Supplier/create", async (data, apiThunk) => {
  try {
console.log("1. Payload original :", JSON.stringify(data, null, 2));
    const result = await fetchWithAuth(ROUTES.SUPPLIER_CREATE, {
      method: "POST",
      body: JSON.stringify(data),     // Assure-toi que c'est bien stringifié ici
    });

    console.log("✅ Réponse API :", result);
    return result;
  } catch (error) {
    console.error("❌ Erreur createSupplier :", error);
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateSupplier = createAsyncThunk<
    ApiResponse<Supplier>,
    { id: number; data: Supplier },
    { rejectValue: ApiError }
>("Supplier/update", async ({ id, data }, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.SUPPLIER_UPDATE(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
        const error = handleApiResult(result, "Fournisseur introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});

export const deleteSupplier = createAsyncThunk<
    ApiResponse<Supplier>,
    { id: number },
    { rejectValue: ApiError }
>("Supplier/delete", async ({ id }, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.SUPPLIER_DELETE(id), {
            method: "DELETE",
        });
        const error = handleApiResult(result, "Fournisseur introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});

export const getSupplierById = createAsyncThunk<
    ApiResponse<Supplier>,
    number,
    { rejectValue: ApiError }
>("Supplier/byId", async (id, apiThunk) => {
    try {
        const result = await fetchWithAuth(`${ROUTES.SUPPLIER_GET_BY_ID}/${id}`);
        const error = handleApiResult(result, "Fournisseur introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});


 
export const fetchPurchases = createAsyncThunk<
  ApiResponse<{ purchases: Purchase[]; pagination: Pagination }>,
  { farmId?: number; page?: number; limit?: number; supplierId?: number; status?: string },
  { rejectValue: ApiError }
>("purchase/list", async (params, apiThunk) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.farmId) queryParams.append("farmId", params.farmId.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.supplierId) queryParams.append("supplierId", params.supplierId.toString());
    if (params.status) queryParams.append("status", params.status);
 
    const url = `${ROUTES.PURCHASE_LIST}?${queryParams.toString()}`;
    const result = await fetchWithAuth(url, { method: "GET" });
    if (!result) return apiThunk.rejectWithValue({ meta: { message: "Aucune réponse du serveur", status: 500 } });
    const error = handleApiResult(result, "Achats introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});
 
export const createPurchase = createAsyncThunk<
  ApiResponse<Purchase>,
  Partial<Purchase>,
  { rejectValue: ApiError }
>("purchase/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.PURCHASE_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création de l'achat");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});
 
export const updatePurchase = createAsyncThunk<
  ApiResponse<Purchase>,
  { id: number; data: Partial<Purchase> },
  { rejectValue: ApiError }
>("purchase/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.PURCHASE_UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Achat introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});
 
export const deletePurchase = createAsyncThunk<
  ApiResponse<{ id: number }>,
  { id: number },
  { rejectValue: ApiError }
>("purchase/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.PURCHASE_DELETE(id), { method: "DELETE" });
    const error = handleApiResult(result, "Achat introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});
 
export const getPurchaseById = createAsyncThunk<
  ApiResponse<Purchase>,
  number,
  { rejectValue: ApiError }
>("purchase/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.PURCHASE_GET_BY_ID}/${id}`, { method: "GET" });
    const error = handleApiResult(result, "Achat introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});