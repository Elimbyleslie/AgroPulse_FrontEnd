import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseById,
} from "./action";
import { RootState } from "..";
import { Purchase } from "../../models/achats&fournisseur";
import { ApiError } from "../../models/store";

interface Pagination {
  currentPage: number;
  totalPages?: number;
  totalItems: number;
}

interface PurchaseState {
  purchases: Purchase[];
  currentPurchase: Purchase | null;
  pagination: Pagination | null;

  loading: boolean;
  error: ApiError | null;
  success: boolean;

  lastFetched: string | null;
  farmId: number | null;
}

const initialState: PurchaseState = {
  purchases: [],
  currentPurchase: null,
  pagination: null,

  loading: false,
  error: null,
  success: false,

  lastFetched: null,
  farmId: null,
};

const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {
    resetPurchaseState: (state) => {
      Object.assign(state, initialState);
    },
    clearCurrentPurchase: (state) => {
      state.currentPurchase = null;
    },
    setCurrentFarmId: (state, action: PayloadAction<number>) => {
      state.farmId = action.payload;
    },
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const payload = action.payload.data;
        state.purchases = payload?.purchases ?? (Array.isArray(payload) ? payload : []);
        state.pagination = payload?.pagination ?? null;
        state.lastFetched = new Date().toISOString();
        if (action.meta.arg?.farmId) state.farmId = action.meta.arg.farmId;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
        state.success = false;
      });

    builder
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.purchases.unshift(action.payload.data);
        if (state.pagination) state.pagination.totalItems += 1;
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
        state.success = false;
      });

    builder
      .addCase(updatePurchase.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updated = action.payload.data;
        state.purchases = state.purchases.map((p) => (p.id === updated.id ? updated : p));
        if (state.currentPurchase?.id === updated.id) state.currentPurchase = updated;
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    builder
      .addCase(deletePurchase.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const deletedId = action.meta.arg.id;
        state.purchases = state.purchases.filter((p) => p.id !== deletedId);
        if (state.currentPurchase?.id === deletedId) state.currentPurchase = null;
        if (state.pagination) {
          state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        }
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    builder
      .addCase(getPurchaseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPurchaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPurchase = action.payload.data;
      })
      .addCase(getPurchaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });
  },
});

export const {
  resetPurchaseState,
  clearCurrentPurchase,
  setCurrentFarmId,
  invalidateCache,
} = purchaseSlice.actions;

export const selectPurchases = (state: RootState) => state.purchase.purchases;
export const selectCurrentPurchase = (state: RootState) => state.purchase.currentPurchase;
export const selectPurchasePagination = (state: RootState) => state.purchase.pagination;


export const selectPurchaseState = createSelector(
  (state: RootState) => state.purchase.loading,
  (state: RootState) => state.purchase.error,
  (state: RootState) => state.purchase.success,
  (state: RootState) => state.purchase.lastFetched,
  (state: RootState) => state.purchase.farmId,
  (loading, error, success, lastFetched, farmId) => ({
    loading,
    error,
    success,
    lastFetched,
    farmId,
  })
);

export default purchaseSlice;