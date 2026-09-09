/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Activity,
  RefreshCw,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  UserRound,
} from "lucide-react";
import type { AppDispatch } from "../../../store";
import {
  fetchActivityLogs,
  deleteActivityLog,
} from "../../../store/administration/logAction";
import {
  selectActivityLogs,
  selectActivityLogState,
  selectActivityLogPagination,
  resetActivityLogState,
  clearCurrentLog,
} from "../../../store/administration/logSlice";
import { ActivityLog } from "../../../models/activityLog";

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

const formatDate = (value: Date | string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const actionBadgeClass = (action?: string | null) => {
  const key = (action || "").toLowerCase();
  if (key.includes("delete") || key.includes("suppr"))
    return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
  if (key.includes("create") || key.includes("créat") || key.includes("ajout"))
    return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
  if (key.includes("update") || key.includes("modif"))
    return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
};

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function ActivityLogPage() {
  const dispatch = useDispatch<AppDispatch>();

  const logs = useSelector(selectActivityLogs);
  const domainState = useSelector(selectActivityLogState);
  const pagination = useSelector(selectActivityLogPagination);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ActivityLog | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const load = useCallback(() => {
    dispatch(
      fetchActivityLogs({
        page,
        limit,
        userId: userIdFilter ? Number(userIdFilter) : undefined,
      })
    );
  }, [dispatch, page, limit, userIdFilter]);

  useEffect(() => {
    load();
    return () => {
      dispatch(resetActivityLogState());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return;
    const result = await dispatch(deleteActivityLog({ id: pendingDelete.id }));
    setPendingDelete(null);
    if (deleteActivityLog.fulfilled.match(result)) {
      // liste déjà mise à jour côté slice
    }
  };

  const closeDetail = () => {
    setSelectedLog(null);
    dispatch(clearCurrentLog());
  };

  const totalPages = pagination?.totalPage ?? 1;

  return (
    <div className="min-h-full bg-slate-50 p-6 pt-16">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Journal d&apos;Activité
            </h1>
            <p className="text-sm text-slate-500">
              Historique des actions effectuées par les utilisateurs
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={domainState.loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={domainState.loading ? "animate-spin" : ""}
          />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleApplyFilter}
        className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            ID Utilisateur
          </label>
          <input
            type="number"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="Tous"
            className="w-32 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Par page
          </label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Filtrer
        </button>
        {userIdFilter && (
          <button
            type="button"
            onClick={() => {
              setUserIdFilter("");
              setPage(1);
            }}
            className="text-sm text-slate-500 underline hover:text-slate-700"
          >
            Réinitialiser
          </button>
        )}
      </form>

      {/* Error */}
      {domainState.error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {domainState.error.meta.message || "Une erreur est survenue."}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                Utilisateur
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                Action
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                Description
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                Adresse IP
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {domainState.loading && logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
                  Chargement...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Aucune activité trouvée.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <UserRound size={14} className="text-slate-400" />
                      {log.user?.name || log.user?.email || `#${log.userId ?? "—"}`}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${actionBadgeClass(
                        log.action
                      )}`}
                    >
                      {log.action || "—"}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                    {log.description || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {log.ipAddress || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(log);
                      }}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.currentPage} sur {totalPages} · {pagination.totalItems}{" "}
            résultats
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.previousPage}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.nextPage}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Suivant
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Détail de l&apos;activité
              </h2>
              <button
                onClick={closeDetail}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Date</dt>
                <dd className="font-medium text-slate-800">
                  {formatDate(selectedLog.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Utilisateur</dt>
                <dd className="font-medium text-slate-800">
                  {selectedLog.user?.name || selectedLog.user?.email || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Action</dt>
                <dd className="font-medium text-slate-800">
                  {selectedLog.action || "—"}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-slate-500">Description</dt>
                <dd className="rounded-md bg-slate-50 p-3 text-slate-700">
                  {selectedLog.description || "Aucune description."}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Adresse IP</dt>
                <dd className="font-medium text-slate-800">
                  {selectedLog.ipAddress || "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Supprimer cette entrée ?
            </h2>
            <p className="mb-5 text-sm text-slate-500">
              Cette action est irréversible. L&apos;entrée du journal sera
              définitivement supprimée.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={domainState.loading}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}