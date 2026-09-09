import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search,
  RefreshCw,
  ChevronRight,
  Filter,
  Layers,
  TrendingUp,
  BarChart3,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Package,
  Users,
  Grid3X3,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchProductions,
  fetchProductionStats,
} from "../../../store/production/action";

import {
  selectProductions,
  selectProductionsLoading,
} from "../../../features/productions/productionSelectors";

import { selectCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import type { FetchProduction } from "../../../models/production";

// ── Helpers ────────────────────────────────────────────────────────────────────
const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtNum = (n: number, decimals = 1) =>
  n?.toFixed(decimals).replace(".", ",");

// ── KPI Card ────────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  bg: string;
  trend?: "up" | "down" | "neutral";
  trendVal?: string;
}> = ({ label, value, sub, icon, bg, trend, trendVal }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
    {trend && trendVal && (
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
        trend === "up" ? "bg-emerald-50 text-vert" :
        trend === "down" ? "bg-red-50 text-rouge" :
        "bg-gray-100 text-gray-500"
      }`}>
        {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> :
         trend === "down" ? <ArrowDownRight className="w-3 h-3" /> :
         <Minus className="w-3 h-3" />}
        {trendVal}
      </div>
    )}
  </div>
);

// ── Progress Bar ─────────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

// ── Grade Badge ──────────────────────────────────────────────────────────────────
const GradeBadge: React.FC<{ grade?: string | null }> = ({ grade }) => {
  if (!grade) return <span className="text-xs text-gray-300">—</span>;
  const colors: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    B: "bg-blue-100 text-blue-700 border border-blue-200",
    C: "bg-amber-100 text-amber-700 border border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${colors[grade] || "bg-gray-100 text-gray-600"}`}>
      <Award className="w-3 h-3" /> {grade}
    </span>
  );
};

// ── Lot Row (expandable) ──────────────────────────────────────────────────────────
const LotRow: React.FC<{
  lot: { id: number | string; name: string; type: "lot" | "herd" | "pen" | "animal" };
  productions: FetchProduction[];
  maxQty: number;
  rank: number;
}> = ({ lot, productions, maxQty, rank }) => {
  const [expanded, setExpanded] = useState(false);

  const totalQty = productions.reduce((s, p) => s + p.quantity, 0);
  const avgQty = productions.length > 0 ? totalQty / productions.length : 0;
  const types = [...new Set(productions.map((p) => p.type))];
  const grades = productions.map((p) => p.qualityGrade).filter(Boolean);
  const dominantGrade = grades.length > 0
    ? (["A", "B", "C"].find((g) => grades.filter((x) => x === g).length === Math.max(...["A","B","C"].map((gg) => grades.filter((x) => x === gg).length))) || null)
    : null;

  const rankColors = ["text-jaune", "text-gray-400", "text-amber-600"];

  return (
    <div className="border-b border-gray-50 last:border-0">
      {/* Row principal */}
      <div
        className="grid grid-cols-[32px_1fr_100px_100px_100px_80px_32px] gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition cursor-pointer items-center group"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rang */}
        <span className={`text-sm font-black ${rankColors[rank] || "text-gray-300"}`}>
          #{rank + 1}
        </span>

        {/* Nom + type */}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800 text-sm">{lot.name}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${
              lot.type === "lot" ? "bg-emerald-50 text-vert" :
              lot.type === "herd" ? "bg-bleu/10 text-bleu" :
              lot.type === "animal" ? "bg-jaune/10 text-jaune" :
              "bg-gray-100 text-gray-500"
            }`}>
              {lot.type === "lot" ? "Lot" : lot.type === "herd" ? "Troupeau" : lot.type === "animal" ? "Animal" : "Enclos"}
            </span>
          </div>
          <div className="mt-1">
            <ProgressBar value={totalQty} max={maxQty} color="bg-vert" />
          </div>
        </div>

        {/* Total */}
        <div>
          <p className="text-sm font-bold text-gray-800">{fmtNum(totalQty)}</p>
          <p className="text-xs text-gray-400">{productions[0]?.unit || "—"}</p>
        </div>

        {/* Moyenne */}
        <div>
          <p className="text-sm font-semibold text-gray-600">{fmtNum(avgQty)}</p>
          <p className="text-xs text-gray-400">moy/entrée</p>
        </div>

        {/* Enregistrements */}
        <div>
          <p className="text-sm font-semibold text-gray-600">{productions.length}</p>
          <p className="text-xs text-gray-400">entrée{productions.length > 1 ? "s" : ""}</p>
        </div>

        {/* Grade */}
        <GradeBadge grade={dominantGrade} />

        {/* Toggle */}
        <div className="flex justify-center text-gray-300 group-hover:text-gray-500 transition">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Détail expandé */}
      {expanded && (
        <div className="bg-gray-50/80 border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Types produits */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Types de production</p>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => {
                const typeQty = productions.filter((p) => p.type === t).reduce((s, p) => s + p.quantity, 0);
                return (
                  <div key={t} className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-vert" />
                    <span className="text-xs font-semibold text-gray-700">{t}</span>
                    <span className="text-xs text-gray-400">{fmtNum(typeQty)} {productions[0]?.unit}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dernières entrées */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Dernières entrées ({Math.min(5, productions.length)}/{productions.length})
            </p>
            <div className="space-y-1.5">
              {[...productions]
                .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
                .slice(0, 5)
                .map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-24">{fmtDate(p.date)}</span>
                      <span className="text-xs font-semibold text-gray-700">{p.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-800">{p.quantity} {p.unit}</span>
                      <GradeBadge grade={p.qualityGrade} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────────
type GroupBy = "lot" | "herd" | "animal" | "pen";
type SortBy = "total" | "count" | "avg";

const LotAnalysis: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const currentUser = useAppSelector((state) => state.authentification?.auth?.user);
  const productions = useAppSelector(selectProductions);
  const isLoading = useAppSelector(selectProductionsLoading);

  const farmId = currentFarm?.id;


  const [groupBy, setGroupBy] = useState<GroupBy>("lot");
  const [sortBy, setSortBy] = useState<SortBy>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (!farmId && currentUser?.id) dispatch(getUserFarms());
  }, [dispatch, farmId, currentUser?.id]);

  useEffect(() => {
    if (farmId) {
      dispatch(fetchProductions({ farmId, limit: 200 }));
      dispatch(fetchProductionStats({ farmId }));
    }
  }, [dispatch, farmId]);

  const refresh = useCallback(() => {
    if (farmId) {
      dispatch(fetchProductions({ farmId, limit: 200 }));
      dispatch(fetchProductionStats({ farmId }));
      toast.info("Données actualisées");
    }
  }, [dispatch, farmId]);

  // Regrouper par entité sélectionnée
  const grouped = React.useMemo(() => {
    const map = new Map<string, { id: number | string; name: string; type: GroupBy; prods: FetchProduction[] }>();

    const createEntity = (
      id: number | string | undefined,
      name: string | undefined,
      fallbackName: string,
    ): { id: number | string; name: string } => ({
      id: typeof id === "number" || typeof id === "string" ? id : 0,
      name: name ?? fallbackName,
    });

    for (const p of productions) {
      let key: string | null = null;
      let entity: { id: number | string; name: string } | null = null;

      if (groupBy === "lot" && p.lot) { key = `lot-${p.lot.id ?? "unknown"}`; entity = createEntity(p.lot.id, p.lot.name, "Lot sans nom"); }
      else if (groupBy === "herd" && p.herd) { key = `herd-${p.herd.id ?? "unknown"}`; entity = createEntity(p.herd.id, p.herd.name, "Troupeau sans nom"); }
      else if (groupBy === "animal" && p.animal) { key = `animal-${p.animal.id ?? "unknown"}`; entity = createEntity(p.animal.id, p.animal.name, "Animal sans nom"); }
      else if (groupBy === "pen" && p.pen) { key = `pen-${p.pen.id ?? "unknown"}`; entity = createEntity(p.pen.id, p.pen.name, "Parc sans nom"); }
      else { key = `none-${groupBy}`; entity = { id: 0, name: `Sans ${groupBy}` }; }

      if (!key || !entity) continue;
      if (!map.has(key)) map.set(key, { id: entity.id, name: entity.name, type: groupBy, prods: [] });
      map.get(key)!.prods.push(p);
    }
    return [...map.values()];
  }, [productions, groupBy]);

  // Types distincts pour filtre
  const allTypes = [...new Set(productions.map((p) => p.type))];

  // Filtrer + trier
  const displayed = React.useMemo(() => {
    let list = grouped;
    if (searchTerm) list = list.filter((g) => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterType !== "all") list = list.filter((g) => g.prods.some((p) => p.type === filterType));

    return [...list].sort((a, b) => {
      const aVal = sortBy === "total" ? a.prods.reduce((s, p) => s + p.quantity, 0)
        : sortBy === "count" ? a.prods.length
        : (a.prods.reduce((s, p) => s + p.quantity, 0) / (a.prods.length || 1));
      const bVal = sortBy === "total" ? b.prods.reduce((s, p) => s + p.quantity, 0)
        : sortBy === "count" ? b.prods.length
        : (b.prods.reduce((s, p) => s + p.quantity, 0) / (b.prods.length || 1));
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [grouped, searchTerm, filterType, sortBy, sortDir]);

  const maxQty = Math.max(...displayed.map((g) => g.prods.reduce((s, p) => s + p.quantity, 0)), 1);
  const totalProds = productions.length;
  const totalQty = productions.reduce((s, p) => s + p.quantity, 0);
  const topLot = displayed[0];
  const topQty = topLot ? topLot.prods.reduce((s, p) => s + p.quantity, 0) : 0;

  const toggleSort = (col: SortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortBy }) =>
    sortBy === col ? (
      sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
    ) : <ChevronDown className="w-3 h-3 opacity-30" />;

  const groupIcons: Record<GroupBy, React.ReactNode> = {
    lot: <Layers className="w-4 h-4" />,
    herd: <Users className="w-4 h-4" />,
    animal: <Package className="w-4 h-4" />,
    pen: <Grid3X3 className="w-4 h-4" />,
  };

  return (
    <>
    

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Production</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Analyses par Lot / Troupeau</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">
              Analyses par Lot / Troupeau
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Performance et comparaison des groupes de production
            </p>
          </div>
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Groupes analysés"
            value={displayed.length}
            sub={`sur ${grouped.length} total`}
            icon={<Layers className="w-5 h-5 text-vert" />}
            accent="text-vert"
            bg="bg-emerald-50"
          />
          <KpiCard
            label="Production totale"
            value={`${fmtNum(totalQty)}`}
            sub="toutes unités"
            icon={<TrendingUp className="w-5 h-5 text-bleu" />}
            accent="text-bleu"
            bg="bg-blue-50"
          />
          <KpiCard
            label="Entrées totales"
            value={totalProds}
            sub="enregistrements"
            icon={<BarChart3 className="w-5 h-5 text-jaune" />}
            accent="text-jaune"
            bg="bg-yellow-50"
          />
          <KpiCard
            label="Meilleur groupe"
            value={topLot?.name || "—"}
            sub={topLot ? `${fmtNum(topQty)} ${productions[0]?.unit || ""}` : ""}
            icon={<Award className="w-5 h-5 text-amber-500" />}
            accent="text-amber-500"
            bg="bg-amber-50"
            trend="up"
            trendVal="#1"
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Grouper par */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 ml-2" />
            {(["lot", "herd", "animal", "pen"] as GroupBy[]).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  groupBy === g ? "bg-vert text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {groupIcons[g]}
                {g === "lot" ? "Lot" : g === "herd" ? "Troupeau" : g === "animal" ? "Animal" : "Enclos"}
              </button>
            ))}
          </div>

          {/* Recherche */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            />
          </div>

          {/* Filtre type */}
          {allTypes.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs font-semibold text-gray-600 bg-transparent outline-none cursor-pointer"
              >
                <option value="all">Tous types</option>
                {allTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement des données…</span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Layers className="w-10 h-10 text-gray-200" />
            <div className="text-center">
              <p className="font-semibold text-gray-500">Aucun groupe trouvé</p>
              <p className="text-sm mt-1">Modifiez les filtres ou ajoutez des productions</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* En-tête tableau */}
            <div className="hidden md:grid grid-cols-[32px_1fr_100px_100px_100px_80px_32px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">#</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Groupe</p>
              <button
                onClick={() => toggleSort("total")}
                className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition"
              >
                Total <SortIcon col="total" />
              </button>
              <button
                onClick={() => toggleSort("avg")}
                className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition"
              >
                Moyenne <SortIcon col="avg" />
              </button>
              <button
                onClick={() => toggleSort("count")}
                className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition"
              >
                Entrées <SortIcon col="count" />
              </button>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Grade</p>
              <div />
            </div>

            {/* Lignes */}
            <div>
              {displayed.map((g, i) => (
                <LotRow
                  key={`${g.type}-${g.id}`}
                  lot={{ id: g.id, name: g.name, type: g.type }}
                  productions={g.prods}
                  maxQty={maxQty}
                  rank={i}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {displayed.length} groupe{displayed.length > 1 ? "s" : ""}
                {searchTerm || filterType !== "all" ? " (filtrés)" : ""}
              </p>
              <p className="text-xs text-gray-400">
                Groupé par · <span className="font-semibold text-gray-600">
                  {groupBy === "lot" ? "Lot" : groupBy === "herd" ? "Troupeau" : groupBy === "animal" ? "Animal" : "Enclos"}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LotAnalysis;