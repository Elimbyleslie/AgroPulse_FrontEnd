/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  RefreshCw, ChevronRight, Download, TrendingUp, TrendingDown,
  BarChart3, DollarSign, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, Minus,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getAllExpenses, getAllSales } from "../../../store/gestionFinanciere/action";
import { selectExpenseList, selectSaleList } from "../../../store/gestionFinanciere/slice";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import { Expense, ExpenseCategory, Sale } from "../../../models/gestionFinanciere";
import { LoadingType } from "../../../models/store";

// ── Helpers ───────────────────────────────────────────────────────────────────
const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(Math.round(n)) + " FCFA";

const fmtPct = (n: number) => (n > 0 ? "+" : "") + n.toFixed(1) + "%";

const CATEGORY_LABELS: Partial<Record<ExpenseCategory, string>> = {
  [ExpenseCategory.FEED]: "Alimentation",
  [ExpenseCategory.LABOR]: "Main d'œuvre",
  [ExpenseCategory.VETERINARY]: "Vétérinaire",
  [ExpenseCategory.EQUIPMENT]: "Équipement",
  [ExpenseCategory.MAINTENANCE]: "Maintenance",
  [ExpenseCategory.FUEL]: "Carburant",
  [ExpenseCategory.FERTILIZER]: "Engrais",
  [ExpenseCategory.SEEDS]: "Semences",
  [ExpenseCategory.WATER]: "Eau",
  [ExpenseCategory.TRANSPORT]: "Transport",
  [ExpenseCategory.INSURANCE]: "Assurance",
  [ExpenseCategory.TAXES]: "Taxes",
  [ExpenseCategory.SUPPLIES]: "Fournitures",
  [ExpenseCategory.UTILITIES]: "Services",
  [ExpenseCategory.MARKETING]: "Marketing",
  [ExpenseCategory.MISC]: "Divers",
  [ExpenseCategory.OTHER]: "Autre",
};

type Period = "month" | "quarter" | "year" | "custom";
type ViewMode = "overview" | "monthly" | "breakdown";

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// ── KPI Card ───────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  bg: string;
  textColor: string;
  trend?: { label: string; positive: boolean };
}> = ({ label, value, sub, icon, bg, textColor, trend }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className={`text-lg font-black leading-tight ${textColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {trend && (
        <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${trend.positive ? "text-vert" : "text-rouge"}`}>
          {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend.label}
        </p>
      )}
    </div>
  </div>
);

// ── Mini Bar Chart ─────────────────────────────────────────────────────────────
interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

const MiniBarChart: React.FC<{ data: MonthlyData[] }> = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.expenses)), 1);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-gray-700">Revenus vs Dépenses</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-vert" />
            <span className="text-xs text-gray-500">Revenus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-rouge" />
            <span className="text-xs text-gray-500">Dépenses</span>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-28">
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: "88px" }}>
              <div
                className="flex-1 bg-vert rounded-t-sm opacity-80 transition-all"
                style={{ height: `${Math.max((d.revenue / maxVal) * 88, d.revenue > 0 ? 2 : 0)}px` }}
                title={fmtCurrency(d.revenue)}
              />
              <div
                className="flex-1 bg-rouge rounded-t-sm opacity-80 transition-all"
                style={{ height: `${Math.max((d.expenses / maxVal) * 88, d.expenses > 0 ? 2 : 0)}px` }}
                title={fmtCurrency(d.expenses)}
              />
            </div>
            <span className="text-[9px] text-gray-400 font-medium">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Profit Gauge ───────────────────────────────────────────────────────────────
const ProfitGauge: React.FC<{ margin: number }> = ({ margin }) => {
  const clamped = Math.max(-100, Math.min(100, margin));
  const isPositive = clamped >= 0;
  const pct = Math.abs(clamped);
  const color = isPositive ? "text-vert" : "text-rouge";
  const bgBar = isPositive ? "bg-vert" : "bg-rouge";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-sm font-bold text-gray-700 mb-3">Marge bénéficiaire</p>
      <div className="flex items-center gap-3 mb-3">
        <div className={`text-3xl font-black ${color}`}>{fmtPct(margin)}</div>
        <div>
          {isPositive ? (
            <div className="flex items-center gap-1 text-xs font-semibold text-vert bg-emerald-50 px-2 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Rentable
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs font-semibold text-rouge bg-red-50 px-2 py-1 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" /> Déficitaire
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${bgBar} rounded-full transition-all`}
          style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">0%</span>
        <span className="text-[10px] text-gray-400">100%</span>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ProfitLossDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const expenseState = useAppSelector(selectExpenseList);
  const saleState = useAppSelector(selectSaleList);
  const farmId = currentFarm?.id;

  const expenses: Expense[] = (expenseState.entities as Expense[] | null) ?? [];
  const sales: Sale[] = (saleState.entities as Sale[] | null) ?? [];
  const isLoading = expenseState.status === LoadingType.PENDING || saleState.status === LoadingType.PENDING;

  const [period, setPeriod] = useState<Period>("year");
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();

  const fetchAll = useCallback(() => {
    if (farmId) {
      dispatch(getAllExpenses({ farmId, limit: 1000, page: 1 }));
      dispatch(getAllSales({ farmId, limit: 1000, page: 1 }));
    }
  }, [dispatch, farmId]);

  useEffect(() => {
    if (!farmId) dispatch(getUserFarms());
    else fetchAll();
  }, [farmId, fetchAll, dispatch]);

  const refresh = useCallback(() => {
    fetchAll();
    toast.info("Données actualisées");
  }, [fetchAll]);

  // ── Filter by period ────────────────────────────────────────────────────────
  const { filteredExpenses, filteredSales, periodLabel } = useMemo(() => {
    let fromDate: string;
    let toDate = now.toISOString().slice(0, 10);
    let label: string;

    if (period === "month") {
      fromDate = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      label = MONTHS_FR[now.getMonth()] + " " + currentYear;
    } else if (period === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      fromDate = `${currentYear}-${String(q * 3 + 1).padStart(2, "0")}-01`;
      label = `T${q + 1} ${currentYear}`;
    } else if (period === "year") {
      fromDate = `${currentYear}-01-01`;
      toDate = `${currentYear}-12-31`;
      label = String(currentYear);
    } else {
      fromDate = customFrom || `${currentYear}-01-01`;
      toDate = customTo || now.toISOString().slice(0, 10);
      label = `${customFrom} → ${customTo}`;
    }

    return {
      filteredExpenses: expenses.filter((e) => e.date >= fromDate && e.date <= toDate),
      filteredSales: sales.filter((s) => s.date >= fromDate && s.date <= toDate),
      periodLabel: label,
    };
  }, [expenses, sales, period, customFrom, customTo, currentYear, now]);

  // ── Aggregated KPIs ─────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalRevenue = filteredSales.reduce((s, v) => s + v.total, 0);
    const totalExpenses = filteredExpenses.reduce((s, e) => s + e.totalAmount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : netProfit < 0 ? -100 : 0;
    return { totalRevenue, totalExpenses, netProfit, margin };
  }, [filteredSales, filteredExpenses]);

  // ── Monthly data for chart (always current year) ────────────────────────────
  const monthlyData: MonthlyData[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const mm = String(m + 1).padStart(2, "0");
      const prefix = `${currentYear}-${mm}`;
      const revenue = sales.filter((s) => s.date?.startsWith(prefix)).reduce((s, v) => s + v.total, 0);
      const exp = expenses.filter((e) => e.date?.startsWith(prefix)).reduce((s, v) => s + v.totalAmount, 0);
      return { month: MONTHS_FR[m], revenue, expenses: exp, profit: revenue - exp };
    });
  }, [sales, expenses, currentYear]);

  // ── Expense breakdown by category ──────────────────────────────────────────
  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.totalAmount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => ({ cat, label: CATEGORY_LABELS[cat as ExpenseCategory] ?? cat, amt, pct: kpis.totalExpenses > 0 ? (amt / kpis.totalExpenses) * 100 : 0 }));
  }, [filteredExpenses, kpis.totalExpenses]);

  // ── Monthly breakdown table ─────────────────────────────────────────────────
  const monthlyTable = useMemo(() => {
    return monthlyData.map((d, i) => ({
      ...d,
      idx: i,
      margin: d.revenue > 0 ? ((d.profit / d.revenue) * 100) : d.profit < 0 ? -100 : 0,
    })).filter((d) => d.revenue > 0 || d.expenses > 0);
  }, [monthlyData]);

  const exportCSV = () => {
    const rows = [
      ["Période", "Revenus", "Dépenses", "Bénéfice net", "Marge"],
      [periodLabel, kpis.totalRevenue, kpis.totalExpenses, kpis.netProfit, kpis.margin.toFixed(1) + "%"],
      [],
      ["Répartition des dépenses"],
      ["Catégorie", "Montant", "%"],
      ...expenseBreakdown.map((c) => [c.label, c.amt, c.pct.toFixed(1) + "%"]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `rapport_${periodLabel.replace(/\s/g, "_")}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Rapport exporté");
  };

  const catBarColors = ["bg-rouge", "bg-bleu", "bg-jaune", "bg-vert", "bg-purple-500", "bg-orange-400", "bg-cyan-500", "bg-gray-400"];

  function fmtDate(date: string): React.ReactNode {
    if (!date) return "";
    try {
      // accept dates like YYYY-MM-DD or full ISO strings
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      // e.g. "12 févr. 2024" -> keep short month in fr-FR
      return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
    } catch {
      return date;
    }
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false}
        newestOnTop closeOnClick pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium" />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Finance & Ventes</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Bénéfices / Pertes</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Bénéfices / Pertes</h1>
            <p className="text-sm text-gray-400 mt-0.5">Analyse financière de votre exploitation · <span className="font-semibold text-gray-600">{periodLabel}</span></p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Period Selector ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {([
              { key: "month", label: "Ce mois" },
              { key: "quarter", label: "Ce trimestre" },
              { key: "year", label: "Cette année" },
              { key: "custom", label: "Personnalisé" },
            ] as { key: Period; label: string }[]).map(({ key, label }) => (
              <button key={key} onClick={() => setPeriod(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${period === key ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              <span className="text-xs text-gray-400">→</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
          )}

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 ml-auto">
            {([
              { key: "overview", label: "Résumé" },
              { key: "monthly", label: "Par mois" },
              { key: "breakdown", label: "Par poste" },
            ] as { key: ViewMode; label: string }[]).map(({ key, label }) => (
              <button key={key} onClick={() => setViewMode(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === key ? "bg-bleu text-white" : "text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" /><span className="text-sm">Chargement…</span>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Chiffre d'affaires" value={fmtCurrency(kpis.totalRevenue)}
                sub={`${filteredSales.length} ventes`}
                icon={<TrendingUp className="w-5 h-5 text-vert" />} bg="bg-emerald-50"
                textColor="text-gray-900" />
              <KpiCard label="Total dépenses" value={fmtCurrency(kpis.totalExpenses)}
                sub={`${filteredExpenses.length} dépenses`}
                icon={<TrendingDown className="w-5 h-5 text-rouge" />} bg="bg-red-50"
                textColor="text-gray-900" />
              <KpiCard
                label={kpis.netProfit >= 0 ? "Bénéfice net" : "Perte nette"}
                value={fmtCurrency(Math.abs(kpis.netProfit))}
                sub={`Marge : ${fmtPct(kpis.margin)}`}
                icon={kpis.netProfit >= 0
                  ? <DollarSign className="w-5 h-5 text-vert" />
                  : <AlertCircle className="w-5 h-5 text-rouge" />}
                bg={kpis.netProfit >= 0 ? "bg-emerald-50" : "bg-red-50"}
                textColor={kpis.netProfit >= 0 ? "text-vert" : "text-rouge"}
                trend={kpis.netProfit >= 0
                  ? { label: "Exploitation rentable", positive: true }
                  : { label: "Charges > Revenus", positive: false }}
              />
              <KpiCard label="Point d'équilibre"
                value={kpis.totalExpenses > 0 ? fmtCurrency(kpis.totalExpenses) : "—"}
                sub="seuil de rentabilité"
                icon={<BarChart3 className="w-5 h-5 text-jaune" />} bg="bg-yellow-50"
                textColor="text-gray-900" />
            </div>

            {/* ── Overview ── */}
            {viewMode === "overview" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MiniBarChart data={monthlyData} />
                  <ProfitGauge margin={kpis.margin} />
                </div>

                {/* Compte de résultat simplifié */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-700">Compte de résultat — {periodLabel}</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {/* Revenus */}
                    <div className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-8 bg-vert rounded-full" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Revenus d'exploitation</p>
                          <p className="text-xs text-gray-400">{filteredSales.length} ventes enregistrées</p>
                        </div>
                      </div>
                      <p className="text-base font-black text-vert">{fmtCurrency(kpis.totalRevenue)}</p>
                    </div>

                    {/* Charges */}
                    <div className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-8 bg-rouge rounded-full" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Charges d'exploitation</p>
                          <p className="text-xs text-gray-400">{filteredExpenses.length} dépenses enregistrées</p>
                        </div>
                      </div>
                      <p className="text-base font-black text-rouge">− {fmtCurrency(kpis.totalExpenses)}</p>
                    </div>

                    {/* Résultat */}
                    <div className={`px-5 py-4 flex items-center justify-between ${kpis.netProfit >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-8 rounded-full ${kpis.netProfit >= 0 ? "bg-gray-800" : "bg-rouge"}`} />
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {kpis.netProfit >= 0 ? "Résultat net positif" : "Résultat net négatif"}
                          </p>
                          <p className="text-xs text-gray-500">Marge nette : {fmtPct(kpis.margin)}</p>
                        </div>
                      </div>
                      <p className={`text-xl font-black ${kpis.netProfit >= 0 ? "text-vert" : "text-rouge"}`}>
                        {kpis.netProfit >= 0 ? "+" : "−"} {fmtCurrency(Math.abs(kpis.netProfit))}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Monthly breakdown ── */}
            {viewMode === "monthly" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-700">Résultats mensuels — {currentYear}</p>
                </div>
                {monthlyTable.length === 0 ? (
                  <div className="text-center py-16 text-sm text-gray-400">Aucune donnée pour cette année</div>
                ) : (
                  <>
                    <div className="hidden md:grid grid-cols-[80px_1fr_1fr_1fr_100px] gap-3 px-5 py-2.5 bg-gray-50/80 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mois</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenus</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dépenses</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Résultat</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Marge</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {monthlyTable.map((d) => (
                        <div key={d.idx} className="grid grid-cols-[80px_1fr_1fr_1fr_100px] gap-3 px-5 py-3 items-center hover:bg-gray-50/70 transition">
                          <p className="text-sm font-bold text-gray-600">{d.month}</p>
                          <p className="text-sm font-semibold text-vert">{fmtCurrency(d.revenue)}</p>
                          <p className="text-sm font-semibold text-rouge">{fmtCurrency(d.expenses)}</p>
                          <div className="flex items-center gap-1.5">
                            {d.profit > 0
                              ? <TrendingUp className="w-3.5 h-3.5 text-vert" />
                              : d.profit < 0
                              ? <TrendingDown className="w-3.5 h-3.5 text-rouge" />
                              : <Minus className="w-3.5 h-3.5 text-gray-400" />}
                            <p className={`text-sm font-bold ${d.profit > 0 ? "text-vert" : d.profit < 0 ? "text-rouge" : "text-gray-400"}`}>
                              {d.profit >= 0 ? "+" : ""}{fmtCurrency(d.profit)}
                            </p>
                          </div>
                          <div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${d.margin >= 0 ? "bg-emerald-50 text-vert" : "bg-red-50 text-rouge"}`}>
                              {fmtPct(d.margin)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Total row */}
                    <div className="grid grid-cols-[80px_1fr_1fr_1fr_100px] gap-3 px-5 py-3.5 bg-gray-50 border-t-2 border-gray-200 items-center">
                      <p className="text-xs font-black text-gray-700 uppercase">Total</p>
                      <p className="text-sm font-black text-vert">{fmtCurrency(monthlyTable.reduce((s, d) => s + d.revenue, 0))}</p>
                      <p className="text-sm font-black text-rouge">{fmtCurrency(monthlyTable.reduce((s, d) => s + d.expenses, 0))}</p>
                      <p className={`text-sm font-black ${kpis.netProfit >= 0 ? "text-vert" : "text-rouge"}`}>
                        {kpis.netProfit >= 0 ? "+" : ""}{fmtCurrency(kpis.netProfit)}
                      </p>
                      <span className={`text-xs font-black px-2 py-1 rounded-lg w-fit ${kpis.margin >= 0 ? "bg-emerald-50 text-vert" : "bg-red-50 text-rouge"}`}>
                        {fmtPct(kpis.margin)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Expense breakdown ── */}
            {viewMode === "breakdown" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-700">Répartition des charges — {periodLabel}</p>
                  <p className="text-xs text-gray-400">{expenseBreakdown.length} catégories</p>
                </div>

                {expenseBreakdown.length === 0 ? (
                  <div className="text-center py-16 text-sm text-gray-400">Aucune dépense sur cette période</div>
                ) : (
                  <>
                    {/* Stacked bar */}
                    <div className="px-5 py-4 border-b border-gray-50">
                      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                        {expenseBreakdown.map((c, i) => (
                          <div key={c.cat} className={`${catBarColors[i % catBarColors.length]} rounded-sm transition-all`}
                            style={{ width: `${c.pct}%` }} title={`${c.label}: ${fmtCurrency(c.amt)}`} />
                        ))}
                      </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {expenseBreakdown.map((c, i) => (
                        <div key={c.cat}>
                          <button
                            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition text-left"
                            onClick={() => setExpandedCat(expandedCat === c.cat ? null : c.cat)}>
                            <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${catBarColors[i % catBarColors.length]}`} />
                            <p className="flex-1 text-sm font-semibold text-gray-800">{c.label}</p>
                            <div className="flex items-center gap-4">
                              <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden md:block">
                                <div className={`h-full ${catBarColors[i % catBarColors.length]} rounded-full`}
                                  style={{ width: `${c.pct}%` }} />
                              </div>
                              <p className="text-xs font-semibold text-gray-400 w-10 text-right">{c.pct.toFixed(0)}%</p>
                              <p className="text-sm font-black text-gray-800 w-36 text-right">{fmtCurrency(c.amt)}</p>
                              {expandedCat === c.cat
                                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                                : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>
                          </button>
                          {expandedCat === c.cat && (
                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                              {filteredExpenses.filter((e) => e.category === c.cat).map((e) => (
                                <div key={e.id} className="flex items-center justify-between py-1.5 text-sm">
                                  <span className="text-gray-500">{fmtDate(e.date)}{e.notes ? ` — ${e.notes}` : ""}</span>
                                  <span className="font-semibold text-gray-700">{fmtCurrency(e.totalAmount)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="px-5 py-3.5 bg-gray-50 border-t-2 border-gray-200 flex items-center justify-between">
                      <p className="text-sm font-black text-gray-700">Total charges</p>
                      <p className="text-base font-black text-rouge">{fmtCurrency(kpis.totalExpenses)}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ProfitLossDashboard;