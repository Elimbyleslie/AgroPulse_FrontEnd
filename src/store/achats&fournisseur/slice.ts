/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierById,
} from "./action";
import { RootState } from "..";
import { Supplier } from "../../models/achats&fournisseur";
import { ApiError } from "../../models/store";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface SupplierState {
  suppliers: Supplier[];
  currentSupplier: Supplier | null;
  pagination: Pagination | null;

  loading: boolean;
  error: ApiError | null;
  success: boolean;

  lastFetched: string | null;
  farmId: number | null;
}

const initialState: SupplierState = {
  suppliers: [],
  currentSupplier: null,
  pagination: null,

  loading: false,
  error: null,
  success: false,

  lastFetched: null,
  farmId: null,
};


const extractList = (raw: any): Supplier[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.suppliers)) return raw.suppliers;
  if (Array.isArray(raw?.items)) return raw.items;
  return [];
};

const supplierSlice = createSlice({
  name: "supplier",
  initialState,

  reducers: {
    resetSupplierState: (state) => {
      Object.assign(state, initialState);
    },

    clearCurrentSupplier: (state) => {
      state.currentSupplier = null;
    },

    setCurrentFarmId: (state, action: PayloadAction<number>) => {
      state.farmId = action.payload;
    },

    invalidateCache: (state) => {
      state.lastFetched = null;
    },
  },

  extraReducers: (builder) => {
    // ── FETCH ALL ─────────────────────────────────────────────────────────────
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const raw = action.payload.data as any;
        state.suppliers = extractList(raw);
        state.pagination = raw?.pagination ?? null;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { meta: { status: 500, message: "Erreur lors de la récupération des fournisseurs" } };
        state.success = false;
      });

    // ── CREATE ────────────────────────────────────────────────────────────────
    builder
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.suppliers.unshift(action.payload.data);

        if (state.pagination) {
          state.pagination.totalItems += 1;
        }
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
        state.success = false;
      });

    // ── UPDATE ────────────────────────────────────────────────────────────────
    builder
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updated = action.payload.data;
        state.suppliers = state.suppliers.map((s) =>
          s.id === updated.id ? updated : s
        );

        if (state.currentSupplier?.id === updated.id) {
          state.currentSupplier = updated;
        }
      });

    // ── DELETE ────────────────────────────────────────────────────────────────
    builder
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const deletedId = action.meta.arg.id;
        state.suppliers = state.suppliers.filter((s) => s.id !== deletedId);

        if (state.currentSupplier?.id === deletedId) {
          state.currentSupplier = null;
        }

        if (state.pagination) {
          state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        }
      });

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    builder
      .addCase(getSupplierById.fulfilled, (state, action) => {
        state.currentSupplier = action.payload.data;
      });
  },
});

// ── Exports ───────────────────────────────────────────────────────────────────
export const {
  resetSupplierState,
  clearCurrentSupplier,
  setCurrentFarmId,
  invalidateCache,
} = supplierSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectSuppliers = (state: RootState) => state.supplier.suppliers?.filter(Boolean) || [];
export const selectCurrentSupplier = (state: RootState) => state.supplier.currentSupplier;
export const selectSupplierPagination = (state: RootState) => state.supplier.pagination;

// FIX : mémoïsé avec createSelector — même bug que les autres selectXState.
export const selectSupplierState = createSelector(
  (state: RootState) => state.supplier.loading,
  (state: RootState) => state.supplier.error,
  (state: RootState) => state.supplier.success,
  (state: RootState) => state.supplier.lastFetched,
  (state: RootState) => state.supplier.farmId,
  (loading, error, success, lastFetched, farmId) => ({
    loading,
    error,
    success,
    lastFetched,
    farmId,
  })
);

export default supplierSlice;