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
} from "lucide-react";
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
  return "unknown"; // ← plus ambigu avec null
};

const ALERT_TYPE_CONFIG: Record<
  AlertType,
  {
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
  } | null
> = {
  vaccination: {
    icon: Syringe,
    bgClass: "bg-blue-100",
    textClass: "text-blue-600",
  },
  health: {
    icon: Heart,
    bgClass: "bg-orange-100",
    textClass: "text-orange-600",
  },
  death: {
    icon: Skull,
    bgClass: "bg-gray-200",
    textClass: "text-gray-600"
  },
  unknown:null ,
};

// Config par statut
const STATUS_CONFIG: Record<
  AlertStatus,
  { label: string; pillClass: string; borderClass: string }
> = {
  active: {
    label: "Active",
    pillClass: "bg-red-100 text-red-600",
    borderClass: "border-l-4 border-l-red-400",
  },
  resolved: {
    label: "Résolue",
    pillClass: "bg-green-100 text-green-600",
    borderClass: "border-l-4 border-l-green-400",
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const AlertDashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  //const HEALTH_TYPES: AlertType[] = ["vaccination", "health", "death"];

const alertsList = useAppSelector((state) => {
  const raw = state.alerts.alerts;
  const all = Array.isArray(raw) ? raw : [];
  return all.filter((alert) => detectAlertType(alert.title) !== "unknown"); // ← ici
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

  // Remontée erreurs store
  useEffect(() => {
    if (storeError) {
      toast.error(storeError);
      dispatch(clearError());
    }
  }, [storeError, dispatch]);

  // Hydratation ferme
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

  // Chargement alertes
  const loadAlerts = useCallback(() => {
    if (farmId) dispatch(fetchAlertsByFarmId(farmId));
  }, [dispatch, farmId]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Stats
  const stats = useMemo(
    () => ({
      total: alertsList.length,
      active: alertsList.filter((alert) => alert.status === "active").length,
      resolved: alertsList.filter((alert) => alert.status === "resolved")
        .length,
    }),
    [alertsList],
  );

  // Filtrage
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

  // Résoudre une alerte
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

  // Supprimer une alerte
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

  // Gardes
  if (isLoadingFarm)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-500">
        <div className="w-11 h-11 rounded-full border-[3px] border-gray-200 border-t-red-400 animate-spin" />
        <p className="font-semibold">Chargement de la ferme...</p>
      </div>
    );

  if (!farmId)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-5 bg-orange-50 rounded-2xl text-orange-500">
          <AlertTriangle size={32} />
        </div>
        <p className="font-bold text-gray-700">Aucune ferme sélectionnée</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-gray-50 ">

      {/* En-tête — pas de bouton "Nouvelle alerte" */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-red-50 rounded-xl text-red-500">
          <Bell size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Alertes</h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {currentFarm?.name ?? ""} • Alertes santé — Vaccins, Maladies, Décès
          </p>
        </div>
      </div>

      {/* Bannière alertes actives */}
      {stats.active > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="p-2 bg-red-500 text-white rounded-xl  animate-pulse">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-sm font-black text-red-600">
              {stats.active} alerte{stats.active > 1 ? "s" : ""} active
              {stats.active > 1 ? "s" : ""} !
            </p>
            <p className="text-xs text-red-400">
              Des situations sur votre ferme nécessitent votre attention.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {!isLoading && alertsList.length > 0 && (
        <div className="grid grid-cols-3 gap-3 items-center justify-center">
          {[
            {
              key: "all",
              value: stats.total,
              label: "Total",
              colorClass: "text-gray-700",
              Icon: Shield,
            },
            {
              key: "active",
              value: stats.active,
              label: "Actives",
              colorClass: "text-red-500",
              Icon: AlertTriangle,
            },
            {
              key: "resolved",
              value: stats.resolved,
              label: "Résolues",
              colorClass: "text-green-600",
              Icon: CheckCircle2,
            },
          ].map(({ key, value, label, colorClass, Icon }) => (
            <div
              key={key}
              onClick={() => setFilterStatus(key as "all" | AlertStatus)}
              className={`bg-white rounded-2xl p-3 text-center border shadow-sm cursor-pointer hover:-translate-y-0.5 transition-all ${
                filterStatus === key
                  ? "border-2 border-red-300"
                  : "border-gray-100"
              }`}
            >
              <Icon size={16} className="mx-auto mb-1 opacity-40" />
              <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filtres par type */}
      {!isLoading && alertsList.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { key: "all", label: "Toutes", Icon: Bell },
              { key: "vaccination", label: "Vaccins", Icon: Syringe },
              { key: "health", label: "Santé", Icon: Heart },
              { key: "death", label: "Décès", Icon: Skull },
            ] as const
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === key
                  ? "bg-gray-800 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      )}

      {/* Recherche */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
            placeholder="Rechercher une alerte..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <div className="h-3 rounded-lg bg-gray-100 animate-pulse w-2/5" />
                <div className="h-3.5 rounded-lg bg-gray-100 animate-pulse w-3/4" />
                <div className="h-2.5 rounded-lg bg-gray-100 animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="p-5 bg-gray-100 rounded-2xl text-gray-300">
            <CheckCircle2 size={28} />
          </div>
          <p className="text-sm font-black text-gray-500">
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
          {filteredAlerts.map((alert) => {
            const alertType = detectAlertType(alert.title);
            const typeConfig = ALERT_TYPE_CONFIG[alertType];
            const statusConfig =
              STATUS_CONFIG[alert.status as AlertStatus] ??
              STATUS_CONFIG["active"];
            const isExpanded = expandedId === alert.id;
            const isActive = alert.status === "active";
            const isResolving = resolvingId === alert.id;

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all ${statusConfig.borderClass}`}
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                  onClick={() => setDetailAlert(alert)}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${typeConfig?.bgClass} ${typeConfig?.textClass}`}
                  >
                  </div>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide inline-flex items-center gap-1 mb-0.5 ${statusConfig.pillClass}`}
                    >
                      {isActive ? (
                        <AlertTriangle size={9} />
                      ) : (
                        <CheckCircle2 size={9} />
                      )}
                      {statusConfig.label}
                    </span>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {alert.message}
                    </p>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                      <Calendar size={9} /> {formatDate(alert.date)}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {/* ✅ Bouton résoudre — uniquement si active */}
                    {isActive && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={isResolving}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl font-bold text-[11px] transition-colors disabled:opacity-60"
                      >
                        {isResolving ? (
                          <div className="w-3 h-3 border-2 border-green-400/40 border-t-green-500 rounded-full animate-spin" />
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
                      onClick={() =>
                        setExpandedId(isExpanded ? null : alert.id)
                      }
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Clock size={10} /> Message complet
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Détail */}
      {detailAlert &&
        (() => {
          const alertType = detectAlertType(detailAlert.title) ?? "health";
          const typeConfig = ALERT_TYPE_CONFIG[alertType];
          const statusConfig =
            STATUS_CONFIG[detailAlert.status as AlertStatus] ??
            STATUS_CONFIG["active"];
          const isActive = detailAlert.status === "active";
          const isResolving = resolvingId === detailAlert.id;

          return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setDetailAlert(null)}
              />
              <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                <button
                  onClick={() => setDetailAlert(null)}
                  className="absolute top-4 right-4 z-10 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500"
                >
                  <X size={15} />
                </button>
                <div className="p-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2.5 rounded-xl ${typeConfig?.bgClass} ${typeConfig?.textClass}`}
                    >
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide inline-flex items-center gap-1 ${statusConfig.pillClass}`}
                    >
                      {isActive ? (
                        <AlertTriangle size={10} />
                      ) : (
                        <CheckCircle2 size={10} />
                      )}
                      {statusConfig.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 pr-8">
                    {detailAlert.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar size={10} /> {formatDate(detailAlert.date)}
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                    Détails
                  </p>
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
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                          Résolution...
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
              </div>
            </div>
          );
        })()}

      {/* Modal Suppression */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!isDeleting) setConfirmDeleteId(null);
            }}
          />
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <div className="inline-flex p-3.5 bg-red-100 text-red-600 rounded-2xl mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">
              Supprimer cette alerte ?
            </h3>
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
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertDashboard;
