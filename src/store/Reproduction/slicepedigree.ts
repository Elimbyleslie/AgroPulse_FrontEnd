/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiResponse } from "../../models/store";
import { FetchPedigree } from "../../models/pedigree"; 
import {
  fetchPedigreeById,
  createPedigree,
  updatePedigree,
  deletePedigree,
  fetchGenealogyTree,
  checkConsanguinity,
} from "./actPedigree";

interface ConsanguinityResult {
  isConsanguine: boolean;
  consanguinityLevel: number;
  commonAncestors: { type: string; id: number }[];
  recommendation: string;
}

interface PedigreeState {
  currentPedigree: FetchPedigree | null;
  genealogyTree: any | null;
  consanguinity: ConsanguinityResult | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: PedigreeState = {
  currentPedigree: null,
  genealogyTree: null,
  consanguinity: null,
  loading: false,
  error: null,
  success: false,
};

const pedigreeSlice = createSlice({
  name: "pedigree",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentPedigree: (state) => {
      state.currentPedigree = null;
    },
    clearGenealogyTree: (state) => {
      state.genealogyTree = null;
    },
    clearConsanguinity: (state) => {
      state.consanguinity = null;
    },
    resetPedigreeState: () => initialState,
  },
  extraReducers: (builder) => {
    // ==================== FETCH PEDIGREE BY ID ====================
    builder
      .addCase(fetchPedigreeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPedigreeById.fulfilled,
        (state, action: PayloadAction<ApiResponse<FetchPedigree>>) => {
          state.loading = false;
          state.currentPedigree = action.payload.data || null;
          state.error = null;
        },
      )
      .addCase(fetchPedigreeById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la récupération du pedigree";
      });

    // ==================== CREATE PEDIGREE ====================
    builder
      .addCase(createPedigree.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        createPedigree.fulfilled,
        (state, action: PayloadAction<ApiResponse<FetchPedigree>>) => {
          state.loading = false;
          state.success = true;
          state.currentPedigree = action.payload.data || null;
          state.error = null;
        },
      )
      .addCase(createPedigree.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la création du pedigree";
        state.success = false;
      });

    // ==================== UPDATE PEDIGREE ====================
    builder
      .addCase(updatePedigree.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        updatePedigree.fulfilled,
        (state, action: PayloadAction<ApiResponse<FetchPedigree>>) => {
          state.loading = false;
          state.success = true;
          if (action.payload.data) {
            state.currentPedigree = action.payload.data;
          }
          state.error = null;
        },
      )
      .addCase(updatePedigree.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la mise à jour du pedigree";
        state.success = false;
      });

    // ==================== DELETE PEDIGREE ====================
    builder
      .addCase(deletePedigree.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deletePedigree.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.currentPedigree = null;
        state.error = null;
      })
      .addCase(deletePedigree.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la suppression du pedigree";
        state.success = false;
      });

    // ==================== GENEALOGY TREE ====================
    builder
      .addCase(fetchGenealogyTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGenealogyTree.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.genealogyTree = action.payload?.data ?? action.payload ?? null;
        state.error = null;
      })
      .addCase(fetchGenealogyTree.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de la récupération de l'arbre généalogique";
      });

    // ==================== CONSANGUINITY ====================
    builder
      .addCase(checkConsanguinity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        checkConsanguinity.fulfilled,
        (state, action: PayloadAction<ApiResponse<ConsanguinityResult>>) => {
          state.loading = false;
          state.consanguinity = action.payload.data || null;
          state.error = null;
        },
      )
      .addCase(checkConsanguinity.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as unknown as string) ||
          "Erreur lors de l'analyse de consanguinité";
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentPedigree,
  clearGenealogyTree,
  clearConsanguinity,
  resetPedigreeState,
} = pedigreeSlice.actions;



export default pedigreeSlice;