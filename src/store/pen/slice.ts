// store/pen/slice.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Pen } from "../../models/pen";
import { ApiError } from "../../models/store";
import { RootState } from "../index";
import {
  getAllPens,
  getPenById,
  createPen,
  updatePen,
  deletePen,
} from "./action";

interface PenState {
  entities: Pen[];
  selectedPen: Pen | null;
  isLoading: boolean;
  error: ApiError | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: PenState = {
  entities: [],
  selectedPen: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const penSlice = createSlice({
  name: "pen",
  initialState,
  reducers: {
    clearSelectedPen: (state) => {
      state.selectedPen = null;
    },
    clearPenError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get All Pens
    builder.addCase(getAllPens.fulfilled, (state, action) => {
      state.isLoading = false;
      state.entities = Array.isArray(action.payload.data?.pens)
        ? action.payload.data.pens
        : action.payload.data || [];
      
      const pagination = action.payload.data?.pagination || {};
      state.pagination = {
        total: pagination.totalItems ?? 0,
        page: pagination.currentPage ?? 1,
        limit: 10,
        totalPages: pagination.totalPage ?? 0,
      };
    });

    // Get Pen by ID
    builder.addCase(getPenById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedPen = action.payload.data;
    });

    // Create Pen
    builder.addCase(createPen.fulfilled, (state, action) => {
      state.isLoading = false;
      state.entities.unshift(action.payload.data);
      state.pagination.total += 1;
      state.pagination.totalPages = Math.ceil(
        state.pagination.total / state.pagination.limit,
      );
    });

    // Update Pen
    builder.addCase(updatePen.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedPen = action.payload.data;

      const index = state.entities.findIndex((p) => p.id === updatedPen.id);
      if (index !== -1) {
        state.entities[index] = updatedPen;
      }

      if (state.selectedPen?.id === updatedPen.id) {
        state.selectedPen = updatedPen;
      }
    });

    // Delete Pen
    builder.addCase(deletePen.fulfilled, (state, action) => {
      state.isLoading = false;
      const arg = action.meta.arg as any;
      const deletedId = typeof arg === "number" ? arg : arg?.id;

      if (deletedId == null) {
        return;
      }

      state.entities = state.entities.filter((p) => p.id !== deletedId);

      if (state.selectedPen?.id === deletedId) {
        state.selectedPen = null;
      }

      state.pagination.total = Math.max(0, state.pagination.total - 1);
      state.pagination.totalPages = Math.ceil(
        state.pagination.total / state.pagination.limit,
      );
    });

    // Matchers pour pending/rejected
    builder
      .addMatcher(
        (action): action is PayloadAction =>
          action.type.startsWith("Pen/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action): action is PayloadAction<ApiError> =>
          action.type.startsWith("Pen/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearSelectedPen, clearPenError } = penSlice.actions;

export const selectAllPens = (state: RootState) => state.pen.entities;
export const selectSelectedPen = (state: RootState) => state.pen.selectedPen;
export const selectPenLoading = (state: RootState) => state.pen.isLoading;
export const selectPenError = (state: RootState) => state.pen.error;
export const selectPenPagination = (state: RootState) => state.pen.pagination;

export default penSlice;