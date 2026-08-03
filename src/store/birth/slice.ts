/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { ApiError } from "../../models/store";
import { Birth } from "../../models/birth";

import {
  fetchBirths, getBirthById, createBirth,
  updateBirth, deleteBirth,
  createReproductionWithBirth, fetchReproductionsWithBirth,
  deleteReproductionWithBirth,updateReproductionWithBirth,getReproductionWithBirthById
} from "./action";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Pagination {
  currentPage:  number;
  previousPage: number | null;
  nextPage:     number | null;
  totalItems:   number;
  totalPages:   number;
}

interface DomainState {
  loading: boolean;
  error:   ApiError | null;
  success: boolean;
}

const domainInit = (): DomainState => ({
  loading: false,
  error:   null,
  success: false,
});

interface BirthState {
  births:          Birth[];
  currentBirth:    Birth | null;
  pagination:      Pagination | null;
  birthState:      DomainState;

  reproductions:   any[];
  reproState:      DomainState;

}

const initialState: BirthState = {
  births:        [],
  currentBirth:  null,
  pagination:    null,
  birthState:    domainInit(),
  reproductions: [],
  reproState:    domainInit(),
};

// ── Slice ─────────────────────────────────────────────────────────────────────
const birthSlice = createSlice({
  name: "birth",
  initialState,
  reducers: {
    resetBirthState(state) {
      state.birthState = domainInit();
    },
    resetReproState(state) {
      state.reproState = domainInit();
    },
    clearCurrentBirth(state) {
      state.currentBirth = null;
    },
  },

  extraReducers: (builder) => {

    // ── FETCH LIST ────────────────────────────────────────────────────────────
    builder
      .addCase(fetchBirths.pending, (state) => {
        state.birthState.loading = true;
        state.birthState.error   = null;
      })
      .addCase(fetchBirths.fulfilled, (state, action) => {
        state.birthState.loading = false;
        const payload = action.payload?.data as any;

        // Sécurité : jamais d'objet emballé dans un tableau
        if (Array.isArray(payload)) {
          state.births     = payload;
          state.pagination = null;
        } else if (Array.isArray(payload?.births)) {
          state.births     = payload.births;
          state.pagination = payload.pagination ?? null;
        } else {
          state.births     = [];
        }
      })
      .addCase(fetchBirths.rejected, (state, action) => {
        state.birthState.loading = false;
        state.birthState.error   = action.payload ?? null;
      });

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    builder
      .addCase(getBirthById.pending, (state) => {
        state.birthState.loading = true;
        state.birthState.error   = null;
        state.currentBirth       = null;
      })
      .addCase(getBirthById.fulfilled, (state, action) => {
        state.birthState.loading = false;
        state.currentBirth       = action.payload.data as Birth;
      })
      .addCase(getBirthById.rejected, (state, action) => {
        state.birthState.loading = false;
        state.birthState.error   = action.payload ?? null;
      });

    // ── CREATE ────────────────────────────────────────────────────────────────
    builder
      .addCase(createBirth.pending, (state) => {
        state.birthState = { loading: true, error: null, success: false };
      })
      .addCase(createBirth.fulfilled, (state, action) => {
        state.birthState.loading = false;
        state.birthState.success = true;
        const newBirth = action.payload.data as Birth;
        state.births.unshift(newBirth);
      })
      .addCase(createBirth.rejected, (state, action) => {
        state.birthState.loading = false;
        state.birthState.error   = action.payload ?? null;
      });

    // ── UPDATE ────────────────────────────────────────────────────────────────
    builder
      .addCase(updateBirth.pending, (state) => {
        state.birthState = { loading: true, error: null, success: false };
      })
      .addCase(updateBirth.fulfilled, (state, action) => {
        state.birthState.loading = false;
        state.birthState.success = true;
        const updated = action.payload.data as Birth;
        state.births = state.births.map((b) =>
          b.id === updated.id ? updated : b,
        );
        if (state.currentBirth?.id === updated.id) {
          state.currentBirth = updated;
        }
      })
      .addCase(updateBirth.rejected, (state, action) => {
        state.birthState.loading = false;
        state.birthState.error   = action.payload ?? null;
      });

    // ── DELETE ────────────────────────────────────────────────────────────────
    builder
      .addCase(deleteBirth.pending, (state) => {
        state.birthState = { loading: true, error: null, success: false };
      })
      .addCase(deleteBirth.fulfilled, (state, action) => {
        state.birthState.loading = false;
        state.birthState.success = true;
        const deleted = action.payload.data as Birth;
        state.births  = state.births.filter((b) => b.id !== deleted.id);
        if (state.currentBirth?.id === deleted.id) {
          state.currentBirth = null;
        }
      })
      .addCase(deleteBirth.rejected, (state, action) => {
        state.birthState.loading = false;
        state.birthState.error   = action.payload ?? null;
      });

    // ── REPRODUCTION + BIRTH AUTO ─────────────────────────────────────────────
    builder
      .addCase(createReproductionWithBirth.pending, (state) => {
        state.reproState = { loading: true, error: null, success: false };
      })
      .addCase(createReproductionWithBirth.fulfilled, (state, action) => {
        state.reproState.loading = false;
        state.reproState.success = true;
        const { birth } = action.payload.data as any;
        if (birth?.id) state.births.unshift(birth);
      })
      .addCase(createReproductionWithBirth.rejected, (state, action) => {
        state.reproState.loading = false;
        state.reproState.error   = action.payload ?? null;
      });

    builder
      .addCase(fetchReproductionsWithBirth.pending, (state) => {
        state.reproState.loading = true;
        state.reproState.error   = null;
      })
      .addCase(fetchReproductionsWithBirth.fulfilled, (state, action) => {
        state.reproState.loading = false;
        const payload = action.payload?.data as any;
        state.reproductions = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchReproductionsWithBirth.rejected, (state, action) => {
        state.reproState.loading = false;
        state.reproState.error   = action.payload ?? null;
      });

      builder
      .addCase(deleteReproductionWithBirth.pending, (state) => {
        state.reproState = { loading: true, error: null, success: false };
      })
     .addCase(deleteReproductionWithBirth.fulfilled, (state, action) => {
  const deletedId = action.payload.data;
  state.reproductions = state.reproductions.filter((r) => r.id !== deletedId);
})
      .addCase(deleteReproductionWithBirth.rejected, (state, action) => {
        state.reproState.loading = false;
        state.reproState.error   = action.payload ?? null;
  })

        builder
      .addCase(updateReproductionWithBirth.pending, (state) => {
        state.reproState = { loading: true, error: null, success: false };
      })
      .addCase(updateReproductionWithBirth.fulfilled, (state, action) => {
        state.reproState.loading = false;
        state.reproState.success = true;
        const updated = action.payload.data ;
        state.reproductions = state.reproductions.map((r) =>
          r.id === updated.id ? updated : r,
        );
      })
      .addCase(updateReproductionWithBirth.rejected, (state, action) => {
        state.reproState.loading = false;
        state.reproState.error   = action.payload ?? null;
      });

      builder
      .addCase(getReproductionWithBirthById.pending, (state) => {
        state.reproState.loading = true;
        state.reproState.error   = null;
      })
    .addCase(getReproductionWithBirthById.fulfilled, (state, action) => {
  const payload = action.payload?.data as any;
  state.reproductions = Array.isArray(payload) ? payload : [];
})
      .addCase(getReproductionWithBirthById.rejected, (state, action) => {
        state.reproState.loading = false;
        state.reproState.error   = action.payload ?? null;
      });
  
    },
});

// ── Exports ───────────────────────────────────────────────────────────────────
export const {
  resetBirthState,
  resetReproState,
  clearCurrentBirth,
} = birthSlice.actions;

type RootBirth = { birth: BirthState };

export const selectBirths          = (s: RootBirth) => s.birth.births;
export const selectCurrentBirth    = (s: RootBirth) => s.birth.currentBirth;
export const selectBirthPagination = (s: RootBirth) => s.birth.pagination;
export const selectBirthState      = (s: RootBirth) => s.birth.birthState;
export const selectReproductions   = (s: RootBirth) => s.birth.reproductions;
export const selectReproState      = (s: RootBirth) => s.birth.reproState;

export default birthSlice;