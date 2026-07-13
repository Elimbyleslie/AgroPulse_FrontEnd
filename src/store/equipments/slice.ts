/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchEquipements,
  createEquipement,
  updateEquipement,
  deleteEquipement,
  fetchEquipementById,
  fetchEquipementMaintenances,
  createEquipementMaintenance,
  updateEquipementMaintenance,
  deleteEquipementMaintenance,
  fetchEquipementMaintenanceById,
} from "./action";

import { RootState } from "..";
import { Equipement, EquipmentMaintenance } from "../../models/equipement&maintenance";
import { ApiError } from "../../models/store";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// État global pour les équipements et maintenances
interface EquipmentState {
  // Equipment
  equipments: Equipement[];
  currentEquipment: Equipement | null;
  equipmentPagination: Pagination | null;

  // Maintenance
  maintenances: EquipmentMaintenance[];
  currentMaintenance: EquipmentMaintenance | null;
  maintenancePagination: Pagination | null;

  // États communs
  loading: boolean;
  error: ApiError | null;
  success: boolean;

  lastFetched: string | null;
  farmId: number | null;
}

const initialState: EquipmentState = {
  equipments: [],
  currentEquipment: null,
  equipmentPagination: null,

  maintenances: [],
  currentMaintenance: null,
  maintenancePagination: null,

  loading: false,
  error: null,
  success: false,

  lastFetched: null,
  farmId: null,
};

// FIX : extraction défensive. Certains endpoints renvoient `data` comme
// tableau direct, d'autres l'enveloppent dans `{ items/equipments/maintenances, pagination }`.
// Tant que le contrat exact de chaque endpoint backend n'est pas fixé et documenté,
// on ne suppose plus une seule forme — on gère les deux pour éviter un crash
// "X is not iterable" à chaque divergence.
const extractList = <T,>(raw: any, key: string): T[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.[key])) return raw[key];
  if (Array.isArray(raw?.items)) return raw.items;
  return [];
};

const extractPagination = (raw: any): Pagination | null =>
  raw?.pagination ?? null;

const equipmentSlice = createSlice({
  name: "equipment",
  initialState,

  reducers: {
    resetEquipmentState: (state) => {
      Object.assign(state, initialState);
    },

    clearCurrentEquipment: (state) => {
      state.currentEquipment = null;
    },

    clearCurrentMaintenance: (state) => {
      state.currentMaintenance = null;
    },

    setCurrentFarmId: (state, action: PayloadAction<number>) => {
      state.farmId = action.payload;
    },

    invalidateCache: (state) => {
      state.lastFetched = null;
    },
  },

  extraReducers: (builder) => {
    // ====================== EQUIPMENT ======================

    builder
      .addCase(fetchEquipements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipements.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const raw = action.payload.data as any;
        state.equipments = extractList<Equipement>(raw, "equipments");
        state.equipmentPagination = extractPagination(raw);
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchEquipements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Create Equipment
      .addCase(createEquipement.fulfilled, (state, action) => {
        state.equipments.unshift(action.payload.data);
        if (state.equipmentPagination) state.equipmentPagination.totalItems += 1;
      })

      // Update Equipment
      .addCase(updateEquipement.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.equipments = state.equipments.map((eq) =>
          eq.id === updated.id ? updated : eq
        );
        if (state.currentEquipment?.id === updated.id) {
          state.currentEquipment = updated;
        }
      })

      // Delete Equipment
      .addCase(deleteEquipement.fulfilled, (state, action) => {
        const id = action.meta.arg.id;
        state.equipments = state.equipments.filter((eq) => eq.id !== id);
        if (state.currentEquipment?.id === id) state.currentEquipment = null;
      })

      // Get Equipment By ID
      .addCase(fetchEquipementById.fulfilled, (state, action) => {
        state.currentEquipment = action.payload.data;
      });

    // ====================== MAINTENANCE ======================

    builder
      .addCase(fetchEquipementMaintenances.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEquipementMaintenances.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const raw = action.payload.data as any;
        state.maintenances = extractList<EquipmentMaintenance>(raw, "maintenances");
        state.maintenancePagination = extractPagination(raw);
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchEquipementMaintenances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // Create Maintenance
      .addCase(createEquipementMaintenance.fulfilled, (state, action) => {
        state.maintenances.unshift(action.payload.data);
        if (state.maintenancePagination) {
          state.maintenancePagination.totalItems += 1;
        }
      })

      // Update Maintenance
      .addCase(updateEquipementMaintenance.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.maintenances = state.maintenances.map((m) =>
          m.id === updated.id ? updated : m
        );
        if (state.currentMaintenance?.id === updated.id) {
          state.currentMaintenance = updated;
        }
      })

      // Delete Maintenance
      .addCase(deleteEquipementMaintenance.fulfilled, (state, action) => {
        const id = action.meta.arg.id;
        state.maintenances = state.maintenances.filter((m) => m.id !== id);
        if (state.currentMaintenance?.id === id) state.currentMaintenance = null;
      })

      // Get Maintenance By ID
      .addCase(fetchEquipementMaintenanceById.fulfilled, (state, action) => {
        state.currentMaintenance = action.payload.data;
      });
  },
});

// Actions
export const {
  resetEquipmentState,
  clearCurrentEquipment,
  clearCurrentMaintenance,
  setCurrentFarmId,
  invalidateCache,
} = equipmentSlice.actions;

// Selectors
export const selectEquipments = (state: RootState) => state.equipment.equipments;
export const selectCurrentEquipment = (state: RootState) => state.equipment.currentEquipment;
export const selectEquipmentPagination = (state: RootState) => state.equipment.equipmentPagination;

export const selectMaintenances = (state: RootState) => state.equipment.maintenances;
export const selectCurrentMaintenance = (state: RootState) => state.equipment.currentMaintenance;
export const selectMaintenancePagination = (state: RootState) => state.equipment.maintenancePagination;


export const selectEquipmentState = createSelector(
  (state: RootState) => state.equipment.loading,
  (state: RootState) => state.equipment.error,
  (state: RootState) => state.equipment.success,
  (state: RootState) => state.equipment.lastFetched,
  (state: RootState) => state.equipment.farmId,
  (loading, error, success, lastFetched, farmId) => ({
    loading,
    error,
    success,
    lastFetched,
    farmId,
  })
);

export default equipmentSlice;