/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { ApiError } from "../../models/store";
import { Audit } from "../../models/activityLog";
import { RootState } from "..";
import {
  fetchAudits,
  getAuditById,
  searchAudits,
  getAuditStats,
  getRecentActivities,
  exportAudits,
} from "./auditAction";

interface Pagination {
  currentPage: number;
  previousPage?: number | null;
  nextPage?: number | null;
  totalItems: number;
  totalPage: number;
}

interface DomainState {
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

interface AuditState {
  audits: Audit[];
  currentAudit: Audit | null;
  recentActivities: Audit[];
  stats: any | null;
  searchResults: Audit[];
  searchTerm: string | null;
  pagination: Pagination | null;
  state: DomainState;
  exportLoading: boolean;
}

const domainInit = (): DomainState => ({
  loading: false,
  error: null,
  success: false,
});

const initialState: AuditState = {
  audits: [],
  currentAudit: null,
  recentActivities: [],
  stats: null,
  searchResults: [],
  searchTerm: null,
  pagination: null,
  state: domainInit(),
  exportLoading: false,
};

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    resetAuditState(state) {
      state.state = domainInit();
    },
    clearCurrentAudit(state) {
      state.currentAudit = null;
    },
    clearSearchResults(state) {
      state.searchResults = [];
      state.searchTerm = null;
    },
  },
  extraReducers: (builder) => {
    // LIST
    builder
      .addCase(fetchAudits.pending, (state) => {
        state.state.loading = true;
        state.state.error = null;
      })
      .addCase(fetchAudits.fulfilled, (state, action) => {
        state.state.loading = false;
        const payload = action.payload.data as any;
        state.audits = payload?.audits ?? payload?.items ?? [];
        state.pagination = payload?.pagination ?? null;
      })
      .addCase(fetchAudits.rejected, (state, action) => {
        state.state.loading = false;
        state.state.error = action.payload ?? null;
      });

    // GET BY ID
    builder
      .addCase(getAuditById.pending, (state) => {
        state.state.loading = true;
        state.currentAudit = null;
      })
      .addCase(getAuditById.fulfilled, (state, action) => {
        state.state.loading = false;
        state.currentAudit = action.payload.data as Audit;
      })
      .addCase(getAuditById.rejected, (state, action) => {
        state.state.loading = false;
        state.state.error = action.payload ?? null;
      });

    // SEARCH
    builder
      .addCase(searchAudits.pending, (state) => {
        state.state.loading = true;
      })
      .addCase(searchAudits.fulfilled, (state, action) => {
        state.state.loading = false;
        const payload = action.payload.data as any;
        state.searchResults = payload?.audits ?? [];
        state.searchTerm = payload?.searchTerm ?? null;
        state.pagination = payload?.pagination ?? null;
      })
      .addCase(searchAudits.rejected, (state, action) => {
        state.state.loading = false;
        state.state.error = action.payload ?? null;
      });

    // STATS
    builder
      .addCase(getAuditStats.pending, (state) => {
        state.state.loading = true;
      })
      .addCase(getAuditStats.fulfilled, (state, action) => {
        state.state.loading = false;
        state.stats = action.payload.data ?? null;
      })
      .addCase(getAuditStats.rejected, (state, action) => {
        state.state.loading = false;
        state.state.error = action.payload ?? null;
      });

    // RECENT
    builder
      .addCase(getRecentActivities.pending, (state) => {
        state.state.loading = true;
      })
      .addCase(getRecentActivities.fulfilled, (state, action) => {
        state.state.loading = false;
        const payload = action.payload.data as any;
        state.recentActivities = payload?.activities ?? [];
      })
      .addCase(getRecentActivities.rejected, (state, action) => {
        state.state.loading = false;
        state.state.error = action.payload ?? null;
      });

    // EXPORT
    builder
      .addCase(exportAudits.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportAudits.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportAudits.rejected, (state, action) => {
        state.exportLoading = false;
        state.state.error = action.payload ?? null;
      });
  },
});

export const {
  resetAuditState,
  clearCurrentAudit,
  clearSearchResults,
} = auditSlice.actions;

export const selectAudits = (s: RootState) => s.audit.audits;
export const selectCurrentAudit = (s: RootState) => s.audit.currentAudit;
export const selectRecentActivities = (s: RootState) => s.audit.recentActivities;
export const selectAuditStats = (s: RootState) => s.audit.stats;
export const selectSearchResults = (s: RootState) => s.audit.searchResults;
export const selectAuditState = (s: RootState) => s.audit.state;
export const selectAuditPagination = (s: RootState) => s.audit.pagination;
export const selectExportLoading = (s: RootState) => s.audit.exportLoading;

export default auditSlice;