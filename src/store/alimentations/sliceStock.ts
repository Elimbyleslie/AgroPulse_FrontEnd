/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { ApiError } from "../../models/store";
import { FeedStock } from "../../models/alimentation";
import { RootState } from "..";
import {
  fetchFeedStock,
  createFeedStock,
  getFeedStockById,
  updateFeedStock,
  deleteFeedStock
} from "./feedstockAct";

// ── Types ───────────────────────────────────────────────────────────────────
interface Pagination {
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  totalItems: number;
  totalPages: number;
}

interface DomainState<T> {
  fetchLoading: boolean;
  mutateLoading: boolean;
  error: ApiError | null;
  success: boolean;
  data: T | null;
}

interface FeedStockState {
  FeedStock: FeedStock[];
  currentFeedStock: FeedStock | null;
  FeedStockPagination: Pagination | null;
  FeedStockState: DomainState<FeedStock>;
}

const domainInit = <T>(): DomainState<T> => ({
  fetchLoading: false,
  mutateLoading: false,
  error: null,
  success: false,
  data: null,
});

const initialState: FeedStockState = {
  FeedStock: [],
  currentFeedStock: null,
  FeedStockPagination: null,
  FeedStockState: domainInit(),
};

const FeedStockSlice = createSlice({
  name: "feedStock",
  initialState,
  reducers: {
    resetFeedStockState(state) {
      state.FeedStockState = domainInit();
    },
    clearCurrentFeedStock(state) {
      state.currentFeedStock = null;
    },
  },

  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchFeedStock.pending, (state) => {
        state.FeedStockState.fetchLoading = true;
        state.FeedStockState.error = null;
      })
      .addCase(fetchFeedStock.fulfilled, (state, action) => {
        state.FeedStockState.fetchLoading = false;
        const payload = action.payload.data as any;
        state.FeedStock = payload.items ?? payload.stocks ?? payload ?? [];
        state.FeedStockPagination = payload.pagination ?? null;
      })
      .addCase(fetchFeedStock.rejected, (state, action) => {
        state.FeedStockState.fetchLoading = false;
        state.FeedStockState.error = action.payload ?? null;
      });

    // Create
    builder
      .addCase(createFeedStock.pending, (state) => {
        state.FeedStockState.mutateLoading = true;
        state.FeedStockState.error = null;
        state.FeedStockState.success = false;
      })
      .addCase(createFeedStock.fulfilled, (state, action) => {
        state.FeedStockState.mutateLoading = false;
        state.FeedStockState.success = true;
        state.FeedStock.unshift(action.payload.data as FeedStock);
      })
      .addCase(createFeedStock.rejected, (state, action) => {
        state.FeedStockState.mutateLoading = false;
        state.FeedStockState.error = action.payload ?? null;
      });

    // Get By ID
    builder
      .addCase(getFeedStockById.pending, (state) => {
        state.FeedStockState.fetchLoading = true;
        state.FeedStockState.error = null;
        state.currentFeedStock = null;
      })
      .addCase(getFeedStockById.fulfilled, (state, action) => {
        state.FeedStockState.fetchLoading = false;
        state.currentFeedStock = action.payload.data as FeedStock;
      })
      .addCase(getFeedStockById.rejected, (state, action) => {
        state.FeedStockState.fetchLoading = false;
        state.FeedStockState.error = action.payload ?? null;
      });

    // Update
    builder
      .addCase(updateFeedStock.pending, (state) => {
        state.FeedStockState.mutateLoading = true;
        state.FeedStockState.error = null;
        state.FeedStockState.success = false;
      })
      .addCase(updateFeedStock.fulfilled, (state, action) => {
        state.FeedStockState.mutateLoading = false;
        state.FeedStockState.success = true;
        const updated = action.payload.data as FeedStock;
        state.FeedStock = state.FeedStock.map((s) =>
          s.id === updated.id ? updated : s
        );
        if (state.currentFeedStock?.id === updated.id) {
          state.currentFeedStock = updated;
        }
      })
      .addCase(updateFeedStock.rejected, (state, action) => {
        state.FeedStockState.mutateLoading = false;
        state.FeedStockState.error = action.payload ?? null;
      });

    // Delete
    builder
      .addCase(deleteFeedStock.pending, (state) => {
        state.FeedStockState.mutateLoading = true;
        state.FeedStockState.error = null;
        state.FeedStockState.success = false;
      })
      .addCase(deleteFeedStock.fulfilled, (state, action) => {
        state.FeedStockState.mutateLoading = false;
        state.FeedStockState.success = true;
        const deleted = action.payload.data as FeedStock;
        state.FeedStock = state.FeedStock.filter((s) => s.id !== deleted.id);
        if (state.currentFeedStock?.id === deleted.id) {
          state.currentFeedStock = null;
        }
      })
      .addCase(deleteFeedStock.rejected, (state, action) => {
        state.FeedStockState.mutateLoading = false;
        state.FeedStockState.error = action.payload ?? null;
      });
  },
});

export const { resetFeedStockState, clearCurrentFeedStock } = FeedStockSlice.actions;

export const selectFeedStock = (state: RootState) => state.feedStock.FeedStock;
export const selectCurrentFeedStock = (state: RootState) => state.feedStock.currentFeedStock;
export const selectFeedStockPagination = (state: RootState) => state.feedStock.FeedStockPagination;
export const selectFeedStockState = (state: RootState) => state.feedStock.FeedStockState;

export default FeedStockSlice;