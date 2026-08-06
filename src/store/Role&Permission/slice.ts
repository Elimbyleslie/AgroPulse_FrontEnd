/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { ApiError } from "../../models/store";
import { Role, Permission, UserRole, RolePermission } from "../../models/UserRolePermission";
import { RootState } from "..";
import {
  fetchRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  fetchPermissions,
  createPermission,
  getPermissionById,
  updatePermission,
  deletePermission,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getRoleUsers,
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

interface RbacState {
  // Roles
  roles: Role[];
  currentRole: Role | null;
  rolesPagination: Pagination | null;
  rolesState: DomainState;

  // Permissions
  permissions: Permission[];
  currentPermission: Permission | null;
  permissionsPagination: Pagination | null;
  permissionsState: DomainState;

  // RolePermissions (pour un rôle donné)
  rolePermissions: RolePermission[];
  rolePermissionsState: DomainState;

  // UserRoles
  userRoles: UserRole[];
  roleUsers: UserRole[];
  userRolesState: DomainState;
}

const domainInit = (): DomainState => ({
  loading: false,
  error: null,
  success: false,
});

const initialState: RbacState = {
  roles: [],
  currentRole: null,
  rolesPagination: null,
  rolesState: domainInit(),

  permissions: [],
  currentPermission: null,
  permissionsPagination: null,
  permissionsState: domainInit(),

  rolePermissions: [],
  rolePermissionsState: domainInit(),

  userRoles: [],
  roleUsers: [],
  userRolesState: domainInit(),
};

const rbacSlice = createSlice({
  name: "rbac",
  initialState,
  reducers: {
    resetRolesState(state) {
      state.rolesState = domainInit();
    },
    resetPermissionsState(state) {
      state.permissionsState = domainInit();
    },
    resetUserRolesState(state) {
      state.userRolesState = domainInit();
    },
    clearCurrentRole(state) {
      state.currentRole = null;
    },
    clearCurrentPermission(state) {
      state.currentPermission = null;
    },
  },
  extraReducers: (builder) => {
    // ── ROLES ──────────────────────────────────────────────────────────────
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.rolesState.loading = true;
        state.rolesState.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesState.loading = false;
        const payload = action.payload.data as any;
        state.roles = payload?.roles ?? payload ?? [];
        state.rolesPagination = payload?.pagination ?? null;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.error = action.payload ?? null;
      });

    builder
      .addCase(createRole.pending, (state) => {
        state.rolesState = { loading: true, error: null, success: false };
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.success = true;
        state.roles.unshift(action.payload.data as Role);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.error = action.payload ?? null;
      });

    builder
      .addCase(getRoleById.pending, (state) => {
        state.rolesState.loading = true;
        state.currentRole = null;
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.rolesState.loading = false;
        state.currentRole = action.payload.data as Role;
      })
      .addCase(getRoleById.rejected, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.error = action.payload ?? null;
      });

    builder
      .addCase(updateRole.pending, (state) => {
        state.rolesState = { loading: true, error: null, success: false };
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.success = true;
        const updated = action.payload.data as Role;
        state.roles = state.roles.map((r) => (r.id === updated.id ? updated : r));
        if (state.currentRole?.id === updated.id) state.currentRole = updated;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.error = action.payload ?? null;
      });

    builder
      .addCase(deleteRole.pending, (state) => {
        state.rolesState = { loading: true, error: null, success: false };
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.success = true;

        const deletedId = action.meta.arg.id;
        state.roles = state.roles.filter((r) => r.id !== deletedId);

        if (state.currentRole?.id === deletedId) {
          state.currentRole = null;
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.rolesState.loading = false;
        state.rolesState.error = action.payload ?? null;
      });

    // ── PERMISSIONS ────────────────────────────────────────────────────────
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.permissionsState.loading = true;
        state.permissionsState.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissionsState.loading = false;
        const payload = action.payload.data as any;
        state.permissions = payload?.permissions ?? payload ?? [];
        state.permissionsPagination = payload?.pagination ?? null;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.permissionsState.loading = false;
        state.permissionsState.error = action.payload ?? null;
      });

    builder
      .addCase(createPermission.pending, (state) => {
        state.permissionsState = { loading: true, error: null, success: false };
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.permissionsState.loading = false;
        state.permissionsState.success = true;
        state.permissions.unshift(action.payload.data as Permission);
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.permissionsState.loading = false;
        state.permissionsState.error = action.payload ?? null;
      });

    builder
      .addCase(getPermissionById.fulfilled, (state, action) => {
        state.permissionsState.loading = false;
        state.currentPermission = action.payload.data as Permission;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.permissionsState.loading = false;
        state.permissionsState.success = true;
        const updated = action.payload.data as Permission;
        state.permissions = state.permissions.map((p) =>
          p.id === updated.id ? updated : p,
        );
      })
      .addCase(deletePermission.fulfilled, (state) => {
        state.permissionsState.loading = false;
        state.permissionsState.success = true;
      });

    // ── ROLE PERMISSIONS ───────────────────────────────────────────────────
    builder
      .addCase(getRolePermissions.pending, (state) => {
        state.rolePermissionsState.loading = true;
      })
      .addCase(getRolePermissions.fulfilled, (state, action) => {
        state.rolePermissionsState.loading = false;
        const payload = action.payload.data as any;
        state.rolePermissions = Array.isArray(payload) ? payload : payload ?? [];
      })
      .addCase(assignPermissionToRole.fulfilled, (state, action) => {
        state.rolePermissionsState.success = true;
        state.rolePermissions.push(action.payload.data as RolePermission);
      })
      .addCase(removePermissionFromRole.fulfilled, (state) => {
        state.rolePermissionsState.success = true;
      });

    // ── USER ROLES ─────────────────────────────────────────────────────────
    builder
      .addCase(getUserRoles.pending, (state) => {
        state.userRolesState.loading = true;
      })
      .addCase(getUserRoles.fulfilled, (state, action) => {
        state.userRolesState.loading = false;
        const payload = action.payload.data as any;
        state.userRoles = Array.isArray(payload) ? payload : payload ?? [];
      })
      .addCase(getRoleUsers.fulfilled, (state, action) => {
        state.userRolesState.loading = false;
        const payload = action.payload.data as any;
        state.roleUsers = Array.isArray(payload) ? payload : payload ?? [];
      })
      .addCase(assignRoleToUser.fulfilled, (state, action) => {
        state.userRolesState.success = true;
        state.userRoles.push(action.payload.data as UserRole);
      })
      .addCase(removeRoleFromUser.fulfilled, (state) => {
        state.userRolesState.success = true;
      });
  },
});

export const {
  resetRolesState,
  resetPermissionsState,
  resetUserRolesState,
  clearCurrentRole,
  clearCurrentPermission,
} = rbacSlice.actions;

// Selectors
export const selectRoles = (s: RootState) => s.rbac.roles;
export const selectCurrentRole = (s: RootState) => s.rbac.currentRole;
export const selectRolesState = (s: RootState) => s.rbac.rolesState;
export const selectRolesPagination = (s: RootState) => s.rbac.rolesPagination;

export const selectPermissions = (s: RootState) => s.rbac.permissions;
export const selectCurrentPermission = (s: RootState) => s.rbac.currentPermission;
export const selectPermissionsState = (s: RootState) => s.rbac.permissionsState;

export const selectRolePermissions = (s: RootState) => s.rbac.rolePermissions;
export const selectUserRoles = (s: RootState) => s.rbac.userRoles;
export const selectRoleUsers = (s: RootState) => s.rbac.roleUsers;
export const selectUserRolesState = (s: RootState) => s.rbac.userRolesState;

export default rbacSlice;