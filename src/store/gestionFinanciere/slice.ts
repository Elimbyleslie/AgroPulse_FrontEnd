/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice } from "@reduxjs/toolkit";
import { LoadingType, AsyncState } from "../../models/store";
import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getSaleItemsBySaleId,
  createSaleItem,
  updateSaleItem,
  deleteSaleItem,
} from "./action";
import { Expense, Sale, SaleItem } from "../../models/gestionFinanciere";
import { RootState } from "..";

// ─────────────────────────────────────────────
//  STATE INTERFACE
// ─────────────────────────────────────────────

export interface FinanceState {
  // Expenses
  expenseList: AsyncState<Expense[] | null>;
  selectedExpense: AsyncState<Expense | null>;
  createExpense: AsyncState<Expense | null>;
  updateExpense: AsyncState<Expense | null>;
  deleteExpense: AsyncState<null>;

  // Sales
  saleList: AsyncState<Sale[] | null>;
  selectedSale: AsyncState<Sale | null>;
  createSale: AsyncState<Sale | null>;
  updateSale: AsyncState<Sale | null>;
  deleteSale: AsyncState<null>;

  // Sale Items
  saleItemList: AsyncState<SaleItem[] | null>;
  createSaleItem: AsyncState<SaleItem | null>;
  updateSaleItem: AsyncState<SaleItem | null>;
  deleteSaleItem: AsyncState<null>;
}

// ─────────────────────────────────────────────
//  INITIAL STATE
// ─────────────────────────────────────────────

const idle = () => ({ entities: null, status: LoadingType.IDLE, error: null });

const initialState: FinanceState = {
  expenseList: idle(),
  selectedExpense: idle(),
  createExpense: idle(),
  updateExpense: idle(),
  deleteExpense: idle(),

  saleList: idle(),
  selectedSale: idle(),
  createSale: idle(),
  updateSale: idle(),
  deleteSale: idle(),

  saleItemList: idle(),
  createSaleItem: idle(),
  updateSaleItem: idle(),
  deleteSaleItem: idle(),
};

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

type SliceKey = keyof FinanceState;

function setPending(state: FinanceState, key: SliceKey) {
  (state[key] as AsyncState<unknown>).status = LoadingType.PENDING;
  (state[key] as AsyncState<unknown>).error = null;
}

function setSuccess<T>(state: FinanceState, key: SliceKey, data: T) {
  (state[key] as AsyncState<T>).status = LoadingType.SUCCESS;
  (state[key] as AsyncState<T>).error = null;
  (state[key] as AsyncState<T>).entities = data;
}

function setRejected(state: FinanceState, key: SliceKey, payload: unknown) {
  (state[key] as AsyncState<unknown>).status = LoadingType.REJECTED;
  (state[key] as AsyncState<unknown>).error =
    typeof payload === "string" ? payload : JSON.stringify(payload);
}

// ─────────────────────────────────────────────
//  SLICE
// ─────────────────────────────────────────────

export const FinanceSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    resetExpenseStatus: (state) => {
      state.selectedExpense.status = LoadingType.IDLE;
      state.selectedExpense.error = null;
    },
    resetSaleStatus: (state) => {
      state.selectedSale.status = LoadingType.IDLE;
      state.selectedSale.error = null;
    },
    resetCreateSaleStatus: (state) => {
      state.createSale.status = LoadingType.IDLE;
      state.createSale.error = null;
    },
    resetCreateExpenseStatus: (state) => {
      state.createExpense.status = LoadingType.IDLE;
      state.createExpense.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── getAllExpenses ──
    builder
      .addCase(getAllExpenses.pending, (state) =>
        setPending(state, "expenseList"),
      )
      .addCase(getAllExpenses.fulfilled, (state, { payload }) => {
        state.expenseList.status = LoadingType.SUCCESS;
        state.expenseList.error = null;
        state.expenseList.entities = payload.data.expenses;
        state.expenseList.pagination = payload.data.pagination;
      })
      .addCase(getAllExpenses.rejected, (state, { payload }) =>
        setRejected(state, "expenseList", payload),
      );

    // ── getExpenseById ──
    builder
      .addCase(getExpenseById.pending, (state) =>
        setPending(state, "selectedExpense"),
      )
      .addCase(getExpenseById.fulfilled, (state, { payload }) =>
        setSuccess(state, "selectedExpense", payload.data),
      )
      .addCase(getExpenseById.rejected, (state, { payload }) =>
        setRejected(state, "selectedExpense", payload),
      );

    // ── createExpense ──
    builder
      .addCase(createExpense.pending, (state) =>
        setPending(state, "createExpense"),
      )
      .addCase(createExpense.fulfilled, (state, { payload }) =>
        setSuccess(state, "createExpense", payload.data),
      )
      .addCase(createExpense.rejected, (state, { payload }) =>
        setRejected(state, "createExpense", payload),
      );

    // ── updateExpense ──
    builder
      .addCase(updateExpense.pending, (state) =>
        setPending(state, "updateExpense"),
      )
      .addCase(updateExpense.fulfilled, (state, { payload }) =>
        setSuccess(state, "updateExpense", payload.data),
      )
      .addCase(updateExpense.rejected, (state, { payload }) =>
        setRejected(state, "updateExpense", payload),
      );

    // ── deleteExpense ──
    builder
      .addCase(deleteExpense.pending, (state) =>
        setPending(state, "deleteExpense"),
      )
      .addCase(deleteExpense.fulfilled, (state, { payload }) =>
        setSuccess(state, "deleteExpense", payload.data),
      )
      .addCase(deleteExpense.rejected, (state, { payload }) =>
        setRejected(state, "deleteExpense", payload),
      );

    // ── getAllSales ──
    builder
      .addCase(getAllSales.pending, (state) => setPending(state, "saleList"))
     .addCase(getAllSales.fulfilled, (state, { payload }) => {
  state.saleList.status = LoadingType.SUCCESS;
  state.saleList.error = null;
  const sales = payload.data.sales;
  state.saleList.entities = sales;
  state.saleList.pagination = payload.data.pagination;

  const allItems: SaleItem[] = sales.flatMap((s: any) => s.saleItems ?? []);
  state.saleItemList.entities = allItems;
  state.saleItemList.status = LoadingType.SUCCESS;
})
      .addCase(getAllSales.rejected, (state, { payload }) =>
        setRejected(state, "saleList", payload),
      );

    // ── getSaleById ──
    builder
      .addCase(getSaleById.pending, (state) =>
        setPending(state, "selectedSale"),
      )
      .addCase(getSaleById.fulfilled, (state, { payload }) =>
        setSuccess(state, "selectedSale", payload.data),
      )
      .addCase(getSaleById.rejected, (state, { payload }) =>
        setRejected(state, "selectedSale", payload),
      );

    // ── createSale ──
    builder
      .addCase(createSale.pending, (state) => setPending(state, "createSale"))
      .addCase(createSale.fulfilled, (state, { payload }) =>
        setSuccess(state, "createSale", payload.data),
      )
      .addCase(createSale.rejected, (state, { payload }) =>
        setRejected(state, "createSale", payload),
      );

    // ── updateSale ──
    builder
      .addCase(updateSale.pending, (state) => setPending(state, "updateSale"))
      .addCase(updateSale.fulfilled, (state, { payload }) =>
        setSuccess(state, "updateSale", payload.data),
      )
      .addCase(updateSale.rejected, (state, { payload }) =>
        setRejected(state, "updateSale", payload),
      );

    // ── deleteSale ──
    builder
      .addCase(deleteSale.pending, (state) => setPending(state, "deleteSale"))
      .addCase(deleteSale.fulfilled, (state, { payload }) =>
        setSuccess(state, "deleteSale", payload.data),
      )
      .addCase(deleteSale.rejected, (state, { payload }) =>
        setRejected(state, "deleteSale", payload),
      );

    // ── getSaleItemsBySaleId ──
    builder

      .addCase(getSaleItemsBySaleId.pending, (state) =>
        setPending(state, "saleItemList"),
      )
      .addCase(getSaleItemsBySaleId.fulfilled, (state, { payload }) => {
        const raw = (payload as any).data;
        const items: SaleItem[] = Array.isArray(raw)
          ? raw
          : raw && typeof raw === "object"
            ? [raw]
            : [];
        setSuccess(state, "saleItemList", items);
      })

      .addCase(getSaleItemsBySaleId.rejected, (state, { payload }) =>
        setRejected(state, "saleItemList", payload),
      );

    // ── createSaleItem ──
    builder
      .addCase(createSaleItem.pending, (state) =>
        setPending(state, "createSaleItem"),
      )
      .addCase(createSaleItem.fulfilled, (state, { payload }) =>
        setSuccess(state, "createSaleItem", payload.data),
      )
      .addCase(createSaleItem.rejected, (state, { payload }) =>
        setRejected(state, "createSaleItem", payload),
      );

    // ── updateSaleItem ──
    builder
      .addCase(updateSaleItem.pending, (state) =>
        setPending(state, "updateSaleItem"),
      )
      .addCase(updateSaleItem.fulfilled, (state, { payload }) =>
        setSuccess(state, "updateSaleItem", payload.data),
      )
      .addCase(updateSaleItem.rejected, (state, { payload }) =>
        setRejected(state, "updateSaleItem", payload),
      );

    // ── deleteSaleItem ──
    builder
      .addCase(deleteSaleItem.pending, (state) =>
        setPending(state, "deleteSaleItem"),
      )
      .addCase(deleteSaleItem.fulfilled, (state, { payload }) =>
        setSuccess(state, "deleteSaleItem", payload.data),
      )
      .addCase(deleteSaleItem.rejected, (state, { payload }) =>
        setRejected(state, "deleteSaleItem", payload),
      );
  },
});

export const {
  resetExpenseStatus,
  resetSaleStatus,
  resetCreateSaleStatus,
  resetCreateExpenseStatus,
} = FinanceSlice.actions;

// ─────────────────────────────────────────────
//  SELECTORS
// ─────────────────────────────────────────────

export const selectExpenseList = (state: RootState) =>
  state.finance.expenseList;
export const selectSelectedExpense = (state: RootState) =>
  state.finance.selectedExpense;
export const selectCreateExpense = (state: RootState) =>
  state.finance.createExpense;
export const selectUpdateExpense = (state: RootState) =>
  state.finance.updateExpense;
export const selectDeleteExpense = (state: RootState) =>
  state.finance.deleteExpense;

export const selectSaleList = (state: RootState) => state.finance.saleList;
export const selectSelectedSale = (state: RootState) =>
  state.finance.selectedSale;
export const selectCreateSale = (state: RootState) => state.finance.createSale;
export const selectUpdateSale = (state: RootState) => state.finance.updateSale;
export const selectDeleteSale = (state: RootState) => state.finance.deleteSale;

export const selectSaleItemList = (state: RootState) =>
  state.finance.saleItemList;
export const selectCreateSaleItem = (state: RootState) =>
  state.finance.createSaleItem;
export const selectUpdateSaleItem = (state: RootState) =>
  state.finance.updateSaleItem;
export const selectDeleteSaleItem = (state: RootState) =>
  state.finance.deleteSaleItem;

export default FinanceSlice;
