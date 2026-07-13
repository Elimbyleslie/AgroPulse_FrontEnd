/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Award,
  ChevronRight,
  Activity,
  Layers,
  BarChart3,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchProductions } from "../../../store/production/action";
import { selectCurrentFarm } from "../../../store/farm/slice";
import type { FetchProduction } from "../../../models/production";

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

const fmtDateISO = (d: Date) => d.toISOString().slice(0, 10);

const fmtShort = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

const fmtMonth = (d: Date) =>
  d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
const addMonths = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

const pctChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const COLORS = [
  "#16A34A",
  "#607FE2",
  "#E3BA3E",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

const QUALITY_COLORS: Record<string, string> = {
  A: "#16A34A",
  B: "#607FE2",
  C: "#E3BA3E",
  "—": "#e5e7eb",
};

// ── Calculs analytiques depuis les productions brutes ─────────────────────────

interface DayPoint {
  date: string;
  quantity: number;
  count: number;
}
interface TypeStat {
  type: string;
  unit: string;
  quantity: number;
  count: number;
  avgQty: number;
}
interface OriginStat {
  name: string;
  kind: "animal" | "lot" | "herd";
  quantity: number;
  count: number;
}
interface QualityStat {
  grade: string;
  count: number;
  pct: number;
}

const computeAnalytics = (data: FetchProduction[]) => {
  const byDay: Record<string, DayPoint> = {};
  data.forEach((p) => {
    const day = fmtDateISO(new Date(p.date));
    if (!byDay[day]) byDay[day] = { date: day, quantity: 0, count: 0 };
    byDay[day].quantity += p.quantity ?? 0;
    byDay[day].count += 1;
  });
  const dailySeries = Object.values(byDay).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // Par type
  const byType: Record<string, TypeStat> = {};
  data.forEach((p) => {
    const key = p.Type || "Inconnu";
    if (!byType[key])
      byType[key] = {
        type: key,
        unit: p.unit || "",
        quantity: 0,
        count: 0,
        avgQty: 0,
      };
    byType[key].quantity += p.quantity ?? 0;
    byType[key].count += 1;
  });
  const typeStats = Object.values(byType)
    .map((t) => ({ ...t, avgQty: t.count > 0 ? t.quantity / t.count : 0 }))
    .sort((a, b) => b.quantity - a.quantity);

  // Classement par origine
  const byOrigin: Record<string, OriginStat> = {};
  data.forEach((p) => {
    const entry = p.animal
      ? { name: p.animal.name, kind: "animal" as const }
      : p.lot
        ? { name: p.lot.name, kind: "lot" as const }
        : p.herd
          ? { name: p.herd.name, kind: "herd" as const }
          : null;
    if (!entry) return;
    const key = `${entry.kind}:${entry.name}`;
    if (!byOrigin[key])
      byOrigin[key] = {
        name: entry.name,
        kind: entry.kind,
        quantity: 0,
        count: 0,
      };
    byOrigin[key].quantity += p.quantity ?? 0;
    byOrigin[key].count += 1;
  });
  const originStats = Object.values(byOrigin)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);

  // Qualité
  const qualityMap: Record<string, number> = {};
  data.forEach((p) => {
    const g = p.qualityGrade || "—";
    qualityMap[g] = (qualityMap[g] || 0) + 1;
  });
  const total = data.length;
  const qualityStats: QualityStat[] = Object.entries(qualityMap)
    .map(([grade, count]) => ({
      grade,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Totaux
  const totalQty = data.reduce((s, p) => s + (p.quantity ?? 0), 0);

  return {
    dailySeries,
    typeStats,
    originStats,
    qualityStats,
    totalQty,
    totalRecords: data.length,
  };
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-[120px]">
      <p className="font-bold text-gray-700 mb-1.5">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: e.color || e.fill }}
            />
            <span className="text-gray-500">{e.name}</span>
          </div>
          <span className="font-bold text-gray-800">
            {typeof e.value === "number" ? e.value.toFixed(1) : e.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Section header ─────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  sub?: string;
}> = ({ icon, title, sub }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-gray-800">{title}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

// ── KPI Card avec tendance ─────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  colorClass: string;
  change?: number; // % vs période précédente
}> = ({ label, value, sub, icon, colorClass, change }) => {
  const isUp = change !== undefined && change > 0;
  const isDown = change !== undefined && change < 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass}`}
        >
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              isUp
                ? "bg-emerald-50 text-emerald-600"
                : isDown
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            {isUp ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : isDown ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

// ── Filtre Switch (Type / Origine) ────────────────────────────────────────────
type FilterMode = "type" | "origin";

const FilterSwitch: React.FC<{
  mode: FilterMode;
  onChange: (m: FilterMode) => void;
}> = ({ mode, onChange }) => (
  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
    {(["type", "origin"] as const).map((m) => (
      <button
        key={m}
        onClick={() => onChange(m)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
          mode === m
            ? "bg-white text-gray-800 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {m === "type" ? (
          <>
            <BarChart3 className="w-3 h-3" /> Par type
          </>
        ) : (
          <>
            <Users className="w-3 h-3" /> Par origine
          </>
        )}
      </button>
    ))}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const PerformancePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const farmId = currentFarm?.id;

  // Période courante = mois en cours
  const [refMonth, setRefMonth] = useState<Date>(new Date());
  const [filterMode, setFilterMode] = useState<FilterMode>("type");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Données brutes
  const [currentData, setCurrentData] = useState<FetchProduction[]>([]);
  const [prevData, setPrevData] = useState<FetchProduction[]>([]);

  // Fetch toutes les productions d'une période (avec pagination auto)
  const fetchAll = useCallback(
    async (start: Date, end: Date): Promise<FetchProduction[]> => {
      if (!farmId) return [];
      const result: FetchProduction[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const res: any = await dispatch(
          fetchProductions({
            farmId,
            startDate: fmtDateISO(start),
            endDate: fmtDateISO(end),
            page: Number(page),
            limit: 10,
          }),
        ).unwrap();

        console.log("🔍 fetchAll raw response:", JSON.stringify(res, null, 2));

        const items = res?.data?.productions ?? res?.productions ?? [];
        result.push(...items);

        const pagination = res?.data?.pagination ?? res?.pagination;
        hasMore = pagination ? page < pagination.totalPages : false;
        page++;
      }
      return result;
    },
    [dispatch, farmId],
  );

  const loadPeriod = useCallback(async () => {
    setIsLoading(true);
    try {
      const curStart = startOfMonth(refMonth);
      const curEnd = endOfMonth(refMonth);
      const prevStart = startOfMonth(addMonths(refMonth, -1));
      const prevEnd = endOfMonth(addMonths(refMonth, -1));

      const [cur, prev] = await Promise.all([
        fetchAll(curStart, curEnd),
        fetchAll(prevStart, prevEnd),
      ]);

      setCurrentData(cur);
      setPrevData(prev);
    } catch {
      toast.error("Impossible de charger les données de performance");
    } finally {
      setIsLoading(false);
    }
  }, [fetchAll, refMonth]);

  useEffect(() => {
    loadPeriod();
  }, [loadPeriod]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPeriod();
    setIsRefreshing(false);
    toast.info("Performances actualisées");
  };

  // Analytics
  const current = useMemo(() => computeAnalytics(currentData), [currentData]);
  const previous = useMemo(() => computeAnalytics(prevData), [prevData]);

  const qtyChange = pctChange(current.totalQty, previous.totalQty);
  const countChange = pctChange(current.totalRecords, previous.totalRecords);

  // Données chart évolution quotidienne avec moving avg
  const dailyChartData = useMemo(
    () =>
      current.dailySeries.map((d) => ({
        ...d,
        label: fmtShort(d.date),
      })),
    [current.dailySeries],
  );

  // Données chart classement (type ou origine)
  const rankingData = useMemo(() => {
    if (filterMode === "type") {
      return current.typeStats.slice(0, 6).map((t, i) => ({
        name: t.type,
        quantity: Math.round(t.quantity * 10) / 10,
        count: t.count,
        unit: t.unit,
        fill: COLORS[i % COLORS.length],
      }));
    }
    return current.originStats.slice(0, 6).map((o, i) => ({
      name: o.name,
      quantity: Math.round(o.quantity * 10) / 10,
      count: o.count,
      unit: "",
      fill: COLORS[i % COLORS.length],
      kind: o.kind,
    }));
  }, [filterMode, current]);

  // Grade A rate
  const gradeAItem = current.qualityStats.find((q) => q.grade === "A");
  const gradeAPct = gradeAItem?.pct ?? 0;
  const gradeAChange = pctChange(
    gradeAItem?.count ?? 0,
    previous.qualityStats.find((q) => q.grade === "A")?.count ?? 0,
  );

  const prevMonthLabel = fmtMonth(addMonths(refMonth, -1));

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
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Productions</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">
                Suivi des performances
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Performances
            </h1>
            <p className="text-sm text-gray-400">{currentFarm?.name}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation mois */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setRefMonth((m) => addMonths(m, -1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 capitalize min-w-[120px] text-center">
                  {fmtMonth(refMonth)}
                </span>
              </div>
              <button
                onClick={() => setRefMonth((m) => addMonths(m, 1))}
                disabled={
                  fmtDateISO(startOfMonth(addMonths(refMonth, 1))) >
                  fmtDateISO(new Date())
                }
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Calcul des performances…</span>
          </div>
        ) : (
          <>
            {/* ── KPIs comparatifs ── */}
            <div>
              <p className="text-xs text-gray-400 mb-3 font-medium">
                vs {prevMonthLabel}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard
                  label="Quantité produite"
                  value={current.totalQty.toFixed(1)}
                  sub="toutes unités"
                  icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
                  colorClass="bg-emerald-50"
                  change={qtyChange}
                />
                <KpiCard
                  label="Enregistrements"
                  value={current.totalRecords}
                  sub="productions saisies"
                  icon={<Layers className="w-4 h-4 text-blue-600" />}
                  colorClass="bg-blue-50"
                  change={countChange}
                />
                <KpiCard
                  label="Grade A"
                  value={`${gradeAPct}%`}
                  sub={`${gradeAItem?.count ?? 0} productions`}
                  icon={<Award className="w-4 h-4 text-jaune" />}
                  colorClass="bg-amber-50"
                  change={gradeAChange}
                />
                <KpiCard
                  label="Types distincts"
                  value={current.typeStats.length}
                  sub="types de production"
                  icon={<Activity className="w-4 h-4 text-violet-600" />}
                  colorClass="bg-violet-50"
                />
              </div>
            </div>

            {/* ── Évolution quotidienne ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <SectionHeader
                icon={<TrendingUp className="w-4 h-4" />}
                title="Évolution jour par jour"
                sub={`Quantité totale produite — ${fmtMonth(refMonth)}`}
              />

              {dailyChartData.length === 0 ? (
                <div className="flex items-center justify-center py-14 text-gray-300 text-sm">
                  Aucune donnée pour cette période
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={dailyChartData}
                    margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f3f4f6"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      width={35}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="quantity"
                      name="Quantité"
                      stroke="#16A34A"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "#16A34A",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Nb entrées"
                      stroke="#607FE2"
                      strokeWidth={1.5}
                      dot={false}
                      strokeDasharray="4 3"
                      activeDot={{ r: 3, fill: "#607FE2" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Classement + Qualité ── */}
            <div className="grid md:grid-cols-[2fr_1fr] gap-5">
              {/* Classement */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <SectionHeader
                    icon={<BarChart3 className="w-4 h-4" />}
                    title="Classement"
                    sub="Top producteurs de la période"
                  />
                  <FilterSwitch mode={filterMode} onChange={setFilterMode} />
                </div>

                {rankingData.length === 0 ? (
                  <div className="flex items-center justify-center py-14 text-gray-300 text-sm">
                    Aucune donnée
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={rankingData}
                        barSize={24}
                        layout="vertical"
                        margin={{ left: 8, right: 8 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f3f4f6"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 10, fill: "#6b7280" }}
                          axisLine={false}
                          tickLine={false}
                          width={80}
                        />
                        <Tooltip
                          content={<ChartTooltip />}
                          cursor={{ fill: "#f9fafb" }}
                        />
                        <Bar
                          dataKey="quantity"
                          name="Quantité"
                          radius={[0, 6, 6, 0]}
                        >
                          {rankingData.map((_, i) => (
                            <Cell key={i} fill={rankingData[i].fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Table ranking */}
                    <div className="mt-4 space-y-2">
                      {rankingData.map((d, i) => {
                        const max = rankingData[0]?.quantity || 1;
                        const pct = (d.quantity / max) * 100;
                        return (
                          <div key={d.name} className="flex items-center gap-3">
                            <span className="w-5 text-xs font-bold text-gray-300 flex-shrink-0">
                              #{i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-semibold text-gray-700 truncate">
                                  {d.name}
                                </span>
                                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                  {d.quantity} {d.unit} · {d.count}×
                                </span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    background: d.fill,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Qualité */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <SectionHeader
                  icon={<Award className="w-4 h-4" />}
                  title="Taux de qualité"
                  sub="Répartition des grades"
                />

                {current.qualityStats.length === 0 ? (
                  <div className="flex items-center justify-center py-14 text-gray-300 text-sm">
                    Aucune donnée
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={current.qualityStats}
                          dataKey="count"
                          nameKey="grade"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                        >
                          {current.qualityStats.map((q, i) => (
                            <Cell
                              key={i}
                              fill={
                                QUALITY_COLORS[q.grade] ||
                                COLORS[i % COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: any, name: any) => [
                            `${val} productions`,
                            `Grade ${name}`,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-2 mt-2">
                      {current.qualityStats.map((q) => (
                        <div
                          key={q.grade}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{
                                background:
                                  QUALITY_COLORS[q.grade] || "#9ca3af",
                              }}
                            />
                            <span className="text-xs font-semibold text-gray-600">
                              {q.grade === "—"
                                ? "Non défini"
                                : `Grade ${q.grade}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {q.count}×
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                              {q.pct}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comparaison mois précédent */}
                    {previous.qualityStats.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-2">
                          vs {prevMonthLabel}
                        </p>
                        {["A", "B", "C"].map((grade) => {
                          const cur = current.qualityStats.find(
                            (q) => q.grade === grade,
                          );
                          const prev = previous.qualityStats.find(
                            (q) => q.grade === grade,
                          );
                          const delta = pctChange(
                            cur?.count ?? 0,
                            prev?.count ?? 0,
                          );
                          if (!cur && !prev) return null;
                          return (
                            <div
                              key={grade}
                              className="flex items-center justify-between mb-1"
                            >
                              <span className="text-xs text-gray-500">
                                Grade {grade}
                              </span>
                              <div
                                className={`flex items-center gap-1 text-xs font-bold ${
                                  delta > 0
                                    ? "text-emerald-600"
                                    : delta < 0
                                      ? "text-red-500"
                                      : "text-gray-400"
                                }`}
                              >
                                {delta > 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : delta < 0 ? (
                                  <TrendingDown className="w-3 h-3" />
                                ) : (
                                  <Minus className="w-3 h-3" />
                                )}
                                {delta > 0 ? "+" : ""}
                                {delta}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── Tableau comparatif par type ── */}
            {current.typeStats.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <SectionHeader
                    icon={<Layers className="w-4 h-4" />}
                    title="Comparaison par type"
                    sub={`${fmtMonth(refMonth)} vs ${prevMonthLabel}`}
                  />
                </div>

                {/* Table header */}
                <div className="grid grid-cols-[1fr_100px_110px_100px_100px] gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                  {[
                    "Type",
                    "Qté actuelle",
                    "Qté précédente",
                    "Variation",
                    "Nb d'entrées",
                  ].map((h) => (
                    <p
                      key={h}
                      className="text-xs font-bold text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </p>
                  ))}
                </div>

                <div className="divide-y divide-gray-50">
                  {current.typeStats.map((t) => {
                    const prev = previous.typeStats.find(
                      (p) => p.type === t.type,
                    );
                    const delta = pctChange(t.quantity, prev?.quantity ?? 0);
                    const isUp = delta > 0;
                    const isDown = delta < 0;

                    return (
                      <div
                        key={t.type}
                        className="grid grid-cols-[1fr_100px_100px_100px_80px] gap-4 px-5 py-3.5 hover:bg-gray-50 transition items-center"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                          <p className="text-sm font-semibold text-gray-800">
                            {t.type}
                          </p>
                          <span className="text-xs text-gray-400">
                            {t.unit}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-700">
                          {t.quantity.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {prev ? prev.quantity.toFixed(1) : "—"}
                        </p>
                        <div
                          className={`flex items-center gap-1 text-xs font-bold ${
                            isUp
                              ? "text-emerald-600"
                              : isDown
                                ? "text-red-500"
                                : "text-gray-400"
                          }`}
                        >
                          {isUp ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : isDown ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                          {delta > 0 ? "+" : ""}
                          {delta}%
                        </div>
                        <p className="text-sm text-gray-400">{t.count}×</p>
                      </div>
                    );
                  })}
                </div>

                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    {current.typeStats.length} types de production ce mois
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PerformancePage;
