/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { Farm } from "../../models/farm";
import { AlertStatus } from "../../models/alerts";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Search,
  Trash2,
  X,
  Calendar,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
  Syringe,
  Heart,
  Skull,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAlertsByFarmId,
  updateAlert,
  deleteAlert,
} from "../../store/alerts/action";
import { clearError } from "../../store/alerts/slice";
import { selectCurrentFarm, setCurrentFarm } from "../../store/farm/slice";
import { getUserFarms } from "../../store/farm/action";
import { toast } from "react-toastify";

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ─── Détection du type d'alerte depuis le titre généré par le backend ─────────

type AlertType = "vaccination" | "health" | "death" | "unknown";

const detectAlertType = (title: string): AlertType => {
  const lower = title.toLowerCase();
  if (lower.includes("vaccin")) return "vaccination";
  if (lower.includes("malade") || lower.includes("santé")) return "health";
  if (lower.includes("décès") || lower.includes("mort")) return "death";
  return "unknown";
};

const ALERT_TYPE_CONFIG: Record<
  AlertType,
  {
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    ringClass: string;
  } | null
> = {
  vaccination: {
    icon: Syringe,
    bgClass: "bg-blue-50",
    textClass: "text-blue-600",
    ringClass: "ring-blue-100",
  },
  health: {
    icon: Heart,
    bgClass: "bg-orange-50",
    textClass: "text-orange-600",
    ringClass: "ring-orange-100",
  },
  death: {
    icon: Skull,
    bgClass: "bg-gray-100",
    textClass: "text-gray-600",
    ringClass: "ring-gray-200",
  },
  unknown: null,
};

const STATUS_CONFIG: Record<
  AlertStatus,
  { label: string; pillClass: string; barClass: string }
> = {
  active: {
    label: "Active",
    pillClass: "bg-red-100 text-red-600",
    barClass: "bg-red-400",
  },
  resolved: {
    label: "Résolue",
    pillClass: "bg-green-100 text-green-600",
    barClass: "bg-green-400",
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const AlertDashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const alertsList = useAppSelector((state) => {
    const raw = state.alerts.alerts;
    const all = Array.isArray(raw) ? raw : [];
    return all.filter((alert) => detectAlertType(alert.title) !== "unknown");
  });
  const isLoading = useAppSelector((state) => state.alerts.loading);
  const storeError = useAppSelector((state) => state.alerts.error);
  const currentUser = useAppSelector(
    (state) => state.authentification.auth.user,
  );
  const currentFarm = useAppSelector(selectCurrentFarm);
  const farmId = currentFarm?.id;

  const [isLoadingFarm, setIsLoadingFarm] = useState(false);
  const [detailAlert, setDetailAlert] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | AlertStatus>("all");
  const [filterType, setFilterType] = useState<AlertType | "all">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (storeError) {
      toast.error(storeError);
      dispatch(clearError());
    }
  }, [storeError, dispatch]);

  useEffect(() => {
    const loadFarm = async () => {
      if (!currentUser?.id || currentFarm?.id) return;
      setIsLoadingFarm(true);
      try {
        const result = await dispatch(getUserFarms()).unwrap();
        const farmArray = result?.data || result;
        if (Array.isArray(farmArray) && farmArray.length > 0) {
          const savedFarmId = localStorage.getItem("last_farm_id");
          const farmToUse = savedFarmId
            ? (farmArray.find(
                (farm: Farm) => farm.id === parseInt(savedFarmId, 10),
              ) ?? farmArray[0])
            : farmArray[0];
          if (farmToUse) dispatch(setCurrentFarm(farmToUse));
        }
      } catch (err) {
        console.error("Erreur chargement ferme :", err);
      } finally {
        setIsLoadingFarm(false);
      }
    };
    loadFarm();
  }, [currentUser?.id, currentFarm?.id, dispatch]);

  const loadAlerts = useCallback(() => {
    if (farmId) dispatch(fetchAlertsByFarmId(farmId));
  }, [dispatch, farmId]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const stats = useMemo(
    () => ({
      total: alertsList.length,
      active: alertsList.filter((alert) => alert.status === "active").length,
      resolved: alertsList.filter((alert) => alert.status === "resolved")
        .length,
    }),
    [alertsList],
  );

  const filteredAlerts = useMemo(
    () =>
      alertsList
        .filter((alert) => {
          const matchesStatus =
            filterStatus === "all" || alert.status === filterStatus;
          const matchesType =
            filterType === "all" || detectAlertType(alert.title) === filterType;
          const search = searchTerm.toLowerCase();
          const matchesSearch =
            !searchTerm ||
            alert.title?.toLowerCase().includes(search) ||
            alert.message?.toLowerCase().includes(search);
          return matchesStatus && matchesType && matchesSearch;
        })
        .sort(
          (alertA, alertB) =>
            new Date(alertB.date).getTime() - new Date(alertA.date).getTime(),
        ),
    [alertsList, filterStatus, filterType, searchTerm],
  );

  const handleResolve = async (alertId: number) => {
    setResolvingId(alertId);
    try {
      await dispatch(
        updateAlert({ id: alertId, data: { status: "resolved" } as any }),
      ).unwrap();
      toast.success("Alerte marquée comme résolue");
      if (detailAlert?.id === alertId) setDetailAlert(null);
    } catch {
      toast.error("Erreur lors de la résolution");
    } finally {
      setResolvingId(null);
    }
  };

  const handleDelete = async (alertId: number) => {
    setIsDeleting(true);
    try {
      await dispatch(deleteAlert(alertId)).unwrap();
      toast.success("Alerte supprimée");
      setConfirmDeleteId(null);
      setDetailAlert(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingFarm)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-500">
        <Loader2 size={36} className="animate-spin text-vert" />
        <p className="font-semibold text-sm">Chargement de la ferme…</p>
      </div>
    );

  if (!farmId)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-5 bg-orange-50 rounded-3xl text-orange-500">
          <AlertTriangle size={32} />
        </div>
        <p className="font-bold text-gray-700">Aucune ferme sélectionnée</p>
      </div>
    );

  const filterTypeTabs = [
    { key: "all" as const, label: "Toutes", Icon: Bell },
    { key: "vaccination" as const, label: "Vaccins", Icon: Syringe },
    { key: "health" as const, label: "Santé", Icon: Heart },
    { key: "death" as const, label: "Décès", Icon: Skull },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* ── En-tête ── */}
        <div className="flex items-center justify-between bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-400 rounded-2xl text-white shadow-lg shadow-red-100">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Alertes Sanitaires</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {currentFarm?.name ?? ""} · Vaccins, maladies, décès
              </p>
            </div>
          </div>
          {stats.active > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black text-red-600">{stats.active} active{stats.active > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* ── Bannière alertes actives ── */}
        <AnimatePresence>
          {stats.active > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl text-white shadow-lg shadow-red-100 overflow-hidden"
            >
              <div className="p-2 bg-white/20 rounded-xl shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-sm font-black">
                  {stats.active} situation{stats.active > 1 ? "s" : ""} nécessite{stats.active > 1 ? "nt" : ""} votre attention
                </p>
                <p className="text-xs opacity-80">Consultez les alertes actives ci-dessous.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats ── */}
        {!isLoading && alertsList.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "all", value: stats.total, label: "Total", colorClass: "text-gray-700", bgClass: "bg-gray-50", Icon: Shield },
              { key: "active", value: stats.active, label: "Actives", colorClass: "text-red-500", bgClass: "bg-red-50", Icon: AlertTriangle },
              { key: "resolved", value: stats.resolved, label: "Résolues", colorClass: "text-green-600", bgClass: "bg-green-50", Icon: CheckCircle2 },
            ].map(({ key, value, label, colorClass, bgClass, Icon }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key as "all" | AlertStatus)}
                className={`rounded-2xl p-4 text-center border shadow-sm transition-all hover:-translate-y-0.5 ${bgClass} ${
                  filterStatus === key ? "border-2 border-vert" : "border-gray-100"
                }`}
              >
                <Icon size={18} className={`mx-auto mb-1.5 ${colorClass}`} />
                <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
              </button>
            ))}
          </div>
        )}

        {/* ── Toolbar : recherche + filtres type ── */}
        {!isLoading && alertsList.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-vert/30 focus:border-vert transition-all"
                placeholder="Rechercher une alerte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto">
              {filterTypeTabs.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    filterType === key ? "bg-vert text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Contenu ── */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-3 rounded-lg bg-gray-100 animate-pulse w-2/5" />
                  <div className="h-3.5 rounded-lg bg-gray-100 animate-pulse w-3/4" />
                  <div className="h-2.5 rounded-lg bg-gray-100 animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="p-5 bg-green-50 rounded-2xl text-green-400">
              <CheckCircle2 size={30} />
            </div>
            <p className="text-sm font-black text-gray-600">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "Aucune alerte pour ces filtres"
                : "Aucune alerte — tout va bien !"}
            </p>
            <p className="text-xs text-gray-400">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "Modifiez vos filtres"
                : "Le système génère automatiquement les alertes en cas de problème"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {filteredAlerts.map((alert) => {
                const alertType = detectAlertType(alert.title);
                const typeConfig = ALERT_TYPE_CONFIG[alertType];
                const TypeIcon = typeConfig?.icon;
                const statusConfig =
                  STATUS_CONFIG[alert.status as AlertStatus] ?? STATUS_CONFIG["active"];
                const isExpanded = expandedId === alert.id;
                const isActive = alert.status === "active";
                const isResolving = resolvingId === alert.id;

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <span className={`absolute left-0 top-0 bottom-0 w-1 ${statusConfig.barClass}`} />

                    <div
                      className="flex items-center gap-3 p-4 pl-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
                      onClick={() => setDetailAlert(alert)}
                    >
                      <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center ring-4 ${typeConfig?.bgClass} ${typeConfig?.textClass} ${typeConfig?.ringClass}`}>
                        {TypeIcon && <TypeIcon size={19} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide inline-flex items-center gap-1 mb-1 ${statusConfig.pillClass}`}>
                          {isActive ? <AlertTriangle size={9} /> : <CheckCircle2 size={9} />}
                          {statusConfig.label}
                        </span>
                        <p className="text-sm font-bold text-gray-900 truncate">{alert.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{alert.message}</p>
                        <span className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                          <Calendar size={10} /> {formatDate(alert.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isActive && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={isResolving}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl font-bold text-[11px] transition-colors disabled:opacity-60"
                          >
                            {isResolving ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            Résoudre
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDeleteId(alert.id)}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-50 overflow-hidden"
                        >
                          <div className="px-5 pb-4 pt-3 pl-[4.75rem]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Clock size={10} /> Message complet
                            </p>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                              {alert.message}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Modal Détail ── */}
      <AnimatePresence>
        {detailAlert &&
          (() => {
            const alertType = detectAlertType(detailAlert.title);
            const typeConfig = ALERT_TYPE_CONFIG[alertType];
            const TypeIcon = typeConfig?.icon;
            const statusConfig =
              STATUS_CONFIG[detailAlert.status as AlertStatus] ?? STATUS_CONFIG["active"];
            const isActive = detailAlert.status === "active";
            const isResolving = resolvingId === detailAlert.id;

            return (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setDetailAlert(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setDetailAlert(null)}
                    className="absolute top-4 right-4 z-10 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500"
                  >
                    <X size={15} />
                  </button>
                  <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ring-4 ${typeConfig?.bgClass} ${typeConfig?.textClass} ${typeConfig?.ringClass}`}>
                        {TypeIcon && <TypeIcon size={22} />}
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide inline-flex items-center gap-1 ${statusConfig.pillClass}`}>
                        {isActive ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                        {statusConfig.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 pr-8">{detailAlert.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar size={10} /> {formatDate(detailAlert.date)}
                    </p>
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Détails</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                      {detailAlert.message}
                    </p>
                  </div>
                  <div className="px-6 pb-6 flex gap-3">
                    {isActive && (
                      <button
                        onClick={() => handleResolve(detailAlert.id)}
                        disabled={isResolving}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-green-200 transition-colors disabled:opacity-60"
                      >
                        {isResolving ? (
                          <>
                            <Loader2 size={15} className="animate-spin" /> Résolution...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} /> Marquer résolue
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setConfirmDeleteId(detailAlert.id);
                        setDetailAlert(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-sm transition-colors"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()}
      </AnimatePresence>

      {/* ── Modal Suppression ── */}
      <AnimatePresence>
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (!isDeleting) setConfirmDeleteId(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6"
            >
              <div className="inline-flex p-3.5 bg-red-100 text-red-600 rounded-2xl mb-4">
                <Trash2 size={22} />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1">Supprimer cette alerte ?</h3>
              <p className="text-sm text-gray-500 mb-5">
                Cette action est définitive et ne peut pas être annulée.
              </p>
              <div className="flex gap-3">
                <button
                  disabled={isDeleting}
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-200 disabled:opacity-60 transition-colors"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} /> Supprimer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertDashboard;