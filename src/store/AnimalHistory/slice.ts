/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiResponse } from "../../models/store";
import { AnimalHealthRecord } from "../../models/health";
import {
  fetchAnimalHealthRecords,
  getAnimalHealthRecordById,
  createAnimalHealthRecord,
  updateAnimalHealthRecord,
  deleteAnimalHealthRecord,
} from "./action";

interface AnimalHealthRecordState {
  records: AnimalHealthRecord[];
  currentRecord: AnimalHealthRecord | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: {
    currentPage?: number;
    totalItems?: number;
    totalPage?: number;
  } | null;
}

const initialState: AnimalHealthRecordState = {
  records: [],
  currentRecord: null,
  loading: false,
  error: null,
  success: false,
  pagination: null,
};

const animalHealthRecordSlice = createSlice({
  name: "animalHealthRecord",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentRecord: (state) => {
      state.currentRecord = null;
    },
    resetAnimalHealthRecordState: () => initialState,
  },
  extraReducers: (builder) => {
    // ==================== FETCH ALL ====================
    builder
      .addCase(fetchAnimalHealthRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAnimalHealthRecords.fulfilled,
        (
          state,
          action: PayloadAction<
            ApiResponse<{ records: AnimalHealthRecord[]; pagination?: any }>
          >,
        ) => {
          state.loading = false;
          state.error = null;
          state.records = action.payload?.data?.records ?? [];
          state.pagination = action.payload?.data?.pagination ?? null;
        },
      )
      .addCase(fetchAnimalHealthRecords.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors du chargement des dossiers de santé";
      });

    // ==================== GET BY ID ====================
    builder
      .addCase(getAnimalHealthRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAnimalHealthRecordById.fulfilled,
        (state, action: PayloadAction<ApiResponse<AnimalHealthRecord>>) => {
          state.loading = false;
          state.currentRecord = action.payload?.data ?? null;
          state.error = null;
        },
      )
      .addCase(getAnimalHealthRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la récupération du dossier de santé";
      });

    // ==================== CREATE ====================
    builder
      .addCase(createAnimalHealthRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        createAnimalHealthRecord.fulfilled,
        (state, action: PayloadAction<ApiResponse<AnimalHealthRecord>>) => {
          state.loading = false;
          state.success = true;
          if (action.payload?.data) {
            state.records.unshift(action.payload.data);
          }
          state.error = null;
        },
      )
      .addCase(createAnimalHealthRecord.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la création du dossier de santé";
        state.success = false;
      });

    // ==================== UPDATE ====================
    builder
      .addCase(updateAnimalHealthRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        updateAnimalHealthRecord.fulfilled,
        (state, action: PayloadAction<ApiResponse<AnimalHealthRecord>>) => {
          state.loading = false;
          state.success = true;
          if (action.payload?.data) {
            const index = state.records.findIndex(
              (r) => r.id === action.payload.data?.id,
            );
            if (index !== -1) {
              state.records[index] = action.payload.data;
            }
            if (state.currentRecord?.id === action.payload.data.id) {
              state.currentRecord = action.payload.data;
            }
          }
          state.error = null;
        },
      )
      .addCase(updateAnimalHealthRecord.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la mise à jour du dossier de santé";
        state.success = false;
      });

    // ==================== DELETE ====================
    builder
      .addCase(deleteAnimalHealthRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAnimalHealthRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const deletedId = (action.meta.arg as { id: number }).id;
        state.records = state.records.filter((r) => r.id !== deletedId);
        if (state.currentRecord?.id === deletedId) {
          state.currentRecord = null;
        }
        state.error = null;
      })
      .addCase(deleteAnimalHealthRecord.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la suppression du dossier de santé";
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentRecord,
  resetAnimalHealthRecordState,
} = animalHealthRecordSlice.actions;

export default animalHealthRecordSlice;