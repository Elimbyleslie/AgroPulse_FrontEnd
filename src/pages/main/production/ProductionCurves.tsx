/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  RefreshCw,
  ChevronRight,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Layers,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

import {
  fetchProductions,
  fetchProductionStats,
} from "../../../store/production/action";

import {
  selectProductions,
  selectProductionsLoading,
  selectProductionStatsData,
} from "../../../features/productions/productionSelectors";

import { selectCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import type { FetchProduction } from "../../../models/production";

// ── Palette ────────────────────────────────────────────────────────────────────
const COLORS = {
  vert: "#16A34A",
  bleu: "#607FE2",
  jaune: "#E3BA3E",
  rouge: "#EC1313",
  dark_vert: "#084C29",
  darkBleu: "#607FE2",
};

const CHARt_COLORS = [
  COLORS.vert, COLORS.bleu, COLORS.jaune, COLORS.rouge,
  "#8B5CF6", "#F97316", "#06B6D4", "#EC4899",
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtNum = (n?: number | null, dec = 1) =>
  n != null ? Number(n).toFixed(dec).replace(".", ",") : "—";

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; bg: string; trend?: "up" | "down"; trendVal?: string;
}> = ({ label, value, sub, icon, bg, trend, trendVal }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-xl font-black text-gray-900 leading-none truncate">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
    {trend && trendVal && (
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trend === "up" ? "bg-emerald-50 text-vert" : "bg-red-50 text-rouge"}`}>
        {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trendVal}
      </div>
    )}
  </div>
);

// ── Chart Card ─────────────────────────────────────────────────────────────────
const ChartCard: React.FC<{
  title: string; subtitle?: string; icon: React.ReactNode; children: React.ReactNode;
}> = ({ title, subtitle, icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ── Période selector ──────────────────────────────────────────────────────────
type Period = "7d" | "30d" | "90d" | "1y" | "all";

const PeriodBtn: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${active ? "bg-vert text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
  >
    {label}
  </button>
);

// ── Data Processing ───────────────────────────────────────────────────────────
function filterByPeriod(prods: FetchProduction[], period: Period): FetchProduction[] {
  if (period === "all") return prods;
  const now = new Date();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
  const from = new Date(now.getTime() - days * 86400000);
  return prods.filter((p) => p.date && new Date(p.date) >= from);
}

function groupByDay(prods: FetchProduction[]): { labels: string[]; data: number[] } {
  const map: Record<string, number> = {};
  prods.forEach((p) => {
    if (!p.date) return;
    const key = p.date.slice(0, 10);
    map[key] = (map[key] || 0) + p.quantity;
  });
  const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  return {
    labels: sorted.map(([d]) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })),
    data: sorted.map(([, v]) => v),
  };
}

function groupByWeek(prods: FetchProduction[]): { labels: string[]; data: number[] } {
  const map: Record<string, number> = {};
  prods.forEach((p) => {
    if (!p.date) return;
    const d = new Date(p.date);
    const week = `${d.getFullYear()}-S${Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7).toString().padStart(2, "0")}`;
    map[week] = (map[week] || 0) + p.quantity;
  });
  const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  return { labels: sorted.map(([k]) => k), data: sorted.map(([, v]) => v) };
}

function groupByMonth(prods: FetchProduction[]): { labels: string[]; data: number[] } {
  const map: Record<string, number> = {};
  prods.forEach((p) => {
    if (!p.date) return;
    const key = p.date.slice(0, 7);
    map[key] = (map[key] || 0) + p.quantity;
  });
  const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  return {
    labels: sorted.map(([k]) => {
      const [y, m] = k.split("-");
      return new Date(Number(y), Number(m) - 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    }),
    data: sorted.map(([, v]) => v),
  };
}

function groupByType(prods: FetchProduction[]): { labels: string[]; data: number[]; colors: string[] } {
  const map: Record<string, number> = {};
  prods.forEach((p) => { map[p.type] = (map[p.type] || 0) + p.quantity; });
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return {
    labels: sorted.map(([k]) => k),
    data: sorted.map(([, v]) => v),
    colors: sorted.map((_, i) => CHARt_COLORS[i % CHARt_COLORS.length]),
  };
}

function groupBytypePerMonth(prods: FetchProduction[]): {
  months: string[]; types: string[]; datasets: { type: string; data: number[]; color: string }[]
} {
  const months = [...new Set(prods.map((p) => p.date?.slice(0, 7)).filter(Boolean))].sort() as string[];
  const types = [...new Set(prods.map((p) => p.type))];
  const monthLabels = months.map((k) => {
    const [y, m] = k.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
  });
  const datasets = types.map((type, i) => ({
    type,
    color: CHARt_COLORS[i % CHARt_COLORS.length],
    data: months.map((month) =>
      prods.filter((p) => p.type === type && p.date?.startsWith(month)).reduce((s, p) => s + p.quantity, 0)
    ),
  }));
  return { months: monthLabels, types, datasets };
}

function gradeDistribution(prods: FetchProduction[]) {
  const map: Record<string, number> = { A: 0, B: 0, C: 0, "—": 0 };
  prods.forEach((p) => { map[p.qualityGrade || "—"] = (map[p.qualityGrade || "—"] || 0) + 1; });
  return map;
}

// ── Main Component ─────────────────────────────────────────────────────────────
const ProductionCurves: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const currentUser = useAppSelector((state) => state.authentification?.auth?.user);
  const productions = useAppSelector(selectProductions);
  const stats = useAppSelector(selectProductionStatsData);
  const isLoading = useAppSelector(selectProductionsLoading);

  const farmId = currentFarm?.id;
  const [period, setPeriod] = useState<Period>("30d");
  const [timeGranularity, settimeGranularity] = useState<"day" | "week" | "month">("day");

  useEffect(() => {
    if (!farmId && currentUser?.id) dispatch(getUserFarms());
  }, [dispatch, farmId, currentUser?.id]);

  useEffect(() => {
    if (farmId) {
      dispatch(fetchProductions({ farmId, limit: 500 }));
      dispatch(fetchProductionStats({ farmId }));
    }
  }, [dispatch, farmId]);

  const refresh = useCallback(() => {
    if (farmId) {
      dispatch(fetchProductions({ farmId, limit: 500 }));
      dispatch(fetchProductionStats({ farmId }));
      toast.info("Données actualisées");
    }
  }, [dispatch, farmId]);

  const filtered = useMemo(() => filterByPeriod(productions, period), [productions, period]);

  const timeSeries = useMemo(() => {
    if (timeGranularity === "day") return groupByDay(filtered);
    if (timeGranularity === "week") return groupByWeek(filtered);
    return groupByMonth(filtered);
  }, [filtered, timeGranularity]);

  const typeData = useMemo(() => groupByType(filtered), [filtered]);
  const typePerMonth = useMemo(() => groupBytypePerMonth(filtered), [filtered]);
  const grades = useMemo(() => gradeDistribution(filtered), [filtered]);

  const totalFiltered = filtered.reduce((s, p) => s + p.quantity, 0);
  const avgPerDay = timeSeries.data.length > 0 ? totalFiltered / timeSeries.data.length : 0;
  const maxDay = timeSeries.data.length > 0 ? Math.max(...timeSeries.data) : 0;
  const alltypes = [...new Set(productions.map((p) => p.type))];

  // Comparaison période courante vs précédente
  const prevFiltered = useMemo(() => {
    if (period === "all") return [];
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const now = new Date();
    const from = new Date(now.getTime() - days * 2 * 86400000);
    const to = new Date(now.getTime() - days * 86400000);
    return productions.filter((p) => p.date && new Date(p.date) >= from && new Date(p.date) < to);
  }, [productions, period]);
  const prevtotal = prevFiltered.reduce((s, p) => s + p.quantity, 0);
  const growthPct = prevtotal > 0 ? ((totalFiltered - prevtotal) / prevtotal) * 100 : null;

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 11 }, color: "#9CA3AF", maxRotation: 45 } },
      y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 11 }, color: "#9CA3AF" } },
    },
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false}
        newestOnTop closeOnClick pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium" />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Production</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Courbes & Statistiques</span>
            </div>
            <h1 className="text-2xl font-black text-darktext tracking-tight">Courbes & Statistiques</h1>
            <p className="text-sm text-gray-400 mt-0.5">Visualisation temporelle et analyse statistique</p>
          </div>
          <button onClick={refresh} className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ── Sélecteur de période ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Période :</span>
          {([["7d", "7 jours"], ["30d", "30 jours"], ["90d", "3 mois"], ["1y", "1 an"], ["all", "tout"]] as [Period, string][]).map(([p, l]) => (
            <PeriodBtn key={p} active={period === p} label={l} onClick={() => setPeriod(p)} />
          ))}
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Production période" value={fmtNum(totalFiltered)} sub="unités produites"
            icon={<TrendingUp className="w-5 h-5 text-vert" />} bg="bg-emerald-50"
            trend={growthPct != null ? (growthPct >= 0 ? "up" : "down") : undefined}
            trendVal={growthPct != null ? `${Math.abs(growthPct).toFixed(0)}%` : undefined} />
          <KpiCard label="Moyenne / période" value={fmtNum(avgPerDay)} sub={`par ${timeGranularity === "day" ? "jour" : timeGranularity === "week" ? "semaine" : "mois"}`}
            icon={<BarChart3 className="w-5 h-5 text-bleu" />} bg="bg-blue-50" />
          <KpiCard label="Pic de production" value={fmtNum(maxDay)} sub="meilleure période"
            icon={<Calendar className="w-5 h-5 text-jaune" />} bg="bg-yellow-50" />
          <KpiCard label="types suivis" value={alltypes.length} sub="types distincts"
            icon={<Layers className="w-5 h-5 text-amber-500" />} bg="bg-amber-50" />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement des données…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <LineChart className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">Aucune donnée sur cette période</p>
            <p className="text-sm">Sélectionnez une autre période ou ajoutez des productions</p>
          </div>
        ) : (
          <>
            {/* ── Courbe temporelle ── */}
            <ChartCard
              title="Évolution temporelle de la production"
              subtitle={`Quantité par ${timeGranularity === "day" ? "jour" : timeGranularity === "week" ? "semaine" : "mois"}`}
              icon={<TrendingUp className="w-5 h-5" />}
            >
              {/* Granularité */}
              <div className="flex items-center gap-2 mb-4">
                {([["day", "Jour"], ["week", "Semaine"], ["month", "Mois"]] as const).map(([g, l]) => (
                  <button key={g} onClick={() => settimeGranularity(g)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${timeGranularity === g ? "bg-vert text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {l}
                  </button>
                ))}
              </div>

              <div style={{ height: 260 }}>
                <Line
                  data={{
                    labels: timeSeries.labels,
                    datasets: [{
                      label: "Production",
                      data: timeSeries.data,
                      borderColor: COLORS.vert,
                      backgroundColor: "rgba(22,163,74,0.08)",
                      borderWidth: 2,
                      pointRadius: timeSeries.data.length > 60 ? 0 : 3,
                      pointBackgroundColor: COLORS.vert,
                      fill: true,
                      tension: 0.4,
                    }],
                  }}
                  options={{
                    ...chartDefaults,
                    plugins: {
                      ...chartDefaults.plugins,
                      tooltip: { callbacks: { label: (ctx) => ` ${fmtNum(ctx.parsed.y as number)} unités` } },
                    },
                  }}
                />
              </div>
            </ChartCard>

            {/* ── Barres par type + Donut ── */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Barres comparaison par type */}
              <ChartCard
                title="Production par type"
                subtitle="Comparaison des volumes"
                icon={<BarChart3 className="w-5 h-5" />}
              >
                {/* Légende custom */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {typeData.labels.slice(0, 6).map((label, i) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: typeData.colors[i] }} />
                      <span className="text-xs text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 220 }}>
                  <Bar
                    data={{
                      labels: typeData.labels,
                      datasets: [{
                        label: "Quantité",
                        data: typeData.data,
                        backgroundColor: typeData.colors,
                        borderRadius: 6,
                        borderSkipped: false,
                      }],
                    }}
                    options={{
                      ...chartDefaults,
                      plugins: {
                        ...chartDefaults.plugins,
                        tooltip: { callbacks: { label: (ctx) => ` ${fmtNum(ctx.parsed.y as number)} unités` } },
                      },
                    }}
                  />
                </div>
              </ChartCard>

              {/* Donut répartition */}
              <ChartCard
                title="Répartition des types"
                subtitle="Part relative de chaque type"
                icon={<PieChart className="w-5 h-5" />}
              >
                {/* Légende custom */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {typeData.labels.slice(0, 6).map((label, i) => {
                    const total = typeData.data.reduce((s, v) => s + v, 0);
                    const pct = total > 0 ? ((typeData.data[i] / total) * 100).toFixed(0) : 0;
                    return (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: typeData.colors[i] }} />
                        <span className="text-xs text-gray-600">{label} {pct}%</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ height: 200 }} className="flex justify-center">
                  <Doughnut
                    data={{
                      labels: typeData.labels,
                      datasets: [{
                        data: typeData.data,
                        backgroundColor: typeData.colors,
                        borderWidth: 2,
                        borderColor: "#fff",
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => {
                              const total = (ctx.dataset.data as number[]).reduce((s, v) => s + v, 0);
                              const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                              return ` ${ctx.label}: ${fmtNum(ctx.parsed)} (${pct}%)`;
                            },
                          },
                        },
                      },
                      cutout: "65%",
                    }}
                  />
                </div>
              </ChartCard>
            </div>

            {/* ── Multi-type par mois ── */}
            {typePerMonth.datasets.length > 1 && (
              <ChartCard
                title="Production multi-types par mois"
                subtitle="Évolution comparative de chaque type"
                icon={<LineChart className="w-5 h-5" />}
              >
                <div className="flex flex-wrap gap-3 mb-4">
                  {typePerMonth.datasets.map((ds) => (
                    <div key={ds.type} className="flex items-center gap-1.5">
                      <div className="w-6 h-0.5 rounded-full" style={{ background: ds.color }} />
                      <span className="text-xs text-gray-600">{ds.type}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 260 }}>
                  <Line
                    data={{
                      labels: typePerMonth.months,
                      datasets: typePerMonth.datasets.map((ds) => ({
                        label: ds.type,
                        data: ds.data,
                        borderColor: ds.color,
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: ds.color,
                        tension: 0.3,
                      })),
                    }}
                    options={{
                      ...chartDefaults,
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              </ChartCard>
            )}

            {/* ── Grade distribution ── */}
            <ChartCard
              title="Distribution des grades qualité"
              subtitle="Répartition par niveau de qualité"
              icon={<Award className="w-5 h-5" />}
            >
              <div className="grid grid-cols-4 gap-3">
                {[
                  { grade: "A", color: "bg-emerald-100 text-emerald-700 border-emerald-200", bar: "bg-vert" },
                  { grade: "B", color: "bg-blue-100 text-blue-700 border-blue-200", bar: "bg-bleu" },
                  { grade: "C", color: "bg-amber-100 text-amber-700 border-amber-200", bar: "bg-jaune" },
                  { grade: "—", color: "bg-gray-100 text-gray-500 border-gray-200", bar: "bg-gray-300" },
                ].map(({ grade, color, bar }) => {
                  const count = grades[grade] || 0;
                  const total = Object.values(grades).reduce((s, v) => s + v, 0);
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={grade} className={`rounded-2xl p-4 border ${color.split(" ").filter(c => c.startsWith("border")).join(" ")} ${color.split(" ").filter(c => c.startsWith("bg")).join(" ")}`}>
                      <p className={`text-2xl font-black ${color.split(" ").filter(c => c.startsWith("text")).join(" ")}`}>
                        {grade === "—" ? "—" : `Grade ${grade}`}
                      </p>
                      <p className={`text-3xl font-black mt-1 ${color.split(" ").filter(c => c.startsWith("text")).join(" ")}`}>{count}</p>
                      <p className={`text-xs mt-0.5 opacity-70 ${color.split(" ").filter(c => c.startsWith("text")).join(" ")}`}>{pct.toFixed(0)}% du total</p>
                      <div className="mt-2 w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

            {/* ── Stats détaillées par type ── */}
            {stats?.groupedStats && stats.groupedStats.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80 flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-700">Statistiques détaillées par type</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {stats.groupedStats.map((s, i) => {
                    const color = CHARt_COLORS[i % CHARt_COLORS.length];
                    const maxSum = Math.max(...stats.groupedStats.map((x) => x._sum.quantity || 0), 1);
                    return (
                      <div key={`${s.type}-${i}`} className="grid grid-cols-[1fr_100px_100px_100px_80px] gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                            <p className="font-semibold text-gray-800 text-sm">{s.type}</p>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${((s._sum.quantity || 0) / maxSum) * 100}%`, background: color }} />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{fmtNum(s._sum.quantity)}</p>
                          <p className="text-xs text-gray-400">{s.unit} total</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">{fmtNum(s._avg.quantity)}</p>
                          <p className="text-xs text-gray-400">moyenne</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">{s._count.id}</p>
                          <p className="text-xs text-gray-400">entrées</p>
                        </div>
                        <div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${s.category === "Product" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                            {s.category === "Product" ? "Produit" : "S-produit"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  <p className="text-xs text-gray-400">{stats.groupedStats.length} type{stats.groupedStats.length > 1 ? "s" : ""} analysé{stats.groupedStats.length > 1 ? "s" : ""}</p>
                  <p className="text-xs text-gray-400">total global : <span className="font-semibold text-gray-600">{fmtNum(stats.total.totalQuantity)}</span></p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ProductionCurves;