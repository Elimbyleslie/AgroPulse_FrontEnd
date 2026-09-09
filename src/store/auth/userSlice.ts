/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { ApiError } from "../../models/store";
import { User } from "../../models/user";
import { RootState } from "..";
import {
  fetchUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
} from "./userAction";

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

interface UserAdminState {
  users: User[];
  currentUser: User | null;
  profile: User | null;
  userRoles: any[];
  usersPagination: Pagination | null;
  usersState: DomainState;
  profileState: DomainState;
  rolesState: DomainState;
}

const domainInit = (): DomainState => ({
  loading: false,
  error: null,
  success: false,
});

const initialState: UserAdminState = {
  users: [],
  currentUser: null,
  profile: null,
  userRoles: [],
  usersPagination: null,
  usersState: domainInit(),
  profileState: domainInit(),
  rolesState: domainInit(),
};

const userSlice = createSlice({
  name: "userAdmin",
  initialState,
  reducers: {
    resetUsersState(state) {
      state.usersState = domainInit();
    },
    resetProfileState(state) {
      state.profileState = domainInit();
    },
    resetRolesState(state) {
      state.rolesState = domainInit();
    },
    clearCurrentUser(state) {
      state.currentUser = null;
    },
    clearProfile(state) {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    // ── LIST ───────────────────────────────────────────────────────────────
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.usersState.loading = true;
        state.usersState.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        console.log("PAYLOAD REÇU:", action.payload); // 👈

        state.usersState.loading = false;
        const payload = action.payload as unknown as {
          data: User[];
          pagination?: Pagination | null;
        };
        state.users = payload.data ?? [];
        state.usersPagination = payload.pagination ?? null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersState.loading = false;
        state.usersState.error = action.payload ?? null;
      });

    // ── CREATE ─────────────────────────────────────────────────────────────
    builder
      .addCase(createUser.pending, (state) => {
        state.usersState = { loading: true, error: null, success: false };
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.usersState.loading = false;
        state.usersState.success = true;
        state.users.unshift(action.payload.data as User);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.usersState.loading = false;
        state.usersState.error = action.payload ?? null;
      });

    // ── GET BY ID ──────────────────────────────────────────────────────────
    builder
      .addCase(getUserById.pending, (state) => {
        state.usersState.loading = true;
        state.currentUser = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.usersState.loading = false;
        state.currentUser = action.payload.data as User;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.usersState.loading = false;
        state.usersState.error = action.payload ?? null;
      });

    // ── UPDATE ─────────────────────────────────────────────────────────────
    builder
      .addCase(updateUser.pending, (state) => {
        state.usersState = { loading: true, error: null, success: false };
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.usersState.loading = false;
        state.usersState.success = true;
        const updated = action.payload.data as User;
        state.users = state.users.map((u) =>
          u.id === updated.id ? updated : u,
        );
        if (state.currentUser?.id === updated.id) {
          state.currentUser = updated;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.usersState.loading = false;
        state.usersState.error = action.payload ?? null;
      });

    // ── DELETE ─────────────────────────────────────────────────────────────
    builder
      .addCase(deleteUser.pending, (state) => {
        state.usersState = { loading: true, error: null, success: false };
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.usersState.loading = false;
        state.usersState.success = true;
        const deletedId = action.meta.arg.id;
        state.users = state.users.filter((u) => u.id !== deletedId);
        if (state.currentUser?.id === deletedId) {
          state.currentUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.usersState.loading = false;
        state.usersState.error = action.payload ?? null;
      });

    // ── PROFILE ────────────────────────────────────────────────────────────
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.profileState.loading = true;
        state.profileState.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.profileState.loading = false;
        state.profile = action.payload.data as User;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.profileState.loading = false;
        state.profileState.error = action.payload ?? null;
      });

    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.profileState = { loading: true, error: null, success: false };
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileState.loading = false;
        state.profileState.success = true;
        const updated = action.payload.data as User;
        state.profile = updated;
        // sync aussi dans la liste si présent
        state.users = state.users.map((u) =>
          u.id === updated.id ? { ...u, ...updated } : u,
        );
        if (state.currentUser?.id === updated.id) {
          state.currentUser = { ...state.currentUser, ...updated };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profileState.loading = false;
        state.profileState.error = action.payload ?? null;
      });

    // ── ROLES ──────────────────────────────────────────────────────────────
    builder
      .addCase(getUserRoles.pending, (state) => {
        state.rolesState.loading = true;
        state.rolesState.error = null;
      })
      .addCase(getUserRoles.fulfilled, (state, action) => {
        state.rolesState.loading = false;
        const payload = action.payload as any;
        state.userRoles = Array.isArray(payload) ? payload : [];
      })
      .addCase(getUserRoles.rejected, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.error = action.payload ?? null;
      });

    builder
      .addCase(assignRoleToUser.pending, (state) => {
        state.rolesState = { loading: true, error: null, success: false };
      })
      .addCase(assignRoleToUser.fulfilled, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.success = true;
        const newRole = action.payload?.data ?? action.payload?.data;
        if (newRole) state.userRoles.push(newRole);
      })
      .addCase(assignRoleToUser.rejected, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.error = action.payload ?? null;
      });

    builder
      .addCase(removeRoleFromUser.pending, (state) => {
        state.rolesState = { loading: true, error: null, success: false };
      })
      .addCase(removeRoleFromUser.fulfilled, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.success = true;
        const roleId = action.meta.arg.roleId;
        state.userRoles = state.userRoles.filter(
          (r: any) =>
            r.roleId !== roleId && r.role?.id !== roleId && r.id !== roleId,
        );
      })
      .addCase(removeRoleFromUser.rejected, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.error = action.payload ?? null;
      });
  },
});

export const {
  resetUsersState,
  resetProfileState,
  resetRolesState,
  clearCurrentUser,
  clearProfile,
} = userSlice.actions;

// Selectors
export const selectUsers = (s: RootState) => s.userAdmin.users;
export const selectCurrentUserAdmin = (s: RootState) => s.userAdmin.currentUser;
export const selectUserProfile = (s: RootState) => s.userAdmin.profile;
export const selectUserRoles = (s: RootState) => s.userAdmin.userRoles;
export const selectUsersState = (s: RootState) => s.userAdmin.usersState;
export const selectProfileState = (s: RootState) => s.userAdmin.profileState;
export const selectUserRolesState = (s: RootState) => s.userAdmin.rolesState;
export const selectUsersPagination = (s: RootState) =>
  s.userAdmin.usersPagination;

export default userSlice;
