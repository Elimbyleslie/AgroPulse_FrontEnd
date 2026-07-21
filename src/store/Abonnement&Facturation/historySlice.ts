import { createSlice } from "@reduxjs/toolkit";
import { PaymentWithRelations } from "../../models/historyPayment";
import { ApiError, Pagination } from "../../models/store";
import { RootState } from "..";
import {
  fetchPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "./historyAction";

interface PaymentState {
  payments: PaymentWithRelations[];
  currentPayment: PaymentWithRelations | null;
  pagination: Pagination | null;
  loading: boolean;
  actionLoading: boolean;
  error: ApiError | null;
}

const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  pagination: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Liste ────────────────────────────────────────────
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data?.payments ?? [];
        state.pagination = action.payload.data?.pagination ?? null;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // ── Détail ───────────────────────────────────────────
      .addCase(getPaymentById.fulfilled, (state, action) => {
        const payment = action.payload.data;
        if (!payment) return;
        state.currentPayment = payment;
        const idx = state.payments.findIndex((p) => p.id === payment.id);
        if (idx >= 0) state.payments[idx] = payment;
      })

      // ── Création ─────────────────────────────────────────
      .addCase(createPayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload.data) state.payments.unshift(action.payload.data);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      })

      // ── Mise à jour ──────────────────────────────────────
      .addCase(updatePayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const payment = action.payload.data;
        if (!payment) return;
        const idx = state.payments.findIndex((p) => p.id === payment.id);
        if (idx >= 0) state.payments[idx] = { ...state.payments[idx], ...payment };
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      })

      // ── Suppression ──────────────────────────────────────
      .addCase(deletePayment.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const id = action.meta.arg.id;
        state.payments = state.payments.filter((p) => p.id !== id);
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const { clearPaymentError } = paymentSlice.actions;

export const selectPayments = (state: RootState) => state.payment.payments;
export const selectCurrentPayment = (state: RootState) =>
  state.payment.currentPayment;
export const selectPaymentsPagination = (state: RootState) =>
  state.payment.pagination;
export const selectPaymentState = (state: RootState) => ({
  loading: state.payment.loading,
  actionLoading: state.payment.actionLoading,
  error: state.payment.error,
});

export default paymentSlice;