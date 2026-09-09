/* eslint-disable @typescript-eslint/no-explicit-any */
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
  success: boolean;
}

const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  pagination: null,
  loading: false,
  actionLoading: false,
  error: null,
  success: false,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearPaymentSuccess: (state) => {
      state.success = false;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    resetPaymentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
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

      .addCase(getPaymentById.fulfilled, (state, action) => {
        const payment = action.payload.data;
        if (!payment) return;
        state.currentPayment = payment;
        const idx = state.payments.findIndex((p) => p.id === payment.id);
        if (idx >= 0) state.payments[idx] = payment;
        else state.payments.unshift(payment);
      })

      .addCase(createPayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        if (action.payload.data) {
          state.payments.unshift(action.payload.data as PaymentWithRelations);
        }
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? null;
      })

      .addCase(updatePayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
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
      .addCase(updatePayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? null;
      })

      .addCase(deletePayment.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const id = action.meta.arg.id;
        state.payments = state.payments.filter((p) => p.id !== id);
        if (state.currentPayment?.id === id) state.currentPayment = null;
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const {
  clearPaymentError,
  clearPaymentSuccess,
  clearCurrentPayment,
  resetPaymentState,
} = paymentSlice.actions;

export const selectPayments = (state: RootState) => state.payment.payments.map((p) => p);
export const selectCurrentPayment = (state: RootState) =>
  state.payment.currentPayment;
export const selectPaymentsPagination = (state: RootState) =>
  state.payment.pagination;
export const selectPaymentState = (state: RootState) => ({
  loading: state.payment.loading,
  actionLoading: state.payment.actionLoading,
  error: state.payment.error,
  success: state.payment.success,
});

export default paymentSlice;