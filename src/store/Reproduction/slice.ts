/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  FetchReproductionCycle, FetchGestation, FetchGestationCheckup,
  FetchGeneticPerformance, FetchPedigree,
} from "../../models/reproduction";

import {
  fetchReproductionCycles, fetchReproductionCycleById,
  createReproductionCycle, updateReproductionCycle, deleteReproductionCycle,
  fetchGestations, fetchGestationById,
  createGestation, updateGestation, deleteGestation,
  fetchGestationCheckups, fetchGestationCheckupById,
  createGestationCheckup, updateGestationCheckup, deleteGestationCheckup,
  fetchGeneticPerformances, fetchGeneticPerformanceById,
  createGeneticPerformance, updateGeneticPerformance, deleteGeneticPerformance,
  fetchPedigrees, fetchPedigreeById, createPedigree, updatePedigree, deletePedigree,
  syncGeneticPerformance,fetchGeneticStats
} from "./action";

// ─── State ────────────────────────────────────────────────────────────────────
interface ReproductionState {
  cycles: FetchReproductionCycle[];
  currentCycle: FetchReproductionCycle | null;
  gestations: FetchGestation[];
  currentGestation: FetchGestation | null;
  checkups: FetchGestationCheckup[];
  currentCheckup: FetchGestationCheckup | null;
  geneticPerformances: FetchGeneticPerformance[];
  currentGeneticPerformance: FetchGeneticPerformance | null;
  pedigrees: FetchPedigree[];
  currentPedigree: FetchPedigree | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  stats: any | null; 
  syncLoading: boolean;
}

const initialState: ReproductionState = {
  cycles: [], currentCycle: null,
  gestations: [], currentGestation: null,
  checkups: [], currentCheckup: null,
  geneticPerformances: [], currentGeneticPerformance: null,
  pedigrees: [], currentPedigree: null,
  loading: false, error: null, success: false,
  stats:null,
  syncLoading:false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
// API shape : { meta, data: { data: [...], pagination: {} }, error }
// Pour les listes paginées : payload.data.data
// Pour les entités uniques : payload.data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractList  = (p: any) => p?.data?.data ?? p?.data ?? [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractOne   = (p: any) => p?.data ?? p ?? null;

const setPending  = (state: ReproductionState) => { state.loading = true;  state.error = null; state.success = false; };
const setRejected = (state: ReproductionState, action: PayloadAction<unknown>) => {
  state.loading = false; state.error = (action.payload as string) || "Une erreur est survenue"; state.success = false;
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const reproductionSlice = createSlice({
  name: "reproduction",
  initialState,
  reducers: {
    clearError:                    (state) => { state.error = null; },
    clearSuccess:                  (state) => { state.success = false; },
    clearCurrentCycle:             (state) => { state.currentCycle = null; },
    clearCurrentGestation:         (state) => { state.currentGestation = null; },
    clearCurrentCheckup:           (state) => { state.currentCheckup = null; },
    clearCurrentGeneticPerformance:(state) => { state.currentGeneticPerformance = null; },
    clearCurrentPedigree:          (state) => { state.currentPedigree = null; },
    resetReproductionState: () => initialState,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraReducers: (builder) => {

    // ── CYCLES ────────────────────────────────────────────────────────────────
    builder
      .addCase(fetchReproductionCycles.pending, setPending)
      .addCase(fetchReproductionCycles.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.cycles = extractList(action.payload); state.error = null;
      })
      .addCase(fetchReproductionCycles.rejected, setRejected);

    builder
      .addCase(fetchReproductionCycleById.pending, setPending)
      .addCase(fetchReproductionCycleById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.currentCycle = extractOne(action.payload); state.error = null;
      })
      .addCase(fetchReproductionCycleById.rejected, setRejected);

    builder
      .addCase(createReproductionCycle.pending, setPending)
      .addCase(createReproductionCycle.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.success = true; state.error = null;
        const item = extractOne(action.payload);
        if (item?.id) state.cycles.unshift(item);
      })
      .addCase(createReproductionCycle.rejected, setRejected);

    builder
      .addCase(updateReproductionCycle.pending, setPending)
      .addCase(updateReproductionCycle.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.success = true; state.error = null;
        const item = extractOne(action.payload);
        if (item?.id) {
          const idx = state.cycles.findIndex((c) => c.id === item.id);
          if (idx !== -1) state.cycles[idx] = item;
          if (state.currentCycle?.id === item.id) state.currentCycle = item;
        }
      })
      .addCase(updateReproductionCycle.rejected, setRejected);

    builder
      .addCase(deleteReproductionCycle.pending, setPending)
      .addCase(deleteReproductionCycle.fulfilled, (state, action) => {
        state.loading = false; state.success = true; state.error = null;
        state.cycles = state.cycles.filter((c) => c.id !== (action.meta.arg as number));
      })
      .addCase(deleteReproductionCycle.rejected, setRejected);

    // ── GESTATIONS ────────────────────────────────────────────────────────────
    builder
      .addCase(fetchGestations.pending, setPending)
      .addCase(fetchGestations.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.gestations = extractList(action.payload); state.error = null;
      })
      .addCase(fetchGestations.rejected, setRejected);

    builder
      .addCase(fetchGestationById.pending, setPending)
      .addCase(fetchGestationById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.currentGestation = extractOne(action.payload); state.error = null;
      })
      .addCase(fetchGestationById.rejected, setRejected);

    builder
      .addCase(createGestation.pending, setPending)
      .addCase(createGestation.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.success = true; state.error = null;
        const item = extractOne(action.payload);
        if (item?.id) state.gestations.unshift(item);
      })
      .addCase(createGestation.rejected, setRejected);

    builder
      .addCase(updateGestation.pending, setPending)
      .addCase(updateGestation.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.success = true; state.error = null;
        const item = extractOne(action.payload);
        if (item?.id) {
          const idx = state.gestations.findIndex((g) => g.id === item.id);
          if (idx !== -1) state.gestations[idx] = item;
          if (state.currentGestation?.id === item.id) state.currentGestation = item;
        }
      })
      .addCase(updateGestation.rejected, setRejected);

    builder
      .addCase(deleteGestation.pending, setPending)
      .addCase(deleteGestation.fulfilled, (state, action) => {
        state.loading = false; state.success = true; state.error = null;
        state.gestations = state.gestations.filter((g) => g.id !== (action.meta.arg as number));
      })
      .addCase(deleteGestation.rejected, setRejected);

    // ── CHECKUPS ──────────────────────────────────────────────────────────────
    builder
      .addCase(fetchGestationCheckups.pending, setPending)
      .addCase(fetchGestationCheckups.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.checkups = extractList(action.payload); state.error = null;
      })
      .addCase(fetchGestationCheckups.rejected, setRejected);

    builder
      .addCase(fetchGestationCheckupById.pending, setPending)
      .addCase(fetchGestationCheckupById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.currentCheckup = extractOne(action.payload); state.error = null;
      })
      .addCase(fetchGestationCheckupById.rejected, setRejected);

    builder
      .addCase(createGestationCheckup.pending, setPending)
      .addCase(createGestationCheckup.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.success = true; state.error = null;
        const item = extractOne(action.payload);
        if (item?.id) state.checkups.unshift(item);
      })
      .addCase(createGestationCheckup.rejected, setRejected);

    builder
      .addCase(updateGestationCheckup.pending, setPending)
      .addCase(updateGestationCheckup.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.success = true; state.error = null;
        const item = extractOne(action.payload);
        if (item?.id) {
          const idx = state.checkups.findIndex((c) => c.id === item.id);
          if (idx !== -1) state.checkups[idx] = item;
          if (state.currentCheckup?.id === item.id) state.currentCheckup = item;
        }
      })
      .addCase(updateGestationCheckup.rejected, setRejected);

    builder
      .addCase(deleteGestationCheckup.pending, setPending)
      .addCase(deleteGestationCheckup.fulfilled, (state, action) => {
        state.loading = false; state.success = true; state.error = null;
        state.checkups = state.checkups.filter((c) => c.id !== (action.meta.arg as number));
      })
      .addCase(deleteGestationCheckup.rejected, setRejected);

    // ── GENETIC PERFORMANCES ──────────────────────────────────────────────────
    builder
      .addCase(fetchGeneticPerformances.pending, setPending)
      .addCase(fetchGeneticPerformances.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.geneticPerformances = extractList(action.payload); state.error = null;
      })
      .addCase(fetchGeneticPerformances.rejected, setRejected);

    builder
      .addCase(fetchGeneticPerformanceById.pending, setPending)
      .addCase(fetchGeneticPerformanceById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.currentGeneticPerformance = extractOne(action.payload); state.error = null;
      })
      .addCase(fetchGeneticPerformanceById.rejected, setRejected);

    builder
      .addCase(createGeneticPerformance.pending, setPending)
      .addCase(createGeneticPerformance.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.success = true; state.error = null;
        const item = extractOne(action.payload);
        if (item?.id) state.geneticPerformances.unshift(item);
      })
      .addCase(createGeneticPerformance.rejected, setRejected);

    builder
      .addCase(updateGeneticPerformance.pending, setPending)
      .addCase(updateGeneticPerformance.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.success = true; state.error = null;
        const item = extractOne(action.payload);
        if (item?.id) {
          const idx = state.geneticPerformances.findIndex((g) => g.id === item.id);
          if (idx !== -1) state.geneticPerformances[idx] = item;
          if (state.currentGeneticPerformance?.id === item.id) state.currentGeneticPerformance = item;
        }
      })
      .addCase(updateGeneticPerformance.rejected, setRejected);

    builder
      .addCase(deleteGeneticPerformance.pending, setPending)
      .addCase(deleteGeneticPerformance.fulfilled, (state, action) => {
        state.loading = false; state.success = true; state.error = null;
        state.geneticPerformances = state.geneticPerformances.filter((g) => g.id !== (action.meta.arg as number));
      })
      .addCase(deleteGeneticPerformance.rejected, setRejected);

    // ── PEDIGREES ─────────────────────────────────────────────────────────────
    builder
      .addCase(fetchPedigrees.pending, setPending)
      .addCase(fetchPedigrees.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.pedigrees = extractList(action.payload); state.error = null;
      })
      .addCase(fetchPedigrees.rejected, setRejected);

    builder
      .addCase(fetchPedigreeById.pending, setPending)
      .addCase(fetchPedigreeById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.currentPedigree = extractOne(action.payload); state.error = null;
      })
      .addCase(fetchPedigreeById.rejected, setRejected);

    builder
      .addCase(createPedigree.pending, setPending)
      .addCase(createPedigree.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.success = true; state.error = null;
        const item = extractOne(action.payload);
        if (item?.id) state.pedigrees.unshift(item);
      })
      .addCase(createPedigree.rejected, setRejected);

    builder
      .addCase(updatePedigree.pending, setPending)
      .addCase(updatePedigree.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; state.success = true; state.error = null;
        const item = extractOne(action.payload);
        if (item?.id) {
          const idx = state.pedigrees.findIndex((p) => p.id === item.id);
          if (idx !== -1) state.pedigrees[idx] = item;
          if (state.currentPedigree?.id === item.id) state.currentPedigree = item;
        }
      })
      .addCase(updatePedigree.rejected, setRejected);

    builder
      .addCase(deletePedigree.pending, setPending)
      .addCase(deletePedigree.fulfilled, (state, action) => {
        state.loading = false; state.success = true; state.error = null;
        state.pedigrees = state.pedigrees.filter((p) => p.id !== (action.meta.arg as number));
      })
      .addCase(deletePedigree.rejected, setRejected);


builder
  // Sync
  .addCase(syncGeneticPerformance.pending, (state) => {
    state.syncLoading = true;
  })
  .addCase(syncGeneticPerformance.fulfilled, (state, action) => {
    state.syncLoading = false;
    state.success = true;
    // Optionnel : mettre à jour l'animal dans la liste locale
    const index = state.geneticPerformances.findIndex(gp => gp.animalId === action.payload.animalId);
    if (index !== -1) state.geneticPerformances[index] = action.payload;
    else state.geneticPerformances.push(action.payload);
  })
  // Stats
  .addCase(fetchGeneticStats.fulfilled, (state, action) => {
    state.stats = action.payload;
  });
  },

  
});

export const {
  clearError, clearSuccess, clearCurrentCycle, clearCurrentGestation,
  clearCurrentCheckup, clearCurrentGeneticPerformance, clearCurrentPedigree,
  resetReproductionState,
} = reproductionSlice.actions;

export default reproductionSlice;