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
  UserCog,
  ShieldCheck,
  Mail,
  Phone,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
} from "../../../store/auth/userAction";
import {
  selectUsers,
  selectUsersState,
  selectUsersPagination,
  selectUserRoles,
  selectUserRolesState,
} from "../../../store/auth/userSlice";
import { fetchRoles,  } from "../../../store/Role&Permission/action";
import { selectRoles } from "../../../store/Role&Permission/slice";
import SelectInput from "../../../components/UI/SelectInput";
import { User } from "../../../models/user";
import { Role ,UserRole} from "../../../models/UserRolePermission";

// ── Helpers ───────────────────────────────────────────────────────────────────

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const fmtDateTime = (d?: Date | string) =>
  d
    ? new Date(d).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const initials = (name: string) =>
  name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AVATAR_COLORS = [
  "bg-emerald-100 text-vert",
  "bg-blue-100 text-bleu",
  "bg-purple-100 text-purple-600",
  "bg-yellow-100 text-jaune",
  "bg-pink-100 text-pink-600",
  "bg-orange-100 text-orange-600",
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const STATUS_OPTIONS = [
  { label: "Actif", value: "active" },
  { label: "Inactif", value: "inactive" },
];

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: User["status"] }> = ({ status }) => {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive ? "bg-emerald-50 text-vert" : "bg-red-50 text-rouge"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-vert" : "bg-rouge"}`} />
      {isActive ? "Actif" : "Inactif"}
    </span>
  );
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
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-lg font-black text-gray-900 leading-tight truncate">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Sort ──────────────────────────────────────────────────────────────────────

type SortKey = "name" | "lastConnexion";

const ColHeader: React.FC<{
  label: string;
  colKey: SortKey;
  current: SortKey;
  dir: "asc" | "desc";
  onSort: (k: SortKey) => void;
}> = ({ label, colKey, current, dir, onSort }) => (
  <button
    onClick={() => onSort(colKey)}
    className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition"
  >
    {label}
    {current === colKey ? (
      dir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3 opacity-20" />
    )}
  </button>
);

// ── Delete Modal ──────────────────────────────────────────────────────────────

const DeleteModal: React.FC<{
  user: User;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ user, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-rouge" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Supprimer cet utilisateur ?</h3>
          <p className="text-sm text-gray-500">{user.name}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
        Cette action est <strong>irréversible</strong>. L'utilisateur perdra immédiatement l'accès.
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

// ── User Form Modal ───────────────────────────────────────────────────────────

const UserFormModal: React.FC<{
  initial?: User | null;
  roles: any[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ initial, roles, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    userName: initial?.userName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    password: "",
    status: initial?.status ?? ("active" as "active" | "inactive"),
    roleIds: [] as number[],
  });

  const set = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const isValid = form.name.trim().length >= 2 && form.email.trim().length > 3;

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Nom et email sont obligatoires");
      return;
    }
    if (!initial && !form.password) {
      toast.error("Mot de passe obligatoire à la création");
      return;
    }

    setSaving(true);
    try {
      if (initial) {
        await dispatch(
          updateUser({
            id: initial.id,
            data: {
              name: form.name.trim(),
              email: form.email.trim(),
              userName: form.userName.trim(),
              phone: form.phone.trim(),
              status: form.status,
            },
          }),
        ).unwrap();
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        await dispatch(
          createUser({
            name: form.name.trim(),
            userName: form.userName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
            status: form.status,
            roleIds: form.roleIds.length ? form.roleIds : undefined,
          }),
        ).unwrap();
        toast.success("Utilisateur créé avec succès");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const apiError = extractApiError(err);
      let message = apiError.meta.message;
      if (message?.toLowerCase().includes("email") || message?.includes("409")) {
        message = "Un utilisateur avec cet email existe déjà.";
      }
      toast.error(message, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "light",
      });
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
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col border border-gray-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <UserCog className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {initial ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </h2>
              <p className="text-xs text-gray-400">
                {initial ? initial.name : "Ajouter un utilisateur à la plateforme"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Avatar preview */}
          {form.name.trim() && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${avatarColor(form.name)}`}
              >
                {initials(form.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{form.name}</p>
                {form.email && <p className="text-xs text-gray-400">{form.email}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nom complet <span className="text-rouge">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
              placeholder="Jean Dupont"
            />
          </div>

          {!initial && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={form.userName}
                onChange={(e) => set("userName", e.target.value)}
                className={inputClass}
                placeholder="jdupont"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email <span className="text-rouge">*</span>
              </span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
              placeholder="user@exemple.com"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> Téléphone
              </span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
              placeholder="+237 6XX XXX XXX"
            />
          </div>

          {!initial && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Mot de passe <span className="text-rouge">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Statut
            </label>
            <SelectInput
              value={form.status}
              onChange={(val) => set("status", val as "active" | "inactive")}
              options={STATUS_OPTIONS}
            />
          </div>

          {!initial && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Rôles à assigner
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2">
                {roles.length === 0 && (
                  <p className="text-xs text-gray-400 px-1 py-1">Aucun rôle disponible</p>
                )}
                {roles.map((role: any) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 px-1 py-1 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      className="accent-vert"
                      checked={form.roleIds.includes(role.id)}
                      onChange={() =>
                        set(
                          "roleIds",
                          form.roleIds.includes(role.id)
                            ? form.roleIds.filter((id) => id !== role.id)
                            : [...form.roleIds, role.id],
                        )
                      }
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
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
              "Créer l'utilisateur"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Role Modal (revu) ─────────────────────────────────────────────────────────
// Affiche clairement le(s) rôle(s) actuel(s) de l'utilisateur, permet de le/les
// retirer, et propose d'assigner un autre rôle disponible.

const RoleModal: React.FC<{
  user: User;
  roles: Role[];
  userRoles: UserRole[];
  loading: boolean;
  onAssign: (roleId: number) => void;
  onRemove: (roleId: number) => void;
  onClose: () => void;
}> = ({ user, roles, userRoles, loading, onAssign, onRemove, onClose }) => {
const isAssigned = (roleId: number) =>
  userRoles.some((r: any) => r.id === roleId);

  const assignedRoles = useMemo(
    () => roles.filter((role: any) => isAssigned(role.id)),
    [roles, userRoles],
  );
  const availableRoles = useMemo(
    () => roles.filter((role: any) => !isAssigned(role.id)),
    [roles, userRoles],
  );

  return (
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
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-bleu" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Rôles</h2>
              <p className="text-xs text-gray-400">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Spinner className="w-5 h-5" />
            </div>
          )}

          {!loading && (
            <>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Rôle{assignedRoles.length > 1 ? "s" : ""} actuel{assignedRoles.length > 1 ? "s" : ""}
                </p>
                {assignedRoles.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">Aucun rôle assigné</p>
                ) : (
                  <div className="space-y-1.5">
                    {assignedRoles.map((role: any) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50"
                      >
                        <span className="text-sm font-semibold text-vert">{role.name}</span>
                        <button
                          onClick={() => onRemove(role.id)}
                          className="text-xs font-semibold text-rouge hover:underline"
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Assigner un autre rôle
                </p>
                {availableRoles.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">Aucun autre rôle disponible</p>
                ) : (
                  <div className="space-y-1.5">
                    {availableRoles.map((role: any) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                      >
                        <span className="text-sm font-medium text-gray-700">{role.name}</span>
                        <button
                          onClick={() => onAssign(role.id)}
                          className="text-xs font-semibold text-vert hover:underline"
                        >
                          Assigner
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
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

// ── Main Component ────────────────────────────────────────────────────────────

const UsersManagementDashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const users = useAppSelector(selectUsers);
  const usersState = useAppSelector(selectUsersState);
  const pagination = useAppSelector(selectUsersPagination);
  const roles = useAppSelector(selectRoles);
  const userRoles = useAppSelector(selectUserRoles);
  const userRolesState = useAppSelector(selectUserRolesState);

  // TODO: pointez ceci vers votre vrai selector d'auth (ex: selectAuthUser).
  // Le cast en `any` évite une erreur de compilation en attendant.
  const assignedBy = useAppSelector(
    (state: any) => state.auth?.user?.userName || state.auth?.user?.email || "system",
  );

  const isLoading = usersState.loading;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);

  // ── Fetch ──
  const fetchData = useCallback(() => {
    dispatch(
      fetchUsers({
        page,
        limit: 20,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      }),
    );
  }, [dispatch, page, searchTerm, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const refresh = useCallback(() => {
    fetchData();
    toast.info("Données actualisées");
  }, [fetchData]);

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteUser({ id: deleteTarget.id })).unwrap();
      toast.success("Utilisateur supprimé");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Sort (sur la page courante) ──
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedUsers = useMemo(() => {
    const list = Array.isArray(users) ? [...users] : [];
    list.sort((a, b) => {
      const aVal = sortKey === "name" ? a.name : String(a.lastConnexion ?? "");
      const bVal = sortKey === "name" ? b.name : String(b.lastConnexion ?? "");
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, sortKey, sortDir]);

  // ── Stats (sur la page courante — le total réel vient de pagination.totalItems) ──
  const stats = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return {
      total: pagination?.totalItems ?? list.length,
      actifs: list.filter((u) => u.status === "active").length,
      inactifs: list.filter((u) => u.status === "inactive").length,
    };
  }, [users, pagination]);

  // ── Roles modal ──
  const openRoleModal = (user: User) => {
    setRoleModalUser(user);
    dispatch(getUserRoles(user.id));
  };

  const assignRole = (roleId: number) => {
    if (!roleModalUser) return;
    dispatch(assignRoleToUser({ id: roleModalUser.id, roleId, assignedBy }))
      .unwrap()
      .then(() => {
        toast.success("Rôle assigné");
        dispatch(getUserRoles(roleModalUser.id));
        fetchData(); // garde la liste principale synchro
      })
      .catch(() => toast.error("Erreur lors de l'assignation du rôle"));
  };

  const removeRole = (roleId: number) => {
    if (!roleModalUser) return;
    dispatch(removeRoleFromUser({ id: roleModalUser.id, roleId }))
      .unwrap()
      .then(() => {
        toast.success("Rôle retiré");
        dispatch(getUserRoles(roleModalUser.id));
        fetchData();
      })
      .catch(() => toast.error("Erreur lors du retrait du rôle"));
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const rows = [
      ["Nom", "Email", "Téléphone", "Statut", "Dernière connexion"],
      ...sortedUsers.map((u) => [
        u.name,
        u.email,
        u.phone ?? "",
        u.status,
        fmtDateTime(u.lastConnexion),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "utilisateurs.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  const totalPages = pagination?.totalPages ?? 1;

  // ── Render ────────────────────────────────────────────────────────────────

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
              <span className="text-gray-600 font-medium">Utilisateurs</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Utilisateurs</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Gérez les comptes, statuts et rôles des utilisateurs
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingUser(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition shadow-sm shadow-emerald-200"
            >
              <Plus className="w-4 h-4" /> Nouvel utilisateur
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Total utilisateurs"
            value={String(stats.total)}
            sub="enregistrés"
            icon={<UserCog className="w-5 h-5 text-vert" />}
            bg="bg-emerald-50"
          />
          <StatCard
            label="Actifs"
            value={String(stats.actifs)}
            sub="sur cette page"
            icon={<ShieldCheck className="w-5 h-5 text-vert" />}
            bg="bg-emerald-50"
          />
          <StatCard
            label="Inactifs"
            value={String(stats.inactifs)}
            sub="sur cette page"
            icon={<X className="w-5 h-5 text-rouge" />}
            bg="bg-red-50"
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, email…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            />
          </div>
          <div className="w-48">
            <SelectInput
              value={statusFilter}
              placeholder="Tous les statuts"
              onChange={(val) => {
                setStatusFilter(String(val));
                setPage(1);
              }}
              options={[{ label: "Tous les statuts", value: "" }, ...STATUS_OPTIONS]}
            />
          </div>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <UserCog className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">
              {searchTerm ? "Aucun utilisateur trouvé" : "Aucun utilisateur enregistré"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingUser(null);
                  setShowForm(true);
                }}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition"
              >
                <Plus className="w-4 h-4" /> Nouvel utilisateur
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* En-têtes */}
            <div className="hidden md:grid grid-cols-[44px_1fr_1fr_120px_180px_120px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <div />
              <ColHeader label="Nom" colKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</p>
              <ColHeader
                label="Dernière connexion"
                colKey="lastConnexion"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                Actions
              </p>
            </div>

            <div className="divide-y divide-gray-50">
              {sortedUsers.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-[1fr_auto] md:grid-cols-[44px_1fr_1fr_120px_180px_120px] gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition items-center"
                >
                  <div
                    className={`hidden md:flex w-8 h-8 rounded-full items-center justify-center font-black text-xs flex-shrink-0 ${avatarColor(u.name)}`}
                  >
                    {initials(u.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{u.name}</p>
                    <div className="flex md:hidden items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{u.email}</span>
                  </div>

                  <div className="hidden md:flex items-center">
                    <StatusBadge status={u.status} />
                  </div>

                  <div className="hidden md:flex items-center">
                    <span className="text-sm text-gray-500">{fmtDateTime(u.lastConnexion)}</span>
                  </div>

                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => openRoleModal(u)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition text-gray-400 hover:text-bleu"
                      title="Gérer les rôles"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination (serveur) */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Page {pagination?.currentPage ?? page} sur {totalPages} — {pagination?.totalItems ?? 0}{" "}
                  utilisateurs
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination?.previousPage}
                    className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg =
                      totalPages <= 5
                        ? i + 1
                        : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                          pg === page ? "bg-vert text-white" : "hover:bg-gray-200 text-gray-600"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={!pagination?.nextPage}
                    className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showForm && (
        <UserFormModal
          initial={editingUser}
          roles={roles}
          onClose={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          onSuccess={() => fetchData()}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
      {roleModalUser && (
        <RoleModal
          user={roleModalUser}
          roles={roles}
          userRoles={userRoles}
          loading={userRolesState.loading}
          onAssign={assignRole}
          onRemove={removeRole}
          onClose={() => setRoleModalUser(null)}
        />
      )}
    </>
  );
};

export default UsersManagementDashboard;