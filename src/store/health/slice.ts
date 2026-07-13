/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FetchConsultation, FecthVaccination } from "../../models/health";
import { ApiResponse } from "../../models/store";
import {
  fetchConsultations,
  fetchConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation,
  fetchVaccination,
  fetchVaccinationById,
  createAnimalVaccination,
  updateAnimalVaccination,
  deleteAnimalVaccination,
} from "./action";

interface HealthState {
  consultations: FetchConsultation[];
  currentConsultation: FetchConsultation | null;
  vaccinations: FecthVaccination[];
  currentVaccination: FecthVaccination | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  } | null;
}

const initialState: HealthState = {
  consultations: [],
  currentConsultation: null,
  vaccinations: [],
  currentVaccination: null,
  loading: false,
  error: null,
  success: false,
};

const healthSlice = createSlice({
  name: "health",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentConsultation: (state) => {
      state.currentConsultation = null;
    },
    clearCurrentVaccination: (state) => {
      state.currentVaccination = null;
    },
    resetHealthState: () => initialState,
  },
  extraReducers: (builder) => {
    // ==================== CONSULTATIONS ====================

    builder
      .addCase(fetchConsultations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchConsultations.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          const payload = action.payload?.data;
          state.consultations = Array.isArray(payload)
            ? payload
            : (payload?.records ?? []);
        },
      )
      .addCase(fetchConsultations.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Erreur chargement consultations";
      });

    // Fetch Consultation By Id
    builder
      .addCase(fetchConsultationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchConsultationById.fulfilled,
        (state, action: PayloadAction<ApiResponse<FetchConsultation>>) => {
          state.loading = false;
          state.currentConsultation = action.payload.data || null;
          state.error = null;
        },
      )
      .addCase(fetchConsultationById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Erreur lors de la récupération de la consultation";
      });

    // Create Consultation
    builder
      .addCase(createConsultation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createConsultation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload.data) {
          state.consultations.unshift(action.payload.data);
        }
      })
      .addCase(createConsultation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la création de la consultation";
        state.success = false;
      });

    // Update Consultation
    builder
      .addCase(updateConsultation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateConsultation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload.data) {
          const index = state.consultations.findIndex(
            (c) => c.id === action.payload.data?.id,
          );
          if (index !== -1) state.consultations[index] = action.payload.data;
        }
      })
      .addCase(updateConsultation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la mise à jour de la consultation";
        state.success = false;
      });

    // Delete Consultation
    builder
      .addCase(deleteConsultation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      // ✅ FIX : on filtre localement après suppression pour éviter un re-fetch inutile
      .addCase(deleteConsultation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Optimistic UI update : on retire l'élément de la liste sans refetch
        const deletedId = (action.meta.arg as { id: number }).id;
        if (deletedId) {
          state.consultations = state.consultations.filter(
            (c) => c.id !== deletedId,
          );
        }
      })
      .addCase(deleteConsultation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la suppression de la consultation";
        state.success = false;
      });

    // ==================== VACCINATIONS ====================

    // Fetch Vaccinations
    builder
      .addCase(fetchVaccination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVaccination.fulfilled,
        (state, action: PayloadAction<ApiResponse<any>>) => {
          state.loading = false;
          state.error = null;
          state.vaccinations = action.payload.data?.vaccinations ?? [];
          state.pagination = action.payload.data?.pagination ?? null;
        },
      )
      .addCase(fetchVaccination.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Erreur lors de la récupération des vaccinations";
      });

    // Fetch Vaccination By Id
    builder
      .addCase(fetchVaccinationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVaccinationById.fulfilled,
        (state, action: PayloadAction<ApiResponse<FecthVaccination>>) => {
          state.loading = false;
          state.currentVaccination = action.payload.data || null;
          state.error = null;
        },
      )
      .addCase(fetchVaccinationById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Erreur lors de la récupération de la vaccination";
      });

    // Create Vaccination
    builder
      .addCase(createAnimalVaccination.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        createAnimalVaccination.fulfilled,
        (state, action: PayloadAction<ApiResponse<FecthVaccination>>) => {
          state.loading = false;
          state.success = true;
          state.vaccinations.unshift(action.payload.data!);
          state.error = null;
        },
      )
      .addCase(createAnimalVaccination.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la création de la vaccination";
        state.success = false;
      });

    // Update Vaccination
    builder
      .addCase(updateAnimalVaccination.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        updateAnimalVaccination.fulfilled,
        (state, action: PayloadAction<ApiResponse<FecthVaccination>>) => {
          state.loading = false;
          state.success = true;
          if (action.payload.data) {
            const index = state.vaccinations.findIndex(
              (v) => v.id === action.payload.data?.id,
            );
            if (index !== -1) {
              state.vaccinations[index] = action.payload.data;
            }
            if (state.currentVaccination?.id === action.payload.data.id) {
              state.currentVaccination = action.payload.data;
            }
          }
          state.error = null;
        },
      )
      .addCase(updateAnimalVaccination.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la mise à jour de la vaccination";
        state.success = false;
      });

    // Delete Vaccination
    builder
      .addCase(deleteAnimalVaccination.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      // refresh local state after deletion to avoid unnecessary refetch
      .addCase(deleteAnimalVaccination.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.vaccinations = state.vaccinations.filter(
          (v) => v.id !== (action.meta.arg as { id: number }).id,
        );
        state.error = null;
      })
      .addCase(deleteAnimalVaccination.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la suppression de la vaccination";
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentConsultation,
  clearCurrentVaccination,
  resetHealthState,
} = healthSlice.actions;

export default healthSlice;
