/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FecthLot } from "../../models/lot";
import { ApiError } from "../../models/store";
import { RootState } from "../index";
import {
  getAllLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
} from "./action";

interface LotState {
  entities: FecthLot[];
  selectedLot: FecthLot | null;
  isLoading: boolean;
  error: ApiError | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: LotState = {
  entities: [],
  selectedLot: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const lotSlice = createSlice({
  name: "lot",
  initialState,
  reducers: {
    clearSelectedLot: (state) => {
      state.selectedLot = null;
    },
    clearLotError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Matchers pour pending/rejected(pour eviter la répétition)

   builder.addCase(getAllLots.fulfilled, (state, action) => {
  state.isLoading = false;
    const lotsData = action.payload.data?.lots || action.payload.data || [];
  state.entities = Array.isArray(lotsData) ? lotsData : [];
    const meta = action.payload.data?.pagination || action.payload.meta || {};
  state.pagination = {
    total: meta.totalItems ?? meta.total ?? 0,
    page: meta.currentPage ?? meta.page ?? 1,
    limit: 10, // Ou extraire de vos paramètres
    totalPages: meta.totalPage ?? meta.totalPages ?? 1,
  };
});

    builder.addCase(getLotById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedLot = action.payload.data;
    });

    builder.addCase(createLot.fulfilled, (state, action) => {
      state.isLoading = false;
      state.entities.unshift(action.payload.data);
      state.pagination.total += 1;
      state.pagination.totalPages = Math.ceil(
        state.pagination.total / state.pagination.limit,
      );
    });

    builder.addCase(updateLot.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedLot = action.payload.data;

      const index = state.entities.findIndex((l) => l.id === updatedLot.id);
      if (index !== -1) {
        state.entities[index] = updatedLot;
      }

      if (state.selectedLot?.id === updatedLot.id) {
        state.selectedLot = updatedLot;
      }
    });

    builder.addCase(deleteLot.fulfilled, (state, action) => {
      state.isLoading = false;
      const arg = action.meta.arg as any;
      const deletedId = typeof arg === "number" ? arg : arg?.id;

      if (deletedId == null) {
        return;
      }

      state.entities = state.entities.filter((l) => l.id !== deletedId);

      if (state.selectedLot?.id === deletedId) {
        state.selectedLot = null;
      }

      state.pagination.total = Math.max(0, state.pagination.total - 1);
      state.pagination.totalPages = Math.ceil(
        state.pagination.total / state.pagination.limit,
      );
    });

    builder
      .addMatcher(
        (action): action is PayloadAction =>
          action.type.startsWith("lot/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action): action is PayloadAction<ApiError> =>
          action.type.startsWith("lot/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearSelectedLot, clearLotError } = lotSlice.actions;

export const selectAllLots = (state: RootState) => state.lot.entities;
export const selectSelectedLot = (state: RootState) => state.lot.selectedLot;
export const selectLotLoading = (state: RootState) => state.lot.isLoading;
export const selectLotError = (state: RootState) => state.lot.error;
export const selectLotPagination = (state: RootState) => state.lot.pagination;

export default lotSlice;
