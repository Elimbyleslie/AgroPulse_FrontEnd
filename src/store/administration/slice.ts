/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { ApiError } from "../../models/store";
import { FarmUser, Notification, ActivityLog } from "../../models/administration";
import { RootState } from "..";
import {
  fetchFarmUsers,
  createFarmUser,
  getFarmUserById,
  getFarmUsersByFarmId,
  deleteFarmUser,
  fetchNotifications,
  createNotification,
  getNotificationById,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
  fetchActivityLogs,
  createActivityLog,
  getActivityLogById,
  updateActivityLog,
  deleteActivityLog,
} from "./action";

interface Pagination {
  currentPage: number;
  previousPage?: number | null;
  nextPage?: number | null;
  totalItems: number;
  totalPages: number;
}

interface DomainState {
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

interface AdminState {
  // FarmUser
  farmUsers: FarmUser[];
  currentFarmUser: FarmUser | null;
  farmUsersPagination: Pagination | null;
  farmUsersState: DomainState;

  // Notification
  notifications: Notification[];
  currentNotification: Notification | null;
  unreadCount: number;
  notificationsPagination: Pagination | null;
  notificationsState: DomainState;

  // ActivityLog
  activityLogs: ActivityLog[];
  currentActivityLog: ActivityLog | null;
  activityLogsPagination: Pagination | null;
  activityLogsState: DomainState;
}

const domainInit = (): DomainState => ({
  loading: false,
  error: null,
  success: false,
});

const initialState: AdminState = {
  farmUsers: [],
  currentFarmUser: null,
  farmUsersPagination: null,
  farmUsersState: domainInit(),

  notifications: [],
  currentNotification: null,
  unreadCount: 0,
  notificationsPagination: null,
  notificationsState: domainInit(),

  activityLogs: [],
  currentActivityLog: null,
  activityLogsPagination: null,
  activityLogsState: domainInit(),
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    resetFarmUsersState(state) {
      state.farmUsersState = domainInit();
    },
    resetNotificationsState(state) {
      state.notificationsState = domainInit();
    },
    resetActivityLogsState(state) {
      state.activityLogsState = domainInit();
    },
    clearCurrentFarmUser(state) {
      state.currentFarmUser = null;
    },
    clearCurrentNotification(state) {
      state.currentNotification = null;
    },
    clearCurrentActivityLog(state) {
      state.currentActivityLog = null;
    },
  },
  extraReducers: (builder) => {
    // ── FARM USERS ─────────────────────────────────────────────────────────
    builder
      .addCase(fetchFarmUsers.pending, (state) => {
        state.farmUsersState.loading = true;
        state.farmUsersState.error = null;
      })
      .addCase(fetchFarmUsers.fulfilled, (state, action) => {
        state.farmUsersState.loading = false;
        const payload = action.payload.data as any;
        state.farmUsers = payload?.items ?? payload ?? [];
        state.farmUsersPagination = payload?.pagination ?? null;
      })
      .addCase(fetchFarmUsers.rejected, (state, action) => {
        state.farmUsersState.loading = false;
        state.farmUsersState.error = action.payload ?? null;
      });

    builder
      .addCase(createFarmUser.pending, (state) => {
        state.farmUsersState = { loading: true, error: null, success: false };
      })
      .addCase(createFarmUser.fulfilled, (state, action) => {
        state.farmUsersState.loading = false;
        state.farmUsersState.success = true;
        state.farmUsers.unshift(action.payload.data as FarmUser);
      })
      .addCase(createFarmUser.rejected, (state, action) => {
        state.farmUsersState.loading = false;
        state.farmUsersState.error = action.payload ?? null;
      });

    builder
      .addCase(getFarmUserById.pending, (state) => {
        state.farmUsersState.loading = true;
        state.currentFarmUser = null;
      })
      .addCase(getFarmUserById.fulfilled, (state, action) => {
        state.farmUsersState.loading = false;
        state.currentFarmUser = action.payload.data as FarmUser;
      })
      .addCase(getFarmUserById.rejected, (state, action) => {
        state.farmUsersState.loading = false;
        state.farmUsersState.error = action.payload ?? null;
      });

    builder
      .addCase(getFarmUsersByFarmId.fulfilled, (state, action) => {
        state.farmUsersState.loading = false;
        const payload = action.payload.data as any;
        state.farmUsers = Array.isArray(payload) ? payload : payload ?? [];
      });

    builder
      .addCase(deleteFarmUser.pending, (state) => {
        state.farmUsersState = { loading: true, error: null, success: false };
      })
      .addCase(deleteFarmUser.fulfilled, (state, action) => {
        state.farmUsersState.loading = false;
        state.farmUsersState.success = true;
        const deletedId = action.meta.arg.id;
        state.farmUsers = state.farmUsers.filter((f) => f.id !== deletedId);
        if (state.currentFarmUser?.id === deletedId) {
          state.currentFarmUser = null;
        }
      })
      .addCase(deleteFarmUser.rejected, (state, action) => {
        state.farmUsersState.loading = false;
        state.farmUsersState.error = action.payload ?? null;
      });

    // ── NOTIFICATIONS ──────────────────────────────────────────────────────
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsState.loading = true;
        state.notificationsState.error = null;
      })
      //recuperer toutes les notifications sans bug 
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsState.loading = false;
        const payload = action.payload.data as any;
        state.notifications = payload?.notifications ?? [];
         state.unreadCount = payload?.unreadCount ?? 0;
        state.notificationsPagination = payload?.pagination ?? null;
      })
     
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsState.loading = false;
        state.notificationsState.error = action.payload ?? null;
      });

    builder
      .addCase(createNotification.pending, (state) => {
        state.notificationsState = {
          loading: true,
          error: null,
          success: false,
        };
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notificationsState.loading = false;
        state.notificationsState.success = true;
        state.notifications.unshift(action.payload.data as Notification);
        state.unreadCount += 1;
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.notificationsState.loading = false;
        state.notificationsState.error = action.payload ?? null;
      });

    builder
      .addCase(getNotificationById.fulfilled, (state, action) => {
        state.notificationsState.loading = false;
        state.currentNotification = action.payload.data as Notification;
      });

    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const updated = action.payload.data as Notification;
        const wasUnread = state.notifications.find(
          (n) => n.id === updated.id && !n.read,
        );
        state.notifications = state.notifications.map((n) =>
          n.id === updated.id ? { ...n, read: true } : n,
        );
        if (wasUnread) state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markNotificationAsUnread.fulfilled, (state, action) => {
        const updated = action.payload.data as Notification;
        const wasRead = state.notifications.find(
          (n) => n.id === updated.id && n.read,
        );
        state.notifications = state.notifications.map((n) =>
          n.id === updated.id ? { ...n, read: false } : n,
        );
        if (wasRead) state.unreadCount += 1;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        const payload = action.payload.data as any;
        state.unreadCount = payload?.count ?? 0;
      });

    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notificationsState.success = true;
        const deletedId = action.meta.arg.id;
        const wasUnread = state.notifications.find(
          (n) => n.id === deletedId && !n.read,
        );
        state.notifications = state.notifications.filter(
          (n) => n.id !== deletedId,
        );
        if (wasUnread) state.unreadCount = Math.max(0, state.unreadCount - 1);
      });

    // ── ACTIVITY LOGS ──────────────────────────────────────────────────────
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.activityLogsState.loading = true;
        state.activityLogsState.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.activityLogsState.loading = false;
        const payload = action.payload.data as any;
        state.activityLogs = payload?.items ?? payload ?? [];
        state.activityLogsPagination = payload?.pagination ?? null;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.activityLogsState.loading = false;
        state.activityLogsState.error = action.payload ?? null;
      });

    builder
      .addCase(createActivityLog.pending, (state) => {
        state.activityLogsState = {
          loading: true,
          error: null,
          success: false,
        };
      })
      .addCase(createActivityLog.fulfilled, (state, action) => {
        state.activityLogsState.loading = false;
        state.activityLogsState.success = true;
        state.activityLogs.unshift(action.payload.data as ActivityLog);
      })
      .addCase(createActivityLog.rejected, (state, action) => {
        state.activityLogsState.loading = false;
        state.activityLogsState.error = action.payload ?? null;
      });

    builder
      .addCase(getActivityLogById.fulfilled, (state, action) => {
        state.activityLogsState.loading = false;
        state.currentActivityLog = action.payload.data as ActivityLog;
      })
      .addCase(updateActivityLog.fulfilled, (state, action) => {
        state.activityLogsState.success = true;
        const updated = action.payload.data as ActivityLog;
        state.activityLogs = state.activityLogs.map((l) =>
          l.id === updated.id ? updated : l,
        );
        if (state.currentActivityLog?.id === updated.id) {
          state.currentActivityLog = updated;
        }
      });

    builder
      .addCase(deleteActivityLog.fulfilled, (state, action) => {
        state.activityLogsState.success = true;
        const deletedId = action.meta.arg.id;
        state.activityLogs = state.activityLogs.filter(
          (l) => l.id !== deletedId,
        );
        if (state.currentActivityLog?.id === deletedId) {
          state.currentActivityLog = null;
        }
      });
  },
});

export const {
  resetFarmUsersState,
  resetNotificationsState,
  resetActivityLogsState,
  clearCurrentFarmUser,
  clearCurrentNotification,
  clearCurrentActivityLog,
} = adminSlice.actions;

// Selectors FarmUser
export const selectFarmUsers = (s: RootState) => s.admin.farmUsers;
export const selectCurrentFarmUser = (s: RootState) => s.admin.currentFarmUser;
export const selectFarmUsersState = (s: RootState) => s.admin.farmUsersState;
export const selectFarmUsersPagination = (s: RootState) =>
  s.admin.farmUsersPagination;

// Selectors Notification
export const selectNotifications = (s: RootState) => s.admin.notifications;
export const selectCurrentNotification = (s: RootState) =>
  s.admin.currentNotification;
export const selectUnreadCount = (s: RootState) => s.admin.unreadCount;
export const selectNotificationsState = (s: RootState) =>
  s.admin.notificationsState;
export const selectNotificationsPagination = (s: RootState) =>
  s.admin.notificationsPagination;

// Selectors ActivityLog
export const selectActivityLogs = (s: RootState) => s.admin.activityLogs;
export const selectCurrentActivityLog = (s: RootState) =>
  s.admin.currentActivityLog;
export const selectActivityLogsState = (s: RootState) =>
  s.admin.activityLogsState;
export const selectActivityLogsPagination = (s: RootState) =>
  s.admin.activityLogsPagination;

export default adminSlice;