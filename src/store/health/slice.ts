/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FetchConsultation,
  FecthVaccination,
  FetchTreatment,
} from "../../models/health";
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
  fetchTreatments,
  fetchTreatmentById,
  createAnimalTreatment,
  updateAnimalTreatment,
  deleteAnimalTreatment,
  confirmAnimalTreatment,
  confirmAnimalVaccination,
} from "./action";

interface HealthState {
  consultations: FetchConsultation[];
  currentConsultation: FetchConsultation | null;

  vaccinations: FecthVaccination[];
  currentVaccination: FecthVaccination | null;

  treatments: FetchTreatment[];
  currentTreatment: FetchTreatment | null;

  loading: boolean;
  error: string | null;
  success: boolean;

  pagination?: {
    currentPage?: number;
    previousPage?: number | null;
    nextPage?: number | null;
    totalItems?: number;
    totalPage?: number;
    page?: number;
    pageSize?: number;
    total?: number;
  } | null;
}

const initialState: HealthState = {
  consultations: [],
  currentConsultation: null,
  vaccinations: [],
  currentVaccination: null,
  treatments: [],
  currentTreatment: null,
  loading: false,
  error: null,
  success: false,
  pagination: null,
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
    clearCurrentTreatment: (state) => {
      state.currentTreatment = null;
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

    builder
      .addCase(deleteConsultation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteConsultation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
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
          if (action.payload.data) {
            state.vaccinations.unshift(action.payload.data);
          }
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

    builder
      .addCase(deleteAnimalVaccination.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
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

    // ==================== TREATMENTS ====================
    builder
      .addCase(fetchTreatments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTreatments.fulfilled,
        (state, action: PayloadAction<ApiResponse<any>>) => {
          state.loading = false;
          state.error = null;
          state.treatments = action.payload.data?.treatments ?? [];
          state.pagination = action.payload.data?.pagination ?? null;
        },
      )
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Erreur lors de la récupération des traitements";
      });

    builder
      .addCase(fetchTreatmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTreatmentById.fulfilled,
        (state, action: PayloadAction<ApiResponse<FetchTreatment>>) => {
          state.loading = false;
          state.currentTreatment = action.payload.data || null;
          state.error = null;
        },
      )
      .addCase(fetchTreatmentById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Erreur lors de la récupération du traitement";
      });

    builder
      .addCase(createAnimalTreatment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        createAnimalTreatment.fulfilled,
        (state, action: PayloadAction<ApiResponse<FetchTreatment>>) => {
          state.loading = false;
          state.success = true;
          if (action.payload.data) {
            state.treatments.unshift(action.payload.data);
          }
          state.error = null;
        },
      )
      .addCase(createAnimalTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la création du traitement";
        state.success = false;
      });

    builder
      .addCase(updateAnimalTreatment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        updateAnimalTreatment.fulfilled,
        (state, action: PayloadAction<ApiResponse<FetchTreatment>>) => {
          state.loading = false;
          state.success = true;
          if (action.payload.data) {
            const index = state.treatments.findIndex(
              (t) => t.id === action.payload.data?.id,
            );
            if (index !== -1) {
              state.treatments[index] = action.payload.data;
            }
            if (state.currentTreatment?.id === action.payload.data.id) {
              state.currentTreatment = action.payload.data;
            }
          }
          state.error = null;
        },
      )
      .addCase(updateAnimalTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la mise à jour du traitement";
        state.success = false;
      });

    builder
      .addCase(deleteAnimalTreatment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAnimalTreatment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.treatments = state.treatments.filter(
          (t) => t.id !== (action.meta.arg as { id: number }).id,
        );
        state.error = null;
      })
      .addCase(deleteAnimalTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la suppression du traitement";
        state.success = false;
      });

    // ==================== CONFIRM VACCINATION ====================
    builder
      .addCase(confirmAnimalVaccination.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        confirmAnimalVaccination.fulfilled,
        (state, action: PayloadAction<ApiResponse<FecthVaccination>>) => {
          state.loading = false;
          state.success = true;
          const updated = action.payload?.data;
          if (updated) {
            const index = state.vaccinations.findIndex(
              (v) => Number(v.id) === Number(updated.id),
            );
            if (index !== -1) {
              state.vaccinations[index] = updated;
            }
            if (state.currentVaccination?.id === updated.id) {
              state.currentVaccination = updated;
            }
          }
          state.error = null;
        },
      )
      .addCase(confirmAnimalVaccination.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la confirmation de la vaccination";
        state.success = false;
      });

    // ==================== CONFIRM TREATMENT ====================
    builder
      .addCase(confirmAnimalTreatment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        confirmAnimalTreatment.fulfilled,
        (state, action: PayloadAction<ApiResponse<FetchTreatment>>) => {
          state.loading = false;
          state.success = true;
          const updated = action.payload?.data;
          if (updated) {
            const index = state.treatments.findIndex(
              (t) => Number(t.id) === Number(updated.id),
            );
            if (index !== -1) {
              state.treatments[index] = updated;
            }
            if (state.currentTreatment?.id === updated.id) {
              state.currentTreatment = updated;
            }
          }
          state.error = null;
        },
      )
      .addCase(confirmAnimalTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la confirmation du traitement";
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentConsultation,
  clearCurrentVaccination,
  clearCurrentTreatment,
  resetHealthState,
} = healthSlice.actions;

export default healthSlice;
