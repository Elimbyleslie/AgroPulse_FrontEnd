/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Barn } from "../../models/barn";
import { ApiError } from "../../models/store";
import { RootState } from "..";
import {
  getAllBarns,
  getBarnById,
  createBarn,
  updateBarn,
  deleteBarn,
} from "./action";

interface BarnState {
  entities: Barn[];
  selectedBarn: Barn | null;
  isLoading: boolean;
  error: ApiError | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: BarnState = {
  entities: [],
  selectedBarn: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const barnSlice = createSlice({
  name: "barn",
  initialState,
  reducers: {
    clearSelectedBarn: (state) => {
      state.selectedBarn = null;
    },
    clearBarnError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Matchers pour pending/rejected (pour éviter la répétition)

    // Fulfilled cases
    builder.addCase(getAllBarns.fulfilled, (state, action) => {
      state.isLoading = false;
      state.entities = Array.isArray(action.payload.data?.barns)
        ? action.payload.data.barns
        : action.payload.data || [];
      
      const pagination = action.payload.data?.pagination || {};
      state.pagination = {
        total: pagination.totalItems ?? 0,
        page: pagination.currentPage ?? 1,
        limit: 10,
        totalPages: pagination.totalPage ?? 0,
      };
    });

    builder.addCase(getBarnById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedBarn = action.payload.data;
    });

    builder.addCase(createBarn.fulfilled, (state, action) => {
      state.isLoading = false;
      state.entities.unshift(action.payload.data);
      state.pagination.total += 1;
      state.pagination.totalPages = Math.ceil(
        state.pagination.total / state.pagination.limit,
      );
    });

    builder.addCase(updateBarn.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedBarn = action.payload.data;

      const index = state.entities.findIndex((b) => b.id === updatedBarn.id);
      if (index !== -1) {
        state.entities[index] = updatedBarn;
      }

      if (state.selectedBarn?.id === updatedBarn.id) {
        state.selectedBarn = updatedBarn;
      }
    });

    builder.addCase(deleteBarn.fulfilled, (state, action) => {
      state.isLoading = false;
      const arg = action.meta.arg as any;
      const deletedId = typeof arg === "number" ? arg : arg?.id;

      if (deletedId == null) {
        return;
      }

      state.entities = state.entities.filter((b) => b.id !== deletedId);

      if (state.selectedBarn?.id === deletedId) {
        state.selectedBarn = null;
      }

      state.pagination.total = Math.max(0, state.pagination.total - 1);
      state.pagination.totalPages = Math.ceil(
        state.pagination.total / state.pagination.limit,
      );
    });

    builder
      .addMatcher(
        (action): action is PayloadAction =>
          action.type.startsWith("barn/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action): action is PayloadAction<ApiError> =>
          action.type.startsWith("barn/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearSelectedBarn, clearBarnError } = barnSlice.actions;

export const selectAllBarns = (state: RootState) => state.barn.entities;
export const selectSelectedBarn = (state: RootState) => state.barn.selectedBarn;
export const selectBarnLoading = (state: RootState) => state.barn.isLoading;
export const selectBarnError = (state: RootState) => state.barn.error;
export const selectBarnPagination = (state: RootState) => state.barn.pagination;

export default barnSlice;