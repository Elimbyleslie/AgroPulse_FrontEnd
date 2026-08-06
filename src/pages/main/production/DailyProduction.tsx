/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Package,
  RefreshCw,
  Award,
  Layers,
  Activity,
  ChevronRight as Arrow,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchProductions,
  fetchProductionStats,
} from "../../../store/production/action";
import {
  selectProductions,
  selectProductionsLoading,
  selectProductionStats,
} from "../../../features/productions/productionSelectors";
import { selectCurrentFarm } from "../../../store/farm/slice";
import type { FetchProduction } from "../../../models/production";
import { getUserFarms } from "../../../store/farm/action";


// ── Helpers ──────────────────────────────────────────────────────────────────
const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDateISO = (d: Date) => d.toISOString().slice(0, 10);

const fmtDayLabel = (d: Date) =>
  d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

const today = () => new Date();

const startOfDay = (d: Date) => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (d: Date) => {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const addDays = (d: Date, n: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

// Génère les 7 derniers jours pour le mini-chart
const last7Days = () =>
  Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));

const qualityColors: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
};

const CHART_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316",
];

// ── Sous-composants ───────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  colorClass: string;
}> = ({ label, value, sub, icon, trend, trendValue, colorClass }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          trend === "up" ? "bg-emerald-50 text-emerald-600" :
          trend === "down" ? "bg-red-50 text-red-500" :
          "bg-gray-100 text-gray-500"
        }`}>
          {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
          {trendValue}
        </div>
      )}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// Tooltip custom pour recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.fill }} />
          <span className="text-gray-500">{entry.name}</span>
          <span className="font-bold text-gray-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Calendrier mini (navigation journalière) ──────────────────────────────────
const DayNavigator: React.FC<{
  selected: Date;
  onChange: (d: Date) => void;
}> = ({ selected, onChange }) => {
  const days = last7Days();
  const todayStr = fmtDateISO(today());

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-700">Navigation rapide</p>
        <div className="flex gap-1">
          <button
            onClick={() => onChange(addDays(selected, -1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChange(today())}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => onChange(addDays(selected, 1))}
            disabled={fmtDateISO(selected) >= todayStr}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {days.map((d) => {
          const iso = fmtDateISO(d);
          const isSelected = iso === fmtDateISO(selected);
          const isToday = iso === todayStr;
          return (
            <button
              key={iso}
              onClick={() => onChange(d)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isSelected
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                  : isToday
                  ? "bg-emerald-50 text-emerald-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span className="capitalize">
                {d.toLocaleDateString("fr-FR", { weekday: "short" })}
              </span>
              <span className={`text-base font-black mt-0.5 ${isSelected ? "text-white" : "text-gray-800"}`}>
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        {fmtDayLabel(selected)}
      </p>
    </div>
  );
};

// ── Production row ────────────────────────────────────────────────────────────
const ProductionRow: React.FC<{ p: FetchProduction; onClick: () => void }> = ({ p, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition cursor-pointer group"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Package className="w-4 h-4 text-emerald-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{p.type}</p>
        <p className="text-xs text-gray-400">
          {p.animal?.name || p.lot?.name || p.herd?.name || "—"}
          {p.user && ` · ${p.user.userName}`}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      {p.qualityGrade && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${qualityColors[p.qualityGrade] || "bg-gray-100 text-gray-500"}`}>
          {p.qualityGrade}
        </span>
      )}
      <div className="text-right">
        <p className="text-sm font-bold text-gray-700">
          {p.quantity} <span className="text-gray-400 font-normal text-xs">{p.unit}</span>
        </p>
        <p className="text-xs text-gray-400">{fmtDate(p.date)}</p>
      </div>
      <Arrow className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition" />
    </div>
  </div>
);

// ── Detail Drawer (slide-in latéral) ─────────────────────────────────────────
const DetailDrawer: React.FC<{
  production: FetchProduction | null;
  onClose: () => void;
}> = ({ production, onClose }) => {
  if (!production) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                {production.category === "Product" ? "Produit" : "Sous-produit"}
              </span>
              <button onClick={onClose} className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <h2 className="text-2xl font-black">{production.type}</h2>
            <p className="text-4xl font-black mt-2">
              {production.quantity}
              <span className="text-lg text-emerald-100 ml-1">{production.unit}</span>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Date</p>
              <p className="text-sm font-semibold text-gray-700">{fmtDate(production.date)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Qualité</p>
              <p className="text-sm font-bold text-gray-700">
                {production.qualityGrade ? `Grade ${production.qualityGrade}` : "—"}
              </p>
            </div>
          </div>

          {(production.animal || production.lot || production.herd || production.pen) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Origine</p>
              {[
                { label: "Animal", val: production.animal?.name },
                { label: "Lot", val: production.lot?.name },
                { label: "Troupeau", val: production.herd?.name },
                { label: "Enclos", val: production.pen?.name },
              ]
                .filter((x) => x.val)
                .map(({ label, val }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-semibold text-gray-700">{val}</span>
                  </div>
                ))}
            </div>
          )}

          {production.user && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Enregistré par</p>
              <p className="text-sm font-semibold text-gray-700">{production.user.userName}</p>
              <p className="text-xs text-gray-400">{production.user.email}</p>
            </div>
          )}

          {production.notes && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-gray-600 leading-relaxed">{production.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const DailyProduction: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const productions = useAppSelector(selectProductions);
  const stats = useAppSelector(selectProductionStats);
  const isLoading = useAppSelector(selectProductionsLoading);
    const currentUser = useAppSelector((state) => state.authentification?.auth?.user);

  const farmId = currentFarm?.id;

  const [selectedDate, setSelectedDate] = useState<Date>(today());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [drawerItem, setDrawerItem] = useState<FetchProduction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  


   useEffect(() => {
      if (!farmId && currentUser?.id) {
        dispatch(getUserFarms());
      }
    }, [dispatch, farmId, currentUser?.id]);
  
    useEffect(() => {
      if (farmId) {
        dispatch(fetchProductions({ farmId, limit: 50 }));
        dispatch(fetchProductionStats({ farmId }));
      }
    }, [dispatch, farmId]);
  
   

  // Chargement des données pour la date sélectionnée
  const loadData = useCallback(
    async (date: Date, page = 1) => {
      if (!farmId) return;
      const start = fmtDateISO(startOfDay(date));
      const end = fmtDateISO(endOfDay(date));

      try {
        const result = await dispatch(
          fetchProductions({
            farmId,
            startDate: start,
            endDate: end,
            page: Number(page),
            limit: 10,
          })
        ).unwrap();

        if (result?.data.pagination) {
          setTotalPages(result.data.pagination.totalPages);
          setTotalItems(result.data.pagination.totalItems);
        }

        dispatch(fetchProductionStats({ farmId, startDate: start, endDate: end }));
      } catch {
        toast.error("Impossible de charger les productions");
      }
    },
    [dispatch, farmId]
  );

  useEffect(() => {
    setCurrentPage(1);
    loadData(selectedDate, 1);
  }, [selectedDate, loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(selectedDate, currentPage);
    setIsRefreshing(false);
    toast.info("Données actualisées");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadData(selectedDate, page);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  // Données chart : répartition par type pour la journée
  const chartData = useMemo(() => {
    if (!stats?.entities?.groupedStats) return [];
    return stats.entities.groupedStats.map((g, i) => ({
      name: g.type,
      quantité: g._sum.quantity ?? 0,
      occurrences: g._count.id,
      unit: g.unit,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [stats]);

  const isToday = fmtDateISO(selectedDate) === fmtDateISO(today());
  const dateLabel = isToday ? "Aujourd'hui" : fmtDayLabel(selectedDate);

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

      <div className="min-h-screen bg-gray-50 p-4 pt-20 flex flex-col gap-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Productions</span>
              <Arrow className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Journalière</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {dateLabel}
            </h1>
            <p className="text-sm text-gray-400">{currentFarm?.name}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── Navigateur de jours ── */}
        <DayNavigator selected={selectedDate} onChange={handleDateChange} />

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Enregistrements"
            value={totalItems}
            sub="productions du jour"
            icon={<Layers className="w-4 h-4 text-emerald-600" />}
            colorClass="bg-emerald-50"
          />
          <KpiCard
            label="Quantité totale"
            value={stats?.entities?.total?.totalQuantity?.toFixed(1) ?? "0"}
            sub="toutes unités"
            icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
            colorClass="bg-blue-50"
          />
          <KpiCard
            label="Moy. par entrée"
            value={stats?.entities?.total?.averageQuantity?.toFixed(2) ?? "0"}
            sub="quantité moyenne"
            icon={<Activity className="w-4 h-4 text-violet-600" />}
            colorClass="bg-violet-50"
          />
          <KpiCard
            label="Types distincts"
            value={stats?.entities?.groupedStats?.length ?? 0}
            sub="types enregistrés"
            icon={<Award className="w-4 h-4 text-amber-600" />}
            colorClass="bg-amber-50"
          />
        </div>

        {/* ── Chart + Liste ── */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-5">
          {/* Chart répartition par type */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-700">Répartition par type</p>
              <span className="text-xs text-gray-400">{dateLabel}</span>
            </div>

            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <Package className="w-8 h-8 mb-2" />
                <p className="text-xs">Aucune donnée</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
                    <Bar dataKey="quantité" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Légende */}
                <div className="mt-3 space-y-2">
                  {chartData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                        <span className="text-gray-600 font-medium">{d.name}</span>
                      </div>
                      <span className="text-gray-400 font-semibold">
                        {d.quantité} {d.unit} · {d.occurrences}×
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Liste des productions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">
                Productions du jour
              </p>
              <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-1 rounded-full">
                {totalItems} entrée{totalItems > 1 ? "s" : ""}
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <Spinner className="w-6 h-6" />
                <span className="text-sm">Chargement…</span>
              </div>
            ) : productions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-300">
                <Calendar className="w-10 h-10" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-400">Aucune production</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Aucune entrée enregistrée pour {isToday ? "aujourd'hui" : "cette date"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-50 flex-1">
                  {productions.map((p) => (
                    <ProductionRow
                      key={p.id}
                      p={p}
                      onClick={() => setDrawerItem(p)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Page {currentPage} sur {totalPages}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 disabled:opacity-30 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                              page === currentPage
                                ? "bg-emerald-500 text-white"
                                : "text-gray-500 hover:bg-white hover:border hover:border-gray-200"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 disabled:opacity-30 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      <DetailDrawer production={drawerItem} onClose={() => setDrawerItem(null)} />
    </>
  );
};

export default DailyProduction;