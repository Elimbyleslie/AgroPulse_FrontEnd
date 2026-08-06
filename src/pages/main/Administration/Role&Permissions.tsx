/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import extractApiError from "../../../lib/errorextrator";
import {
  Search,
  RefreshCw,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Shield,
  Users as UsersIcon,
  Key,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchPermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions,
  getRoleUsers,
} from "../../../store/Role&Permission/action";
import {
  selectRoles,
  selectRolesState,
  selectPermissions,
  selectRolePermissions,
  selectRoleUsers,
} from "../../../store/Role&Permission/slice";
import { Role, Permission } from "../../../models/UserRolePermission";

// ── Helpers ───────────────────────────────────────────────────────────────────

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// Groupe les permissions par préfixe de code ("users.create" -> "users")
const groupPermissions = (permissions: Permission[]) => {
  const groups: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    const key = p.code.includes(".") ? p.code.split(".")[0] : "autres";
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return groups;
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  bg: string;
}> = ({ label, value, sub, icon, bg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-lg font-black text-gray-900 leading-tight truncate">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Delete Modal ──────────────────────────────────────────────────────────────

const DeleteModal: React.FC<{
  role: Role;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ role, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-rouge" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Supprimer ce rôle ?</h3>
          <p className="text-sm text-gray-500">{role.name}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
        Les utilisateurs ayant ce rôle le <strong>perdront immédiatement</strong>. Action irréversible.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rouge text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <>
              <Spinner /> Suppression…
            </>
          ) : (
            "Confirmer"
          )}
        </button>
      </div>
    </div>
  </div>
);

// ── Role Form Modal ───────────────────────────────────────────────────────────

const RoleFormModal: React.FC<{
  initial?: Role | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
  });

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const isValid = form.name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Le nom du rôle doit contenir au moins 2 caractères");
      return;
    }

    setSaving(true);
    try {
      if (initial?.id) {
        await dispatch(
          updateRole({
            id: initial.id,
            data: { name: form.name.trim(), description: form.description.trim() || undefined },
          }),
        ).unwrap();
        toast.success("Rôle mis à jour avec succès");
      } else {
        await dispatch(
          createRole({ name: form.name.trim(), description: form.description.trim() || undefined }),
        ).unwrap();
        toast.success("Rôle créé avec succès");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const apiError = extractApiError(err);
      let message = apiError.meta.message;
      if (message?.toLowerCase().includes("existe") || message?.includes("409")) {
        message = "Un rôle avec ce nom existe déjà.";
      }
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {initial ? "Modifier le rôle" : "Nouveau rôle"}
              </h2>
              <p className="text-xs text-gray-400">
                {initial ? initial.name : "Créer un rôle personnalisé"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nom du rôle <span className="text-rouge">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
              placeholder="Manager, Vétérinaire…"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="À quoi sert ce rôle…"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !isValid}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200"
          >
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : initial ? (
              "Enregistrer"
            ) : (
              "Créer le rôle"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Permissions Modal ─────────────────────────────────────────────────────────

const PermissionsModal: React.FC<{
  role: Role;
  allPermissions: Permission[];
  rolePermissions: any[];
  loading: boolean;
  onToggle: (permissionId: number) => void;
  onClose: () => void;
}> = ({ role, allPermissions, rolePermissions, loading, onToggle, onClose }) => {
  const grouped = useMemo(() => groupPermissions(allPermissions), [allPermissions]);

  const isAssigned = (permissionId?: number) =>
    rolePermissions.some(
      (rp: any) => rp.permissionId === permissionId || rp.permission?.id === permissionId,
    );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-4 h-4 text-bleu" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Permissions</h2>
              <p className="text-xs text-gray-400">{role.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Spinner className="w-5 h-5" />
            </div>
          )}
          {!loading && allPermissions.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Aucune permission disponible</p>
          )}
          {!loading &&
            Object.entries(grouped).map(([group, perms]) => (
              <div key={group}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{group}</p>
                <div className="space-y-1.5">
                  {perms.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700">{p.code}</p>
                        {p.description && (
                          <p className="text-xs text-gray-400 truncate">{p.description}</p>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isAssigned(p.id)}
                        onChange={() => p.id && onToggle(p.id)}
                        className="accent-vert w-4 h-4 flex-shrink-0 ml-3"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-vert text-white text-sm font-semibold hover:bg-dark_vert transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Role Users Modal (lecture seule) ─────────────────────────────────────────

const RoleUsersModal: React.FC<{
  role: Role;
  roleUsers: any[];
  loading: boolean;
  onClose: () => void;
}> = ({ role, roleUsers, loading, onClose }) => (
  <div
    className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <UsersIcon className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Utilisateurs</h2>
            <p className="text-xs text-gray-400">{role.name}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="p-6 space-y-2 max-h-80 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-6 text-gray-400">
            <Spinner className="w-5 h-5" />
          </div>
        )}
        {!loading && roleUsers.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Aucun utilisateur avec ce rôle</p>
        )}
        {!loading &&
          roleUsers.map((ur: any) => (
            <div key={ur.userId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-vert flex items-center justify-center font-black text-xs flex-shrink-0">
                {(ur.user?.name ?? "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{ur.user?.name ?? `#${ur.userId}`}</p>
                {ur.user?.email && <p className="text-xs text-gray-400 truncate">{ur.user.email}</p>}
              </div>
            </div>
          ))}
      </div>

      <div className="px-6 py-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-vert text-white text-sm font-semibold hover:bg-dark_vert transition"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const RolesPermissionsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const roles = useAppSelector(selectRoles);
  const rolesState = useAppSelector(selectRolesState);
  const allPermissions = useAppSelector(selectPermissions);
  const rolePermissions = useAppSelector(selectRolePermissions);
  const roleUsers = useAppSelector(selectRoleUsers);

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [usersRole, setUsersRole] = useState<Role | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);

  // ── Fetch ──
  const fetchData = useCallback(() => {
    dispatch(fetchRoles({ search: searchTerm || undefined }));
  }, [dispatch, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  const refresh = useCallback(() => {
    fetchData();
    toast.info("Données actualisées");
  }, [fetchData]);

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteRole({ id: deleteTarget.id })).unwrap();
      toast.success("Rôle supprimé");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Permissions modal ──
  const openPermissionsModal = async (role: Role) => {
    if (!role.id) return;
    setPermissionsRole(role);
    setPermissionsLoading(true);
    try {
      await dispatch(getRolePermissions(role.id)).unwrap();
    } finally {
      setPermissionsLoading(false);
    }
  };

  const togglePermission = (permissionId: number) => {
    if (!permissionsRole?.id) return;
    const assigned = rolePermissions.some(
      (rp: any) => rp.permissionId === permissionId || rp.permission?.id === permissionId,
    );
    if (assigned) {
      dispatch(removePermissionFromRole({ roleId: permissionsRole.id, permissionId }));
    } else {
      dispatch(assignPermissionToRole({ roleId: permissionsRole.id, permissionId }));
    }
  };

  // ── Users modal ──
  const openUsersModal = async (role: Role) => {
    if (!role.id) return;
    setUsersRole(role);
    setUsersLoading(true);
    try {
      await dispatch(getRoleUsers(role.id)).unwrap();
    } finally {
      setUsersLoading(false);
    }
  };

  // ── Stats ──
  const stats = useMemo(
    () => ({
      totalRoles: roles.length,
      totalPermissions: allPermissions.length,
    }),
    [roles, allPermissions],
  );

  const isLoading = rolesState.loading;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium"
      />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Administration</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Rôles &amp; Permissions</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Rôles &amp; Permissions</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Définissez les rôles et leurs droits d'accès
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingRole(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition shadow-sm shadow-emerald-200"
            >
              <Plus className="w-4 h-4" /> Nouveau rôle
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Rôles définis"
            value={String(stats.totalRoles)}
            icon={<Shield className="w-5 h-5 text-vert" />}
            bg="bg-emerald-50"
          />
          <StatCard
            label="Permissions disponibles"
            value={String(stats.totalPermissions)}
            icon={<Key className="w-5 h-5 text-bleu" />}
            bg="bg-blue-50"
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un rôle…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
        </div>

        {/* ── Roles list ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : roles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Shield className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">
              {searchTerm ? "Aucun rôle trouvé" : "Aucun rôle défini"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingRole(null);
                  setShowForm(true);
                }}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition"
              >
                <Plus className="w-4 h-4" /> Nouveau rôle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-vert" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{role.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {role.description || "Aucune description"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPermissionsModal(role)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-bleu text-xs font-semibold hover:bg-blue-100 transition"
                  >
                    <Key className="w-3.5 h-3.5" />
                    {role.permissions?.length ?? "—"} permission{(role.permissions?.length ?? 0) > 1 ? "s" : ""}
                  </button>
                  <button
                    onClick={() => openUsersModal(role)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-50 text-purple-600 text-xs font-semibold hover:bg-purple-100 transition"
                  >
                    <UsersIcon className="w-3.5 h-3.5" />
                    {role.users?.length ?? "—"} utilisateur{(role.users?.length ?? 0) > 1 ? "s" : ""}
                  </button>
                </div>

                <div className="flex items-center gap-1 justify-end pt-1 border-t border-gray-50">
                  <button
                    onClick={() => {
                      setEditingRole(role);
                      setShowForm(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700"
                    title="Modifier"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(role)}
                    className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showForm && (
        <RoleFormModal
          initial={editingRole}
          onClose={() => {
            setShowForm(false);
            setEditingRole(null);
          }}
          onSuccess={() => fetchData()}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          role={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
      {permissionsRole && (
        <PermissionsModal
          role={permissionsRole}
          allPermissions={allPermissions}
          rolePermissions={rolePermissions}
          loading={permissionsLoading}
          onToggle={togglePermission}
          onClose={() => setPermissionsRole(null)}
        />
      )}
      {usersRole && (
        <RoleUsersModal
          role={usersRole}
          roleUsers={roleUsers}
          loading={usersLoading}
          onClose={() => setUsersRole(null)}
        />
      )}
    </>
  );
};

export default RolesPermissionsDashboard;