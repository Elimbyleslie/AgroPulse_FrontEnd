import { createSlice } from "@reduxjs/toolkit";
import {
  AsyncState,
  LoadingType,
} from "../../models/store"; 

import { FetchProduction, ProductionStats } from "../../models/production";
import {
  createProduction,
  fetchProductions,
  getProductionById,
  updateProduction,
  deleteProduction,
  fetchProductionStats,
} from "./action";

interface ProductionState {
  // Liste principale avec pagination
  list: AsyncState<FetchProduction[]>;

  // Détail d'une production (pour la vue single)
  current: AsyncState<FetchProduction | null>;

  // Statistiques
  stats: AsyncState<ProductionStats | null>;

  // Pour les opérations CRUD simples (create/update/delete)
  operationStatus: LoadingType;
  operationError: string | null;
}

const initialState: ProductionState = {
  list: {
    entities: [],
    pagination: null,
    status: LoadingType.IDLE,
    error: null,
  },
  current: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  stats: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  operationStatus: LoadingType.IDLE,
  operationError: null,
};

const productionSlice = createSlice({
  name: "production",
  initialState,
  reducers: {
    // Resetters utiles
    resetProductionList: (state) => {
      state.list = { ...initialState.list };
    },

    resetCurrentProduction: (state) => {
      state.current = { ...initialState.current };
    },

    resetStats: (state) => {
      state.stats = { ...initialState.stats };
    },

    clearOperationError: (state) => {
      state.operationError = null;
      state.operationStatus = LoadingType.IDLE;
    },

    // Optionnel : vider tout le slice
    resetProductionState: () => initialState,
  },

  extraReducers: (builder) => {
    // ============================
    // FETCH ALL Productions
    // ============================
    builder
      .addCase(fetchProductions.pending, (state) => {
        state.list.status = LoadingType.PENDING;
        state.list.error = null;
      })
      .addCase(fetchProductions.fulfilled, (state, action) => {
        state.list.status = LoadingType.SUCCESS;
        state.list.entities = action.payload.data.productions;
        state.list.pagination = action.payload.data.pagination || null;
      })
      .addCase(fetchProductions.rejected, (state, action) => {
        state.list.status = LoadingType.REJECTED;
        state.list.error = action.payload?.meta?.message || "Erreur inconnue";
      })

      // ============================
      // GET BY ID
      // ============================
      .addCase(getProductionById.pending, (state) => {
        state.current.status = LoadingType.PENDING;
        state.current.error = null;
      })
      .addCase(getProductionById.fulfilled, (state, action) => {
        state.current.status = LoadingType.SUCCESS;
        state.current.entities = action.payload.data;
      })
      .addCase(getProductionById.rejected, (state, action) => {
        state.current.status = LoadingType.REJECTED;
        state.current.error = action.payload?.meta?.message || "Erreur inconnue";
      })

      // ============================
      // CREATE
      // ============================
      .addCase(createProduction.pending, (state) => {
        state.operationStatus = LoadingType.PENDING;
        state.operationError = null;
      })
      .addCase(createProduction.fulfilled, (state, action) => {
        state.operationStatus = LoadingType.SUCCESS;
        // Ajoute automatiquement à la liste si elle est chargée
        state.list.entities.unshift(action.payload.data);
      })
      .addCase(createProduction.rejected, (state, action) => {
        state.operationStatus = LoadingType.REJECTED;
        state.operationError = action.payload?.meta?.message || "Erreur lors de la création";
      })

      // ============================
      // UPDATE
      // ============================
      .addCase(updateProduction.pending, (state) => {
        state.operationStatus = LoadingType.PENDING;
      })
      .addCase(updateProduction.fulfilled, (state, action) => {
        state.operationStatus = LoadingType.SUCCESS;
        const updated = action.payload.data;

        // Mise à jour dans la liste
        const index = state.list.entities.findIndex((p) => p.id === updated.id);
        if (index !== -1) {
          state.list.entities[index] = updated;
        }

        // Mise à jour du current si c'est le même
        if (state.current.entities?.id === updated.id) {
          state.current.entities = updated;
        }
      })
      .addCase(updateProduction.rejected, (state, action) => {
        state.operationStatus = LoadingType.REJECTED;
        state.operationError = action.payload?.meta?.message || "Erreur lors de la modification";
      })

      // ============================
      // DELETE
      // ============================
      .addCase(deleteProduction.pending, (state) => {
        state.operationStatus = LoadingType.PENDING;
      })
      .addCase(deleteProduction.fulfilled, (state, action) => {
        state.operationStatus = LoadingType.SUCCESS;
        const deletedId = action.payload.data.id;

        state.list.entities = state.list.entities.filter((p) => p.id !== deletedId);

        if (state.current.entities?.id === deletedId) {
          state.current.entities = null;
        }
      })
      .addCase(deleteProduction.rejected, (state, action) => {
        state.operationStatus = LoadingType.REJECTED;
        state.operationError = action.payload?.meta?.message || "Erreur lors de la suppression";
      })

      // ============================
      // FETCH STATS
      // ============================
      .addCase(fetchProductionStats.pending, (state) => {
        state.stats.status = LoadingType.PENDING;
        state.stats.error = null;
      })
      .addCase(fetchProductionStats.fulfilled, (state, action) => {
        state.stats.status = LoadingType.SUCCESS;
        state.stats.entities = action.payload.data;
      })
      .addCase(fetchProductionStats.rejected, (state, action) => {
        state.stats.status = LoadingType.REJECTED;
        state.stats.error = action.payload?.meta?.message || "Erreur lors du chargement des stats";
      });
  },
});

export const {
  resetProductionList,
  resetCurrentProduction,
  resetStats,
  clearOperationError,
  resetProductionState,
} = productionSlice.actions;

export default productionSlice;