/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ThunkApi, ApiError } from "../../models/store";
import { ROUTES } from "../../constants/apiRoutes";
import { handleApiResult } from "../../lib/handleApiResult";
import { Expense, Sale, SaleItem } from "../../models/gestionFinanciere";

// ─────────────────────────────────────────────
//  EXPENSES
// ─────────────────────────────────────────────

export const getAllExpenses = createAsyncThunk(
  "expense/list",
  async (args: { limit?: number; page?: number; farmId: number }, apiThunk) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", args.limit?.toString() || "10");
      params.append("page", (args.page || 1).toString());

      if (args.farmId) {
        params.append("farmId", args.farmId.toString());
      } else {
        return apiThunk.rejectWithValue("farmId obligatoire");
      }
      const result = await fetchWithAuth(
        `${ROUTES.EXPENSE_LIST}?${params.toString()}`,
      );
      const error = handleApiResult(result, "Dépense introuvable");
      if (error)
        return apiThunk.rejectWithValue(extractApiError(error) as ApiError);

      return result;
    } catch (error) {
      return apiThunk.rejectWithValue(error);
    }
  },
);

export const getExpenseById = createAsyncThunk<
  ApiResponse<Expense>,
  number,
  ThunkApi
>("expense/get", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.EXPENSE_GET_BY_ID}/${id}`);
    const error = handleApiResult(result, "Dépense introuvable");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const createExpense = createAsyncThunk<
  ApiResponse<Expense>,
  Partial<Expense>,
  ThunkApi
>("expense/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.EXPENSE_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const updateExpense = createAsyncThunk<
  ApiResponse<Expense>,
  { id: number; data: Partial<Expense> },
  ThunkApi
>("expense/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.EXPENSE_UPDATE(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la modification");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const deleteExpense = createAsyncThunk<
  ApiResponse<null>,
  number,
  ThunkApi
>("expense/delete", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.EXPENSE_DELETE(id)}`, {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Erreur lors de la suppression");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

// ─────────────────────────────────────────────
//  SALES
// ─────────────────────────────────────────────

export const getAllSales = createAsyncThunk(
  "sale/list",
  async (args: { limit?: number; page?: number; farmId: number }, apiThunk) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", args.limit?.toString() || "10");
      params.append("page", (args.page || 1).toString());

      if (args.farmId) {
        params.append("farmId", args.farmId.toString());
      } else {
        return apiThunk.rejectWithValue("farmId obligatoire");
      }

      const result = await fetchWithAuth(
        `${ROUTES.SALE_LIST}?${params.toString()}`,
      );
      return result;
    } catch (error) {
      return apiThunk.rejectWithValue(error);
    }
  },
);

export const getSaleById = createAsyncThunk<
  ApiResponse<Sale>,
  number,
  ThunkApi
>("sale/get", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.SALE_GET_BY_ID}/${id}`);
    const error = handleApiResult(result, "Vente introuvable");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const createSale = createAsyncThunk<
  ApiResponse<Sale>,
  Partial<Sale>,
  ThunkApi
>("sale/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.SALE_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const updateSale = createAsyncThunk<
  ApiResponse<Sale>,
  { id: number; data: Partial<Sale> },
  ThunkApi
>("sale/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.SALE_UPDATE(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la modification");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const deleteSale = createAsyncThunk<ApiResponse<null>, number, ThunkApi>(
  "sale/delete",
  async (id, apiThunk) => {
    try {
      const result = await fetchWithAuth(`${ROUTES.SALE_DELETE(id)}`, {
        method: "DELETE",
      });
      const error = handleApiResult(result, "Erreur lors de la suppression");
      if (error)
        return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
      return result!;
    } catch (err) {
      return apiThunk.rejectWithValue(extractApiError(err));
    }
  },
);

// ─────────────────────────────────────────────
//  SALE ITEMS
// ─────────────────────────────────────────────

export const getSaleItemsBySaleId = createAsyncThunk<
  ApiResponse<SaleItem[]>,
  number,
  ThunkApi
>("saleItem/listBySale", async (saleId, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.SALE_ITEM_LIST_BY_SALE}/${saleId}`,
    );
    const error = handleApiResult(result, "Éléments de vente introuvables");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const createSaleItem = createAsyncThunk<
  ApiResponse<SaleItem>,
  Partial<SaleItem>,
  ThunkApi
>("saleItem/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.SALE_ITEM_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const updateSaleItem = createAsyncThunk<
  ApiResponse<SaleItem>,
  { id: number; data: Partial<SaleItem> },
  ThunkApi
>("saleItem/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.SALE_ITEM_UPDATE(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la modification");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const deleteSaleItem = createAsyncThunk<
  ApiResponse<null>,
  number,
  ThunkApi
>("saleItem/delete", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.SALE_ITEM_DELETE(id)}`, {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Erreur lors de la suppression");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});
