/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { SubscriptionPayment } from "../../models/SubcriptionPayment";
import { ApiError, Pagination } from "../../models/store";
import { RootState } from "..";
import {
  fetchSubscriptionPayments,
  getSubscriptionPaymentById,
  createSubscriptionPayment,
  updateSubscriptionPaymentStatus,
  deleteSubscriptionPayment,
} from "./subscriptionPaymentAction";

interface SubscriptionPaymentState {
  payments: SubscriptionPayment[];
  currentPayment: SubscriptionPayment | null;
  pagination: Pagination | null;
  loading: boolean;
  actionLoading: boolean;
  error: ApiError | null;
  success: boolean;
}

const initialState: SubscriptionPaymentState = {
  payments: [],
  currentPayment: null,
  pagination: null,
  loading: false,
  actionLoading: false,
  error: null,
  success: false,
};

const subscriptionPaymentSlice = createSlice({
  name: "subscriptionPayment",
  initialState,
  reducers: {
    clearSubscriptionPaymentError: (state) => {
      state.error = null;
    },
    clearSubscriptionPaymentSuccess: (state) => {
      state.success = false;
    },
    clearCurrentSubscriptionPayment: (state) => {
      state.currentPayment = null;
    },
    resetSubscriptionPaymentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ── Liste ────────────────────────────────────────────
      .addCase(fetchSubscriptionPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPayments.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data as any;

        state.payments = Array.isArray(data)
          ? data
          : (data?.payments ?? []);

        state.pagination = Array.isArray(data)
          ? null
          : (data?.pagination ?? null);
      })
      .addCase(fetchSubscriptionPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // ── Détail ───────────────────────────────────────────
      .addCase(getSubscriptionPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        const payment = action.payload.data;
        if (!payment) return;

        state.currentPayment = payment;
        const idx = state.payments.findIndex((p) => p.id === payment.id);
        if (idx >= 0) state.payments[idx] = payment;
        else state.payments.unshift(payment);
      })
      .addCase(getSubscriptionPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // ── Création ─────────────────────────────────────────
      .addCase(createSubscriptionPayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSubscriptionPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        if (action.payload.data) {
          state.payments.unshift(action.payload.data);
        }
      })
      .addCase(createSubscriptionPayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? null;
      })

      // ── Update status ────────────────────────────────────
      .addCase(updateSubscriptionPaymentStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSubscriptionPaymentStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const payment = action.payload.data;
        if (!payment) return;

        const idx = state.payments.findIndex((p) => p.id === payment.id);
        if (idx >= 0) {
          state.payments[idx] = { ...state.payments[idx], ...payment };
        }
        if (state.currentPayment?.id === payment.id) {
          state.currentPayment = { ...state.currentPayment, ...payment };
        }
      })
      .addCase(updateSubscriptionPaymentStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? null;
      })

      // ── Suppression ──────────────────────────────────────
      .addCase(deleteSubscriptionPayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteSubscriptionPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const id = action.meta.arg.id;
        state.payments = state.payments.filter((p) => p.id !== id);
        if (state.currentPayment?.id === id) {
          state.currentPayment = null;
        }
      })
      .addCase(deleteSubscriptionPayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const {
  clearSubscriptionPaymentError,
  clearSubscriptionPaymentSuccess,
  clearCurrentSubscriptionPayment,
  resetSubscriptionPaymentState,
} = subscriptionPaymentSlice.actions;

export const selectSubscriptionPayments = (state: RootState) =>
  state.subscriptionPayment.payments.map((p) => p);
export const selectCurrentSubscriptionPayment = (state: RootState) =>
  state.subscriptionPayment.currentPayment;
export const selectSubscriptionPaymentsPagination = (state: RootState) =>
  state.subscriptionPayment.pagination;
export const selectSubscriptionPaymentState = (state: RootState) => ({
  loading: state.subscriptionPayment.loading,
  actionLoading: state.subscriptionPayment.actionLoading,
  error: state.subscriptionPayment.error,
  success: state.subscriptionPayment.success,
});

export default subscriptionPaymentSlice;