/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { ApiError } from "../../models/store";
import { ActivityLog } from "../../models/activityLog";
import { RootState } from "..";
import {
  fetchActivityLogs,
  getActivityLogById,
  createActivityLog,
  updateActivityLog,
  deleteActivityLog,
} from "./logAction";

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

interface ActivityLogState {
  logs: ActivityLog[];
  currentLog: ActivityLog | null;
  pagination: Pagination | null;
  state: DomainState;
}

const domainInit = (): DomainState => ({
  loading: false,
  error: null,
  success: false,
});

const initialState: ActivityLogState = {
  logs: [],
  currentLog: null,
  pagination: null,
  state: domainInit(),
};

const activityLogSlice = createSlice({
  name: "activityLog",
  initialState,
  reducers: {
    resetActivityLogState(state) {
      state.state = domainInit();
    },
    clearCurrentLog(state) {
      state.currentLog = null;
    },
  },
  extraReducers: (builder) => {
    // LIST
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.state.loading = true;
        state.state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.state.loading = false;
        const payload = action.payload.data as any;
        state.logs = payload?.logs ?? payload?.items ?? payload ?? [];
        state.pagination = payload?.pagination ?? null;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.state.loading = false;
        state.state.error = action.payload ?? null;
      });

    // GET BY ID
    builder
      .addCase(getActivityLogById.pending, (state) => {
        state.state.loading = true;
        state.currentLog = null;
      })
      .addCase(getActivityLogById.fulfilled, (state, action) => {
        state.state.loading = false;
        state.currentLog = action.payload.data as ActivityLog;
      })
      .addCase(getActivityLogById.rejected, (state, action) => {
        state.state.loading = false;
        state.state.error = action.payload ?? null;
      });

    // CREATE
    builder
      .addCase(createActivityLog.pending, (state) => {
        state.state = { loading: true, error: null, success: false };
      })
      .addCase(createActivityLog.fulfilled, (state, action) => {
        state.state.loading = false;
        state.state.success = true;
        const created = action.payload.data as ActivityLog;
        state.logs.unshift(created);
      })
      .addCase(createActivityLog.rejected, (state, action) => {
        state.state.loading = false;
        state.state.error = action.payload ?? null;
      });

    // UPDATE
    builder
      .addCase(updateActivityLog.pending, (state) => {
        state.state = { loading: true, error: null, success: false };
      })
      .addCase(updateActivityLog.fulfilled, (state, action) => {
        state.state.loading = false;
        state.state.success = true;
        const updated = action.payload.data as ActivityLog;
        state.logs = state.logs.map((l) =>
          l.id === updated.id ? updated : l
        );
        if (state.currentLog?.id === updated.id) {
          state.currentLog = updated;
        }
      })
      .addCase(updateActivityLog.rejected, (state, action) => {
        state.state.loading = false;
        state.state.error = action.payload ?? null;
      });

    // DELETE
    builder
      .addCase(deleteActivityLog.pending, (state) => {
        state.state = { loading: true, error: null, success: false };
      })
      .addCase(deleteActivityLog.fulfilled, (state, action) => {
        state.state.loading = false;
        state.state.success = true;
        const deletedId = action.meta.arg.id;
        state.logs = state.logs.filter((l) => l.id !== deletedId);
        if (state.currentLog?.id === deletedId) {
          state.currentLog = null;
        }
      })
      .addCase(deleteActivityLog.rejected, (state, action) => {
        state.state.loading = false;
        state.state.error = action.payload ?? null;
      });
  },
});

export const { resetActivityLogState, clearCurrentLog } = activityLogSlice.actions;

export const selectActivityLogs = (s: RootState) => s.activityLog.logs;
export const selectCurrentActivityLog = (s: RootState) => s.activityLog.currentLog;
export const selectActivityLogState = (s: RootState) => s.activityLog.state;
export const selectActivityLogPagination = (s: RootState) => s.activityLog.pagination;

export default activityLogSlice;