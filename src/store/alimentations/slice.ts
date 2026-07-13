/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { ApiError } from "../../models/store";
import {
  Inventory,
  FeedUsage,
  AnimalFeeding,
  FeedingPlan,
} from "../../models/alimentation";
import { RootState } from "..";
import {
  distributeFeedingPlan,
  fecthInventory,
  createInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  fecthFeedUsage,
  createFeedUsage,
  getFeedUsageById,
  updateFeedUsage,
  deleteFeedUsage,
  FecthAnimalFeeding,
  createAnimalFeeding,
  getAnimalFeedingById,
  updateAnimalFeeding,
  deleteAnimalFeeding,
  fetchFeedingPlan,
  createFeedingPlan,
  getFeedingPlanById,
  updateFeedingPlan,
  deleteFeedingPlan,
} from "./action";

// ── Pagination ────────────────────────────────────────────────────────────────
interface Pagination {
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  totalItems: number;
  totalPages: number;
}

// ── State par domaine ─────────────────────────────────────────────────────────
interface DomainState<T> {
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

interface AlimentationState {
  // Inventory (anciennement FeedStock)
  Inventory: Inventory[];
  currentInventory: Inventory | null;
  InventoryPagination: Pagination | null;
  InventoryState: DomainState<Inventory>;

  // FeedUsage
  feedUsages: FeedUsage[];
  currentFeedUsage: FeedUsage | null;
  feedUsagePagination: Pagination | null;
  feedUsageState: DomainState<FeedUsage>;

  // AnimalFeeding
  animalFeedings: AnimalFeeding[];
  currentAnimalFeeding: AnimalFeeding | null;
  animalFeedingPagination: Pagination | null;
  animalFeedingState: DomainState<AnimalFeeding>;

  // FeedingPlan
  feedingPlans: FeedingPlan[];
  currentFeedingPlan: FeedingPlan | null;
  feedingPlanPagination: Pagination | null;
  feedingPlanState: DomainState<FeedingPlan>;
}

const domainInit = <T>(): DomainState<T> => ({
  loading: false,
  error: null,
  success: false,
});

const initialState: AlimentationState = {
  Inventory: [],
  currentInventory: null,
  InventoryPagination: null,
  InventoryState: domainInit(),

  feedUsages: [],
  currentFeedUsage: null,
  feedUsagePagination: null,
  feedUsageState: domainInit(),

  animalFeedings: [],
  currentAnimalFeeding: null,
  animalFeedingPagination: null,
  animalFeedingState: domainInit(),

  feedingPlans: [],
  currentFeedingPlan: null,
  feedingPlanPagination: null,
  feedingPlanState: domainInit(),
};

const alimentationSlice = createSlice({
  name: "alimentation",
  initialState,
  reducers: {
    resetInventoryState(state) {
      state.InventoryState = domainInit();
    },
    resetFeedUsageState(state) {
      state.feedUsageState = domainInit();
    },
    resetAnimalFeedingState(state) {
      state.animalFeedingState = domainInit();
    },
    clearCurrentInventory(state) {
      state.currentInventory = null;
    },
    clearCurrentFeedUsage(state) {
      state.currentFeedUsage = null;
    },
    clearCurrentAnimalFeeding(state) {
      state.currentAnimalFeeding = null;
    },
    clearFeedingPlan(state) {
      state.currentFeedingPlan = null;
    },
  },

  extraReducers: (builder) => {
    // ══════════════════════════════════════════════════════════════════════════
    // INVENTORY (anciennement FeedStock)
    // ══════════════════════════════════════════════════════════════════════════

    builder
      .addCase(fecthInventory.pending, (state) => {
        state.InventoryState.loading = true;
        state.InventoryState.error = null;
      })
      .addCase(fecthInventory.fulfilled, (state, action) => {
        state.InventoryState.loading = false;
        const payload = action.payload.data as any;
        // Le backend peut renvoyer { items: [...] } ou { stocks: [...] } ou directement un tableau
        state.Inventory = payload.items ?? payload.stocks ?? payload ?? [];
        state.InventoryPagination = payload.pagination ?? null;
      })
      .addCase(fecthInventory.rejected, (state, action) => {
        state.InventoryState.loading = false;
        state.InventoryState.error = action.payload ?? null;
      });

    builder
      .addCase(createInventory.pending, (state) => {
        state.InventoryState = { loading: true, error: null, success: false };
      })
      .addCase(createInventory.fulfilled, (state, action) => {
        state.InventoryState.loading = false;
        state.InventoryState.success = true;
        state.Inventory.unshift(action.payload.data as Inventory);
      })
      .addCase(createInventory.rejected, (state, action) => {
        state.InventoryState.loading = false;
        state.InventoryState.error = action.payload ?? null;
      });

    builder
      .addCase(getInventoryById.pending, (state) => {
        state.InventoryState.loading = true;
        state.InventoryState.error = null;
        state.currentInventory = null;
      })
      .addCase(getInventoryById.fulfilled, (state, action) => {
        state.InventoryState.loading = false;
        state.currentInventory = action.payload.data as Inventory;
      })
      .addCase(getInventoryById.rejected, (state, action) => {
        state.InventoryState.loading = false;
        state.InventoryState.error = action.payload ?? null;
      });

    builder
      .addCase(updateInventory.pending, (state) => {
        state.InventoryState = { loading: true, error: null, success: false };
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        state.InventoryState.loading = false;
        state.InventoryState.success = true;
        const updated = action.payload.data as Inventory;
        state.Inventory = state.Inventory.map((s) =>
          s.id === updated.id ? updated : s,
        );
        if (state.currentInventory?.id === updated.id) {
          state.currentInventory = updated;
        }
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.InventoryState.loading = false;
        state.InventoryState.error = action.payload ?? null;
      });

    builder
      .addCase(deleteInventory.pending, (state) => {
        state.InventoryState = { loading: true, error: null, success: false };
      })
      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.InventoryState.loading = false;
        state.InventoryState.success = true;
        const deleted = action.payload.data as Inventory;
        state.Inventory = state.Inventory.filter((s) => s.id !== deleted.id);
        if (state.currentInventory?.id === deleted.id) {
          state.currentInventory = null;
        }
      })
      .addCase(deleteInventory.rejected, (state, action) => {
        state.InventoryState.loading = false;
        state.InventoryState.error = action.payload ?? null;
      });

    // ══════════════════════════════════════════════════════════════════════════
    // FEED USAGE
    // ══════════════════════════════════════════════════════════════════════════

    builder
      .addCase(fecthFeedUsage.pending, (state) => {
        state.feedUsageState.loading = true;
        state.feedUsageState.error = null;
      })
      .addCase(fecthFeedUsage.fulfilled, (state, action) => {
        state.feedUsageState.loading = false;
        const payload = action.payload.data as any;
        state.feedUsages = payload.usages ?? payload;
        state.feedUsagePagination = payload.pagination ?? null;
      })
      .addCase(fecthFeedUsage.rejected, (state, action) => {
        state.feedUsageState.loading = false;
        state.feedUsageState.error = action.payload ?? null;
      });

    builder
      .addCase(createFeedUsage.pending, (state) => {
        state.feedUsageState = { loading: true, error: null, success: false };
      })
      .addCase(createFeedUsage.fulfilled, (state, action) => {
        state.feedUsageState.loading = false;
        state.feedUsageState.success = true;
        state.feedUsages.unshift(action.payload.data as FeedUsage);
      })
      .addCase(createFeedUsage.rejected, (state, action) => {
        state.feedUsageState.loading = false;
        state.feedUsageState.error = action.payload ?? null;
      });

    builder
      .addCase(getFeedUsageById.pending, (state) => {
        state.feedUsageState.loading = true;
        state.feedUsageState.error = null;
        state.currentFeedUsage = null;
      })
      .addCase(getFeedUsageById.fulfilled, (state, action) => {
        state.feedUsageState.loading = false;
        const data = action.payload.data;
        state.currentFeedUsage = Array.isArray(data)
          ? data[0]
          : (data as FeedUsage);
      })
      .addCase(getFeedUsageById.rejected, (state, action) => {
        state.feedUsageState.loading = false;
        state.feedUsageState.error = action.payload ?? null;
      });

    builder
      .addCase(updateFeedUsage.pending, (state) => {
        state.feedUsageState = { loading: true, error: null, success: false };
      })
      .addCase(updateFeedUsage.fulfilled, (state, action) => {
        state.feedUsageState.loading = false;
        state.feedUsageState.success = true;
        const updated = action.payload.data as FeedUsage;
        state.feedUsages = state.feedUsages.map((u) =>
          u.id === updated.id ? updated : u,
        );
        if (state.currentFeedUsage?.id === updated.id) {
          state.currentFeedUsage = updated;
        }
      })
      .addCase(updateFeedUsage.rejected, (state, action) => {
        state.feedUsageState.loading = false;
        state.feedUsageState.error = action.payload ?? null;
      });

    builder
      .addCase(deleteFeedUsage.pending, (state) => {
        state.feedUsageState = { loading: true, error: null, success: false };
      })
      .addCase(deleteFeedUsage.fulfilled, (state, action) => {
        state.feedUsageState.loading = false;
        state.feedUsageState.success = true;
        const deleted = action.payload.data as FeedUsage;
        state.feedUsages = state.feedUsages.filter((u) => u.id !== deleted.id);
        if (state.currentFeedUsage?.id === deleted.id) {
          state.currentFeedUsage = null;
        }
      })
      .addCase(deleteFeedUsage.rejected, (state, action) => {
        state.feedUsageState.loading = false;
        state.feedUsageState.error = action.payload ?? null;
      });

    // ══════════════════════════════════════════════════════════════════════════
    // ANIMAL FEEDING
    // ══════════════════════════════════════════════════════════════════════════

    builder
      .addCase(FecthAnimalFeeding.pending, (state) => {
        state.animalFeedingState.loading = true;
        state.animalFeedingState.error = null;
      })
      .addCase(FecthAnimalFeeding.fulfilled, (state, action) => {
        state.animalFeedingState.loading = false;
        const payload = action.payload.data as any;
        state.animalFeedings = payload.feedings ?? payload;
        state.animalFeedingPagination = payload.pagination ?? null;
      })
      .addCase(FecthAnimalFeeding.rejected, (state, action) => {
        state.animalFeedingState.loading = false;
        state.animalFeedingState.error = action.payload ?? null;
      });

    builder
      .addCase(createAnimalFeeding.pending, (state) => {
        state.animalFeedingState = {
          loading: true,
          error: null,
          success: false,
        };
      })
      .addCase(createAnimalFeeding.fulfilled, (state, action) => {
        state.animalFeedingState.loading = false;
        state.animalFeedingState.success = true;
        state.animalFeedings.unshift(action.payload.data as AnimalFeeding);
      })
      .addCase(createAnimalFeeding.rejected, (state, action) => {
        state.animalFeedingState.loading = false;
        state.animalFeedingState.error = action.payload ?? null;
      });

    builder
      .addCase(getAnimalFeedingById.pending, (state) => {
        state.animalFeedingState.loading = true;
        state.animalFeedingState.error = null;
        state.currentAnimalFeeding = null;
      })
      .addCase(getAnimalFeedingById.fulfilled, (state, action) => {
        state.animalFeedingState.loading = false;
        state.currentAnimalFeeding = action.payload.data as AnimalFeeding;
      })
      .addCase(getAnimalFeedingById.rejected, (state, action) => {
        state.animalFeedingState.loading = false;
        state.animalFeedingState.error = action.payload ?? null;
      });

    builder
      .addCase(updateAnimalFeeding.pending, (state) => {
        state.animalFeedingState = {
          loading: true,
          error: null,
          success: false,
        };
      })
      .addCase(updateAnimalFeeding.fulfilled, (state, action) => {
        state.animalFeedingState.loading = false;
        state.animalFeedingState.success = true;
        const updated = action.payload.data as AnimalFeeding;
        state.animalFeedings = state.animalFeedings.map((f) =>
          f.id === updated.id ? updated : f,
        );
        if (state.currentAnimalFeeding?.id === updated.id) {
          state.currentAnimalFeeding = updated;
        }
      })
      .addCase(updateAnimalFeeding.rejected, (state, action) => {
        state.animalFeedingState.loading = false;
        state.animalFeedingState.error = action.payload ?? null;
      });

    builder
      .addCase(deleteAnimalFeeding.pending, (state) => {
        state.animalFeedingState = {
          loading: true,
          error: null,
          success: false,
        };
      })
      .addCase(deleteAnimalFeeding.fulfilled, (state, action) => {
        state.animalFeedingState.loading = false;
        state.animalFeedingState.success = true;
        const deleted = action.payload.data as AnimalFeeding;
        state.animalFeedings = state.animalFeedings.filter(
          (f) => f.id !== deleted.id,
        );
        if (state.currentAnimalFeeding?.id === deleted.id) {
          state.currentAnimalFeeding = null;
        }
      })
      .addCase(deleteAnimalFeeding.rejected, (state, action) => {
        state.animalFeedingState.loading = false;
        state.animalFeedingState.error = action.payload ?? null;
      });

    // ══════════════════════════════════════════════════════════════════════════
    // FEEDING PLAN
    // ══════════════════════════════════════════════════════════════════════════

    builder
      .addCase(fetchFeedingPlan.pending, (state) => {
        state.feedingPlanState.loading = true;
        state.feedingPlanState.error = null;
      })
      .addCase(fetchFeedingPlan.fulfilled, (state, action) => {
        state.feedingPlanState.loading = false;
        state.feedingPlanState.error = null;

        const data = action.payload.data as any;

        let plans: FeedingPlan[] = [];

        if (Array.isArray(data)) {
          plans = data;
        } else if (data?.feedingPlans && Array.isArray(data.feedingPlans)) {
          plans = data.feedingPlans; // ← c'est ce cas
        } else if (data?.items && Array.isArray(data.items)) {
          plans = data.items;
        } else {
          console.warn("⚠️ Format inattendu:", data);
          plans = [];
        }

        state.feedingPlans = plans;
        state.feedingPlanPagination = data?.pagination ?? null;
      })
      .addCase(fetchFeedingPlan.rejected, (state, action) => {
        state.feedingPlanState.loading = false;
        state.feedingPlanState.error = action.payload ?? null;
      });

    builder
      .addCase(createFeedingPlan.pending, (state) => {
        state.feedingPlanState = { loading: true, error: null, success: false };
      })
      .addCase(createFeedingPlan.fulfilled, (state, action) => {
        state.feedingPlanState.loading = false;
        state.feedingPlanState.success = true;
        state.feedingPlans.unshift(action.payload.data as FeedingPlan);
      })
      .addCase(createFeedingPlan.rejected, (state, action) => {
        state.feedingPlanState.loading = false;
        state.feedingPlanState.error = action.payload ?? null;
      });

    builder
      .addCase(updateFeedingPlan.pending, (state) => {
        state.feedingPlanState = { loading: true, error: null, success: false };
      })
      .addCase(updateFeedingPlan.fulfilled, (state, action) => {
        state.feedingPlanState.loading = false;
        state.feedingPlanState.success = true;
        const updated = action.payload.data as FeedingPlan;
        state.feedingPlans = state.feedingPlans.map((f) =>
          f.id === updated.id ? updated : f,
        );
        if (state.currentFeedingPlan?.id === updated.id) {
          state.currentFeedingPlan = updated;
        }
      })
      .addCase(updateFeedingPlan.rejected, (state, action) => {
        state.feedingPlanState.loading = false;
        state.feedingPlanState.error = action.payload ?? null;
      });

    builder
      .addCase(deleteFeedingPlan.pending, (state) => {
        state.feedingPlanState = { loading: true, error: null, success: false };
      })
      .addCase(deleteFeedingPlan.fulfilled, (state, action) => {
        state.feedingPlanState.loading = false;
        state.feedingPlanState.success = true;
        const deleted = action.payload.data as FeedingPlan;
        state.feedingPlans = state.feedingPlans.filter(
          (f) => f.id !== deleted.id,
        );
        if (state.currentFeedingPlan?.id === deleted.id) {
          state.currentFeedingPlan = null;
        }
      })
      .addCase(deleteFeedingPlan.rejected, (state, action) => {
        state.feedingPlanState.loading = false;
        state.feedingPlanState.error = action.payload ?? null;
      });

    builder
      .addCase(getFeedingPlanById.pending, (state) => {
        state.feedingPlanState = { loading: true, error: null, success: false };
      })
      .addCase(getFeedingPlanById.fulfilled, (state, action) => {
        state.feedingPlanState.loading = false;
        state.feedingPlanState.success = true;
        state.currentFeedingPlan = action.payload.data as FeedingPlan;
      })
      .addCase(getFeedingPlanById.rejected, (state, action) => {
        state.feedingPlanState.loading = false;
        state.feedingPlanState.error = action.payload ?? null;
      });

    builder.addCase(distributeFeedingPlan.fulfilled, (state, action) => {
      const { updatedPlan, updatedStock } = action.payload.data;
      const planIndex = state.feedingPlans.findIndex(
        (p) => p.id === updatedPlan.id,
      );
      if (planIndex !== -1) {
        state.feedingPlans[planIndex].lastDistributedAt =
          updatedPlan.lastDistributedAt;
      }
      const stockIndex = state.Inventory.findIndex(
        (s) => s.id === updatedStock.id,
      );
      if (stockIndex !== -1) {
        state.Inventory[stockIndex].quantity = updatedStock.quantity;
        state.Inventory[stockIndex].unit = updatedStock.unit;
      }
    });
  },
});

// ── Exports actions ───────────────────────────────────────────────────────────
export const {
  resetInventoryState,
  resetFeedUsageState,
  resetAnimalFeedingState,
  clearCurrentInventory,
  clearCurrentFeedUsage,
  clearCurrentAnimalFeeding,
  clearFeedingPlan,
} = alimentationSlice.actions;

// ── Selectors Inventory ───────────────────────────────────────────────────────
export const selectInventory = (s: RootState) => s.alimentation.Inventory;
export const selectCurrentInventory = (s: RootState) =>
  s.alimentation.currentInventory;
export const selectInventoryPagination = (s: RootState) =>
  s.alimentation.InventoryPagination;
export const selectInventoryState = (s: RootState) =>
  s.alimentation.InventoryState;

// ── Selectors FeedUsage ───────────────────────────────────────────────────────
export const selectFeedUsages = (s: RootState) => s.alimentation.feedUsages;
export const selectCurrentFeedUsage = (s: RootState) =>
  s.alimentation.currentFeedUsage;
export const selectFeedUsagePagination = (s: RootState) =>
  s.alimentation.feedUsagePagination;
export const selectFeedUsageState = (s: RootState) =>
  s.alimentation.feedUsageState;

// ── Selectors AnimalFeeding ───────────────────────────────────────────────────
export const selectAnimalFeedings = (s: RootState) =>
  s.alimentation.animalFeedings;
export const selectCurrentAnimalFeeding = (s: RootState) =>
  s.alimentation.currentAnimalFeeding;
export const selectAnimalFeedingPagination = (s: RootState) =>
  s.alimentation.animalFeedingPagination;
export const selectAnimalFeedingState = (s: RootState) =>
  s.alimentation.animalFeedingState;

// ── Selectors FeedingPlan ─────────────────────────────────────────────────────
export const selectFeedingPlans = (s: RootState) => s.alimentation.feedingPlans;
export const selectCurrentFeedingPlan = (s: RootState) =>
  s.alimentation.currentFeedingPlan;
export const selectFeedingPlanPagination = (s: RootState) =>
  s.alimentation.feedingPlanPagination;
export const selectFeedingPlanState = (s: RootState) =>
  s.alimentation.feedingPlanState;

export default alimentationSlice;
