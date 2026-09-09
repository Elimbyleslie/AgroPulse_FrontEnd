/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiResponse, Pagination } from "../../models/store";
import { RootState } from "..";
import { Payment } from "../../models/gestionFinanciere";
import {
  fetchPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "./paymentAction";

interface DomainState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const domainInit = (): DomainState => ({ loading: false, error: null, success: false });

interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  pagination: Pagination | null;
  listState: DomainState;
  currentState: DomainState;
  createState: DomainState;
  updateState: DomainState;
  deleteState: DomainState;
}

const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  pagination: null,
  listState: domainInit(),
  currentState: domainInit(),
  createState: domainInit(),
  updateState: domainInit(),
  deleteState: domainInit(),
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    resetPaymentCreateState: (state) => {
      state.createState = domainInit();
    },
    resetPaymentUpdateState: (state) => {
      state.updateState = domainInit();
    },
    resetPaymentDeleteState: (state) => {
      state.deleteState = domainInit();
    },
  },
  extraReducers: (builder) => {
    // ── LIST ──────────────────────────────────────────────────────────────
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.listState.loading = true;
        state.listState.error = null;
      })
      .addCase(
        fetchPayments.fulfilled,
        (state, action: PayloadAction<ApiResponse<any>>) => {
          state.listState.loading = false;
          const payload = action.payload.data;
          state.payments = payload?.payments ?? [];
          state.pagination = payload?.pagination ?? null;
        },
      )
      .addCase(fetchPayments.rejected, (state, action) => {
        state.listState.loading = false;
        state.listState.error =
          (action.payload as unknown as string) || "Erreur lors du chargement des paiements";
      });

    // ── GET BY ID ─────────────────────────────────────────────────────────
    builder
      .addCase(getPaymentById.pending, (state) => {
        state.currentState.loading = true;
        state.currentState.error = null;
      })
      .addCase(
        getPaymentById.fulfilled,
        (state, action: PayloadAction<ApiResponse<Payment>>) => {
          state.currentState.loading = false;
          state.currentPayment = action.payload.data || null;
        },
      )
      .addCase(getPaymentById.rejected, (state, action) => {
        state.currentState.loading = false;
        state.currentState.error =
          (action.payload as unknown as string) || "Paiement introuvable";
      });

    // ── CREATE ────────────────────────────────────────────────────────────
    builder
      .addCase(createPayment.pending, (state) => {
        state.createState = { loading: true, error: null, success: false };
      })
      .addCase(
        createPayment.fulfilled,
        (state, action: PayloadAction<ApiResponse<Payment>>) => {
          state.createState.loading = false;
          state.createState.success = true;
          if (action.payload.data) state.payments.unshift(action.payload.data);
        },
      )
      .addCase(createPayment.rejected, (state, action) => {
        state.createState.loading = false;
        state.createState.error =
          (action.payload as unknown as string) || "Erreur lors de la création du paiement";
        state.createState.success = false;
      });

    // ── UPDATE ────────────────────────────────────────────────────────────
    builder
      .addCase(updatePayment.pending, (state) => {
        state.updateState = { loading: true, error: null, success: false };
      })
      .addCase(
        updatePayment.fulfilled,
        (state, action: PayloadAction<ApiResponse<Payment>>) => {
          state.updateState.loading = false;
          state.updateState.success = true;
          const updated = action.payload.data;
          if (updated) {
            state.payments = state.payments.map((p) => (p.id === updated.id ? updated : p));
            if (state.currentPayment?.id === updated.id) state.currentPayment = updated;
          }
        },
      )
      .addCase(updatePayment.rejected, (state, action) => {
        state.updateState.loading = false;
        state.updateState.error =
          (action.payload as unknown as string) || "Erreur lors de la mise à jour du paiement";
        state.updateState.success = false;
      });

    // ── DELETE ────────────────────────────────────────────────────────────
    builder
      .addCase(deletePayment.pending, (state) => {
        state.deleteState = { loading: true, error: null, success: false };
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.deleteState.loading = false;
        state.deleteState.success = true;
        const deletedId = action.meta.arg.id;
        state.payments = state.payments.filter((p) => p.id !== deletedId);
        if (state.currentPayment?.id === deletedId) state.currentPayment = null;
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.deleteState.loading = false;
        state.deleteState.error =
          (action.payload as unknown as string) || "Erreur lors de la suppression du paiement";
        state.deleteState.success = false;
      });
  },
});

export const {
  clearCurrentPayment,
  resetPaymentCreateState,
  resetPaymentUpdateState,
  resetPaymentDeleteState,
} = paymentSlice.actions;

export const selectPayments = (s: RootState) => s.payment.payments;
export const selectPaymentsPagination = (s: RootState) => s.payment.pagination;
export const selectPaymentsListState = (s: RootState) => s.payment;
export const selectCurrentPayment = (s: RootState) => s.payment.currentPayment;
export const selectPaymentCreateState = (s: RootState) => s.payment.payments.map((p) => p);
export const selectPaymentUpdateState = (s: RootState) => s.payment.payments.map((p) => p);
export const selectPaymentDeleteState = (s: RootState) => s.payment.payments.map((p) => p);

export default paymentSlice;