/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { InvoiceWithSubscription } from "../../models/historyPayment";
import { ApiError, Pagination } from "../../models/store";
import { RootState } from "..";
import {
  fetchOrganizationInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} from "./historyAction";

interface InvoiceState {
  invoices: InvoiceWithSubscription[];
  currentInvoice: InvoiceWithSubscription | null;
  pagination: Pagination | null;
  loading: boolean;
  actionLoading: boolean;
  error: ApiError | null;
  success: boolean;
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  pagination: null,
  loading: false,
  actionLoading: false,
  error: null,
  success: false,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    },
    clearInvoiceSuccess: (state) => {
      state.success = false;
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    resetInvoiceState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ── Liste ────────────────────────────────────────────
      .addCase(fetchOrganizationInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationInvoices.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data as any;

        state.invoices = Array.isArray(data)
          ? data
          : (data?.invoices ?? []);

        state.pagination = Array.isArray(data)
          ? null
          : (data?.pagination ?? null);
      })
      .addCase(fetchOrganizationInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // ── Détail ───────────────────────────────────────────
      .addCase(getInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        const invoice = action.payload.data;
        if (!invoice) return;
        state.currentInvoice = invoice;
        const idx = state.invoices.findIndex((i) => i.id === invoice.id);
        if (idx >= 0) state.invoices[idx] = invoice;
        else state.invoices.unshift(invoice);
      })
      .addCase(getInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // ── Création ─────────────────────────────────────────
      .addCase(createInvoice.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        if (action.payload.data) {
          state.invoices.unshift(action.payload.data);
        }
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? null;
      })

      // ── Update status ────────────────────────────────────
      .addCase(updateInvoiceStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const invoice = action.payload.data;
        if (!invoice) return;

        const idx = state.invoices.findIndex((i) => i.id === invoice.id);
        if (idx >= 0) {
          state.invoices[idx] = { ...state.invoices[idx], ...invoice };
        }
        if (state.currentInvoice?.id === invoice.id) {
          state.currentInvoice = { ...state.currentInvoice, ...invoice };
        }
      })
      .addCase(updateInvoiceStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? null;
      })

      // ── Suppression ──────────────────────────────────────
      .addCase(deleteInvoice.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const id = action.meta.arg.id;
        state.invoices = state.invoices.filter((i) => i.id !== id);
        if (state.currentInvoice?.id === id) {
          state.currentInvoice = null;
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const {
  clearInvoiceError,
  clearInvoiceSuccess,
  clearCurrentInvoice,
  resetInvoiceState,
} = invoiceSlice.actions;

export const selectInvoices = (state: RootState) => state.invoice.invoices.map((i) => i);
export const selectCurrentInvoice = (state: RootState) =>
  state.invoice.currentInvoice;
export const selectInvoicesPagination = (state: RootState) =>
  state.invoice.pagination;
export const selectInvoiceState = (state: RootState) => ({
  loading: state.invoice.loading,
  actionLoading: state.invoice.actionLoading,
  error: state.invoice.error,
  success: state.invoice.success,
});

export default invoiceSlice;