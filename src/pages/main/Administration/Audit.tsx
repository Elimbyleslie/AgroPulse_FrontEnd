/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Shield,
  RefreshCw,
  Search,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Filter,
  UserRound,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../../store";
import {
  fetchAudits,
  searchAudits,
  getAuditStats,
  exportAudits,
} from "../../../store/administration/auditAction";
import {
  selectAudits,
  selectSearchResults,
  selectAuditState,
  selectAuditPagination,
  selectAuditStats,
  selectExportLoading,
  resetAuditState,
  clearCurrentAudit,
  clearSearchResults,
} from "../../../store/administration/auditslice";
import { Audit } from "../../../models/activityLog";

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

/** Rend les stats de façon générique quel que soit le shape renvoyé par l'API */
const StatsCards = ({ stats }: { stats: any }) => {
  if (!stats || typeof stats !== "object") return null;
  const entries = Object.entries(stats).filter(
    ([, v]) => typeof v === "number" || typeof v === "string"
  );
  if (entries.length === 0) return null;

  const labelMap: Record<string, string> = {
    total: "Total",
    totalAudits: "Total audits",
    periode: "Période (j)",
    creates: "Créations",
    updates: "Modifications",
    deletes: "Suppressions",
  };

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {entries.slice(0, 8).map(([key, value]) => (
        <div
          key={key}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {labelMap[key] || key}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {String(value)}
          </p>
        </div>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function AuditPage() {
  const dispatch = useDispatch<AppDispatch>();

  const audits = useSelector(selectAudits);
  const searchResults = useSelector(selectSearchResults);
  const searchTerm = useSelector((s: RootState) => s.audit.searchTerm);
  const domainState = useSelector(selectAuditState);
  const pagination = useSelector(selectAuditPagination);
  const stats = useSelector(selectAuditStats);
  const exportLoading = useSelector(selectExportLoading);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    tableTarget: "",
    action: "",
    dateDebut: "",
    dateFin: "",
    organizationId: "",
    farmId: "",
  });
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  const isSearching = Boolean(searchTerm);
  const rows = isSearching ? searchResults : audits;

  const load = useCallback(() => {
    dispatch(
      fetchAudits({
        page,
        limit,
        tableTarget: filters.tableTarget || undefined,
        action: filters.action || undefined,
        dateDebut: filters.dateDebut || undefined,
        dateFin: filters.dateFin || undefined,
        organizationId: filters.organizationId
          ? Number(filters.organizationId)
          : undefined,
        farmId: filters.farmId ? Number(filters.farmId) : undefined,
      })
    );
  }, [dispatch, page, limit, filters]);

  useEffect(() => {
    dispatch(getAuditStats({ periode: 30 }));
  }, [dispatch]);

  useEffect(() => {
    if (!isSearching) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, isSearching]);

  useEffect(() => {
    return () => {
      dispatch(resetAuditState());
    };
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      dispatch(clearSearchResults());
      setPage(1);
      load();
      return;
    }
    dispatch(searchAudits({ search: query.trim(), page: 1, limit }));
    setPage(1);
  };

  const clearSearch = () => {
    setQuery("");
    dispatch(clearSearchResults());
    setPage(1);
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    dispatch(clearSearchResults());
    setQuery("");
    load();
  };

  const resetFilters = () => {
    setFilters({
      tableTarget: "",
      action: "",
      dateDebut: "",
      dateFin: "",
      organizationId: "",
      farmId: "",
    });
    setPage(1);
  };

  const handleExport = async (format: "json" | "csv") => {
    const result: any = await dispatch(
      exportAudits({
        format,
        dateDebut: filters.dateDebut || undefined,
        dateFin: filters.dateFin || undefined,
      })
    );
    if (exportAudits.fulfilled.match(result)) {
      const payload = result.payload;
      const content =
        typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
      const blob = new Blob([content], {
        type: format === "csv" ? "text/csv" : "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audits-export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  const closeDetail = () => {
    setSelectedAudit(null);
    dispatch(clearCurrentAudit());
  };

  const totalPages = pagination?.totalPage ?? 1;

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );

  return (
    <div className="min-h-full bg-slate-50 p-6 pt-16">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Audit</h1>
            <p className="text-sm text-slate-500">
              Traçabilité des modifications effectuées sur l&apos;application
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={exportLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={16} />
            CSV
          </button>
          <button
            onClick={() => handleExport("json")}
            disabled={exportLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={16} />
            JSON
          </button>
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
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Search + filter toggle */}
      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="flex flex-1 min-w-[220px] gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une action, une table, une description..."
                className="w-full rounded-md border border-slate-300 py-1.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Rechercher
            </button>
            {isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
              >
                <X size={14} />
              </button>
            )}
          </form>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Filter size={15} />
            Filtres
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>

        {showFilters && (
          <form
            onSubmit={applyFilters}
            className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Table cible
              </label>
              <input
                value={filters.tableTarget}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, tableTarget: e.target.value }))
                }
                placeholder="ex: farms"
                className="w-32 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Action</label>
              <input
                value={filters.action}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, action: e.target.value }))
                }
                placeholder="ex: UPDATE"
                className="w-32 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Organisation
              </label>
              <input
                type="number"
                value={filters.organizationId}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, organizationId: e.target.value }))
                }
                placeholder="ID"
                className="w-24 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Ferme</label>
              <input
                type="number"
                value={filters.farmId}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, farmId: e.target.value }))
                }
                placeholder="ID"
                className="w-24 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Du</label>
              <input
                type="date"
                value={filters.dateDebut}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, dateDebut: e.target.value }))
                }
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Au</label>
              <input
                type="date"
                value={filters.dateFin}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, dateFin: e.target.value }))
                }
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Appliquer
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm text-slate-500 underline hover:text-slate-700"
              >
                Réinitialiser
              </button>
            )}
          </form>
        )}
      </div>

      {/* Error */}
      {domainState.error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {domainState.error.meta.message || "Une erreur est survenue."}
        </div>
      )}

      {isSearching && (
        <p className="mb-2 text-sm text-slate-500">
          Résultats de recherche pour «&nbsp;{searchTerm}&nbsp;»
        </p>
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
                Table
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                Action
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                Ferme / Organisation
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {domainState.loading && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
                  Chargement...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Aucun audit trouvé.
                </td>
              </tr>
            ) : (
              rows.map((audit) => (
                <tr
                  key={audit.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedAudit(audit)}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(audit.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <UserRound size={14} className="text-slate-400" />
                      {audit.user?.name || audit.user?.email || `#${audit.userId ?? "—"}`}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
                    {audit.tableTarget}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${actionBadgeClass(
                        audit.action
                      )}`}
                    >
                      {audit.action}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {audit.farm?.name || audit.organization?.name || "—"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                    {audit.description || "—"}
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

      {/* Detail modal with before/after diff */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Détail de l&apos;audit
              </h2>
              <button
                onClick={closeDetail}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Date</dt>
                <dd className="font-medium text-slate-800">
                  {formatDate(selectedAudit.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Utilisateur</dt>
                <dd className="font-medium text-slate-800">
                  {selectedAudit.user?.name || selectedAudit.user?.email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Table</dt>
                <dd className="font-mono text-xs font-medium text-slate-800">
                  {selectedAudit.tableTarget}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Action</dt>
                <dd>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${actionBadgeClass(
                      selectedAudit.action
                    )}`}
                  >
                    {selectedAudit.action}
                  </span>
                </dd>
              </div>
            </dl>

            {selectedAudit.description && (
              <div className="mb-4">
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Description
                </p>
                <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  {selectedAudit.description}
                </p>
              </div>
            )}

            {(selectedAudit.previousData || selectedAudit.newData) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedAudit.previousData && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      Avant
                    </p>
                    <pre className="max-h-56 overflow-auto rounded-md bg-red-50 p-3 text-xs text-red-900">
                      {JSON.stringify(selectedAudit.previousData, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedAudit.newData && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      Après
                    </p>
                    <pre className="max-h-56 overflow-auto rounded-md bg-emerald-50 p-3 text-xs text-emerald-900">
                      {JSON.stringify(selectedAudit.newData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}