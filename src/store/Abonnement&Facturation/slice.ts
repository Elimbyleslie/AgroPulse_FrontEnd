/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import {
  Plan,
  SubscriptionWithPlan,
  SubscriptionStatus,
} from "../../models/abonnementFacturation";
import { ApiError, Pagination } from "../../models/store";
import { RootState } from "..";
import {
  fetchSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  deleteSubscription,
  fetchPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from "./action";

interface SubscriptionState {
  subscriptions: SubscriptionWithPlan[];
  currentSubscription: SubscriptionWithPlan | null;
  plans: Plan[];
  plansPagination: Pagination | null;
  subscriptionsPagination: Pagination | null;
  loading: boolean;
  actionLoading: boolean;
  error: ApiError | null;
}

const initialState: SubscriptionState = {
  subscriptions: [],
  currentSubscription: null,
  plans: [],
  plansPagination: null,
  subscriptionsPagination: null,
  loading: false,
  actionLoading: false,
  error: null,
};

// Aucune route "abonnement courant" côté backend : on dérive celui qui est
// actif (à défaut, le plus récent) à partir de la liste des abonnements.
const pickCurrent = (
  list: SubscriptionWithPlan[],
): SubscriptionWithPlan | null => {
  if (!list.length) return null;
  const active = list.find((s) => s.status === SubscriptionStatus.ACTIVE);
  if (active) return active;
  return [...list].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )[0];
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Liste des abonnements ──────────────────────────────
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;

        const payloadData = action.payload?.data as any;
        const subscriptionsList: SubscriptionWithPlan[] = Array.isArray(payloadData)
          ? payloadData
          : payloadData?.subscriptions || [];

        state.subscriptions = subscriptionsList;

        state.currentSubscription = pickCurrent(subscriptionsList);

        state.subscriptionsPagination = Array.isArray(payloadData)
          ? null
          : payloadData?.pagination || null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      .addCase(getSubscriptionById.fulfilled, (state, action) => {
        const sub = action.payload.data;
        if (!sub) return;
        const idx = state.subscriptions.findIndex((s) => s.id === sub.id);
        if (idx >= 0) state.subscriptions[idx] = sub;
        else state.subscriptions.push(sub);
        state.currentSubscription = pickCurrent(state.subscriptions);
      })

      // ── Création ───────────────────────────────────────────
      .addCase(createSubscription.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload.data) {
          state.subscriptions.push(action.payload.data);
          state.currentSubscription = pickCurrent(state.subscriptions);
        }
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      })

      // ── Mise à jour (changement de plan / renouvellement) ──
      .addCase(updateSubscription.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.actionLoading = false;
        const sub = action.payload.data;
        if (!sub) return;
        const idx = state.subscriptions.findIndex((s) => s.id === sub.id);
        if (idx >= 0) state.subscriptions[idx] = sub;
        state.currentSubscription = pickCurrent(state.subscriptions);
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      })

      // ── Annulation ─────────────────────────────────────────
      .addCase(cancelSubscription.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.actionLoading = false;
        const sub = action.payload.data;
        if (!sub) return;
        const idx = state.subscriptions.findIndex((s) => s.id === sub.id);
        if (idx >= 0)
          state.subscriptions[idx] = {
            ...state.subscriptions[idx],
            status: sub.status,
          };
        state.currentSubscription = pickCurrent(state.subscriptions);
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      })

      // ── Suppression ────────────────────────────────────────
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        const id = action.meta.arg.id;
        state.subscriptions = state.subscriptions.filter((s) => s.id !== id);
        state.currentSubscription = pickCurrent(state.subscriptions);
      })

      // ── Plans ──────────────────────────────────────────────
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.data?.plans ?? [];
        state.plansPagination = action.payload.data?.pagination ?? null;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(getPlanById.fulfilled, (state, action) => {
        const plan = action.payload.data;
        if (!plan) return;
        const idx = state.plans.findIndex((p) => p.id === plan.id);
        if (idx >= 0) state.plans[idx] = plan;
        else state.plans.push(plan);
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        if (action.payload.data) state.plans.push(action.payload.data);
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const plan = action.payload.data;
        if (!plan) return;
        const idx = state.plans.findIndex((p) => p.id === plan.id);
        if (idx >= 0) state.plans[idx] = plan;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        const id = action.meta.arg.id;
        state.plans = state.plans.filter((p) => p.id !== id);
      });
  },
});

export const { clearSubscriptionError } = subscriptionSlice.actions;

export const selectSubscriptions = (state: RootState) =>
  state.subscription.subscriptions;
export const selectCurrentSubscription = (state: RootState) =>
  state.subscription.currentSubscription;
export const selectPlans = (state: RootState) => state.subscription.plans;
export const selectPlansPagination = (state: RootState) =>
  state.subscription.plansPagination;
export const selectSubscriptionState = (state: RootState) => ({
  loading: state.subscription.loading,
  actionLoading: state.subscription.actionLoading,
  error: state.subscription.error,
});

export default subscriptionSlice;
