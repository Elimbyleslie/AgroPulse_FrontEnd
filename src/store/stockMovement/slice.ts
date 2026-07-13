import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchStockMovements,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
  getStockMovementById,
} from "./action";
import { RootState } from "..";
import { StockMovement } from "../../models/stockMovement";
import { ApiError } from "../../models/store";

interface Pagination {
  currentPage: number;
  totalPages?: number;
  totalItems: number;
}

interface StockMovementState {
  // Données principales
  movements: StockMovement[];
  currentMovement: StockMovement | null;
  pagination: Pagination | null;

  // États UI
  loading: boolean;
  error: ApiError | null;
  success: boolean;

  // Pour le refresh automatique
  lastFetched: string | null;
  farmId: number | null;
}

const initialState: StockMovementState = {
  movements: [],
  currentMovement: null,
  pagination: null,

  loading: false,
  error: null,
  success: false,

  lastFetched: null,
  farmId: null,
};

const stockMovementSlice = createSlice({
  name: "stockMovement",
  initialState,

  reducers: {
    resetStockMovementState: (state) => {
      Object.assign(state, initialState);
    },

    clearCurrentMovement: (state) => {
      state.currentMovement = null;
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
      .addCase(fetchStockMovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.movements = action.payload.data?.movements || [];
        state.pagination = action.payload.data?.pagination || null;
        state.lastFetched = new Date().toISOString();

        // Sauvegarde du farmId utilisé
        if (action.meta.arg?.farmId) {
          state.farmId = action.meta.arg.farmId;
        }
      })
      .addCase(fetchStockMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
        state.success = false;
      });

    // ── CREATE ────────────────────────────────────────────────────────────────
    builder
      .addCase(createStockMovement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStockMovement.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.movements.unshift(action.payload.data);

        if (state.pagination) {
          state.pagination.totalItems += 1;
        }
      })
      .addCase(createStockMovement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
        state.success = false;
      });

    // ── UPDATE ────────────────────────────────────────────────────────────────
    builder
      .addCase(updateStockMovement.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStockMovement.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updated = action.payload.data;
        state.movements = state.movements.map((item) =>
          item.id === updated.id ? updated : item
        );

        if (state.currentMovement?.id === updated.id) {
          state.currentMovement = updated;
        }
      })
      .addCase(updateStockMovement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    // ── DELETE ────────────────────────────────────────────────────────────────
    builder
      .addCase(deleteStockMovement.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStockMovement.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const deletedId = action.meta.arg;
        state.movements = state.movements.filter((item) => item.id !== deletedId);

        if (state.currentMovement?.id === deletedId) {
          state.currentMovement = null;
        }

        // Mise à jour pagination
        if (state.pagination) {
          state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        }
      })
      .addCase(deleteStockMovement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    builder
      .addCase(getStockMovementById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStockMovementById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMovement = action.payload.data;
      })
      .addCase(getStockMovementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });
  },
});

// ── Actions ───────────────────────────────────────────────────────────────────
export const {
  resetStockMovementState,
  clearCurrentMovement,
  setCurrentFarmId,
  invalidateCache,
} = stockMovementSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectStockMovements = (state: RootState) =>
  state.stockMovement.movements;

export const selectCurrentStockMovement = (state: RootState) =>
  state.stockMovement.currentMovement;

export const selectStockMovementPagination = (state: RootState) =>
  state.stockMovement.pagination;

// FIX : mémoïsé avec createSelector — voir la note dans equipmentSlice.ts,
// même bug, même cause (objet littéral reconstruit à chaque appel).
export const selectStockMovementState = createSelector(
  (state: RootState) => state.stockMovement.loading,
  (state: RootState) => state.stockMovement.error,
  (state: RootState) => state.stockMovement.success,
  (state: RootState) => state.stockMovement.lastFetched,
  (state: RootState) => state.stockMovement.farmId,
  (loading, error, success, lastFetched, farmId) => ({
    loading,
    error,
    success,
    lastFetched,
    farmId,
  })
);

export default stockMovementSlice;