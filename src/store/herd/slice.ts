/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Herd } from "../../models/herd";
import { ApiError } from "../../models/store";
import { RootState } from "..";
import {
  getAllHerds,
  getHerdById,
  createHerd,
  updateHerd,
  deleteHerd,
} from "./action";

interface HerdState {
  entities: Herd[];
  selectedHerd: Herd | null;
  isLoading: boolean;
  error: ApiError | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: HerdState = {
  entities: [],
  selectedHerd: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const herdSlice = createSlice({
  name: "herd",
  initialState,
  reducers: {
    clearSelectedHerd: (state) => {
      state.selectedHerd = null;
    },
    clearHerdError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Matchers pour pending/rejected (pour éviter la répétition)

    // Fulfilled cases
    builder.addCase(getAllHerds.fulfilled, (state, action) => {
      state.isLoading = false;
      state.entities = Array.isArray(action.payload.data?.herds)
        ? action.payload.data.herds
        : action.payload.data || [];
      
      const pagination = action.payload.data?.pagination || {};
      state.pagination = {
        total: pagination.totalItems ?? 0,
        page: pagination.currentPage ?? 1,
        limit: 10,
        totalPages: pagination.totalPage ?? 0,
      };
    });

    builder.addCase(getHerdById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedHerd = action.payload.data;
    });

    builder.addCase(createHerd.fulfilled, (state, action) => {
      state.isLoading = false;
      state.entities = [action.payload.data, ...state.entities];
      state.pagination.total += 1;
      state.pagination.totalPages = Math.ceil(
        state.pagination.total / state.pagination.limit,
      );
    });

    builder.addCase(updateHerd.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedHerd = action.payload.data;

      const index = state.entities.findIndex((h) => h.id === updatedHerd.id);
      if (index !== -1) {
        state.entities[index] = updatedHerd;
      }

      if (state.selectedHerd?.id === updatedHerd.id) {
        state.selectedHerd = updatedHerd;
      }
    });

    builder.addCase(deleteHerd.fulfilled, (state, action) => {
      state.isLoading = false;
      const arg = action.meta.arg as any;
      const deletedId = typeof arg === "number" ? arg : arg?.id;

      if (deletedId == null) {
        return;
      }

      state.entities = state.entities.filter((h) => h.id !== deletedId);

      if (state.selectedHerd?.id === deletedId) {
        state.selectedHerd = null;
      }

      state.pagination.total = Math.max(0, state.pagination.total - 1);
      state.pagination.totalPages = Math.ceil(
        state.pagination.total / state.pagination.limit,
      );
    });

    builder
      .addMatcher(
        (action): action is PayloadAction =>
          action.type.startsWith("herd/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action): action is PayloadAction<ApiError> =>
          action.type.startsWith("herd/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearSelectedHerd, clearHerdError } = herdSlice.actions;

export const selectAllHerds = (state: RootState) => state.herd.entities;
export const selectSelectedHerd = (state: RootState) => state.herd.selectedHerd;
export const selectHerdLoading = (state: RootState) => state.herd.isLoading;
export const selectHerdError = (state: RootState) => state.herd.error;
export const selectHerdPagination = (state: RootState) => state.herd.pagination;

export default herdSlice;