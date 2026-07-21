import { createSlice } from "@reduxjs/toolkit";
import { InvoiceWithSubscription } from "../../models/historyPayment";
import { ApiError } from "../../models/store";
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
  loading: boolean;
  actionLoading: boolean;
  error: ApiError | null;
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Liste des factures d'une organisation ─────────────────────
      .addCase(fetchOrganizationInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = Array.isArray(action.payload.data)
          ? action.payload.data
          : (action.payload.data?.invoices ?? []);
        console.log("Factures chargées :", state.invoices); // ← Pour debug
      })
      .addCase(fetchOrganizationInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      // ── Détail ───────────────────────────────────────────
      .addCase(getInvoiceById.fulfilled, (state, action) => {
        const invoice = action.payload.data;
        if (!invoice) return;
        state.currentInvoice = invoice;
        const idx = state.invoices.findIndex((i) => i.id === invoice.id);
        if (idx >= 0) state.invoices[idx] = invoice;
      })

      // ── Création ─────────────────────────────────────────
      .addCase(createInvoice.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload.data) state.invoices.unshift(action.payload.data);
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      })

      // ── Mise à jour du statut ──────────────────────────────
      .addCase(updateInvoiceStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const invoice = action.payload.data;
        if (!invoice) return;
        const idx = state.invoices.findIndex((i) => i.id === invoice.id);
        if (idx >= 0)
          state.invoices[idx] = { ...state.invoices[idx], ...invoice };
      })
      .addCase(updateInvoiceStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      })

      // ── Suppression ──────────────────────────────────────
      .addCase(deleteInvoice.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.actionLoading = false;
        const id = action.meta.arg.id;
        state.invoices = state.invoices.filter((i) => i.id !== id);
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const { clearInvoiceError } = invoiceSlice.actions;

export const selectInvoices = (state: RootState) => state.invoice.invoices;
export const selectCurrentInvoice = (state: RootState) =>
  state.invoice.currentInvoice;
export const selectInvoiceState = (state: RootState) => ({
  loading: state.invoice.loading,
  actionLoading: state.invoice.actionLoading,
  error: state.invoice.error,
});

export default invoiceSlice;
