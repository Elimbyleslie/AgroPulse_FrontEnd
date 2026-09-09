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
  success: boolean;
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
  success: false,
};

/** Priorité : ACTIVE > TRIALING > PAST_DUE > CANCELLED > autre (plus récent) */
const pickCurrent = (
  list: SubscriptionWithPlan[],
): SubscriptionWithPlan | null => {
  if (!list.length) return null;

  const priority = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.TRIALING,
    SubscriptionStatus.PAST_DUE,
    SubscriptionStatus.CANCELLED,
  ];

  for (const status of priority) {
    const found = list.find((s) => s.status === status);
    if (found) return found;
  }

  return [...list].sort(
    (a, b) =>
      new Date(b.currentPeriodStart).getTime() -
      new Date(a.currentPeriodStart).getTime(),
  )[0];
};

/** Normalise la réponse create/renew (objet plat ou { subscription, ... }) */
const unwrapSubscription = (data: any): SubscriptionWithPlan | null => {
  if (!data) return null;
  if (data.subscription) return data.subscription as SubscriptionWithPlan;
  if (data.id && data.organizationId !== undefined) {
    return data as SubscriptionWithPlan;
  }
  return null;
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    clearSubscriptionSuccess: (state) => {
      state.success = false;
    },
    clearCurrentSubscription: (state) => {
      state.currentSubscription = null;
    },
    resetSubscriptionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ── Liste ──────────────────────────────────────────────
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload?.data as any;

        const list: SubscriptionWithPlan[] = Array.isArray(payloadData)
          ? payloadData
          : (payloadData?.subscriptions ?? []);

        state.subscriptions = list;
        state.currentSubscription = pickCurrent(list);
        state.subscriptionsPagination = Array.isArray(payloadData)
          ? null
          : (payloadData?.pagination ?? null);
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // // ── Courant ────────────────────────────────────────────
      // .addCase(fetchCurrentSubscription.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
      //   state.loading = false;
      //   const sub = action.payload.data;
      //   if (sub) {
      //     state.currentSubscription = sub;
      //     const idx = state.subscriptions.findIndex((s) => s.id === sub.id);
      //     if (idx >= 0) state.subscriptions[idx] = sub;
      //     else state.subscriptions.unshift(sub);
      //   }
      // })
      // .addCase(fetchCurrentSubscription.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload ?? null;
      // })

      // ── By ID ──────────────────────────────────────────────
      .addCase(getSubscriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionById.fulfilled, (state, action) => {
        state.loading = false;
        const sub = action.payload.data;
        if (!sub) return;
        const idx = state.subscriptions.findIndex((s) => s.id === sub.id);
        if (idx >= 0) state.subscriptions[idx] = sub;
        else state.subscriptions.push(sub);
        state.currentSubscription = pickCurrent(state.subscriptions);
      })
      .addCase(getSubscriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // ── Create ─────────────────────────────────────────────
      .addCase(createSubscription.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const sub = unwrapSubscription(action.payload.data);
        if (sub) {
          state.subscriptions.unshift(sub);
          state.currentSubscription = pickCurrent(state.subscriptions);
        }
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? null;
      })

      // ── Update ─────────────────────────────────────────────
      .addCase(updateSubscription.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const sub = action.payload.data;
        if (!sub) return;
        const idx = state.subscriptions.findIndex((s) => s.id === sub.id);
        if (idx >= 0) state.subscriptions[idx] = sub;
        if (state.currentSubscription?.id === sub.id) {
          state.currentSubscription = sub;
        } else {
          state.currentSubscription = pickCurrent(state.subscriptions);
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? null;
      })

      // ── Cancel ─────────────────────────────────────────────
      .addCase(cancelSubscription.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const sub = action.payload.data;
        if (!sub) return;
        const idx = state.subscriptions.findIndex((s) => s.id === sub.id);
        if (idx >= 0) {
          state.subscriptions[idx] = {
            ...state.subscriptions[idx],
            ...sub,
          };
        }
        state.currentSubscription = pickCurrent(state.subscriptions);
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? null;
      })

      // ── Renew ──────────────────────────────────────────────
      // .addCase(renewSubscription.pending, (state) => {
      //   state.actionLoading = true;
      //   state.error = null;
      //   state.success = false;
      // })
      // .addCase(renewSubscription.fulfilled, (state, action) => {
      //   state.actionLoading = false;
      //   state.success = true;
      //   const sub = unwrapSubscription(action.payload.data);
      //   if (!sub) return;
      //   const idx = state.subscriptions.findIndex((s) => s.id === sub.id);
      //   if (idx >= 0) state.subscriptions[idx] = sub;
      //   else state.subscriptions.unshift(sub);
      //   state.currentSubscription = pickCurrent(state.subscriptions);
      // })
      // .addCase(renewSubscription.rejected, (state, action) => {
      //   state.actionLoading = false;
      //   state.success = false;
      //   state.error = action.payload ?? null;
      // })

      // ── Delete ─────────────────────────────────────────────
      .addCase(deleteSubscription.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const id = action.meta.arg.id;
        state.subscriptions = state.subscriptions.filter((s) => s.id !== id);
        state.currentSubscription = pickCurrent(state.subscriptions);
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
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

      .addCase(createPlan.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        if (action.payload.data) state.plans.push(action.payload.data);
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
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

export const {
  clearSubscriptionError,
  clearSubscriptionSuccess,
  clearCurrentSubscription,
  resetSubscriptionState,
} = subscriptionSlice.actions;

export const selectSubscriptions = (state: RootState) =>
  state.subscription.subscriptions;
export const selectCurrentSubscription = (state: RootState) =>
  state.subscription.currentSubscription;
export const selectPlans = (state: RootState) => state.subscription.plans;
export const selectPlansPagination = (state: RootState) =>
  state.subscription.plansPagination;
export const selectSubscriptionsPagination = (state: RootState) =>
  state.subscription.subscriptionsPagination;
export const selectSubscriptionState = (state: RootState) => ({
  loading: state.subscription.loading,
  actionLoading: state.subscription.actionLoading,
  error: state.subscription.error,
  success: state.subscription.success,
});

export default subscriptionSlice;