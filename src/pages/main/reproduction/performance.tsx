/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Dna, Plus, Pencil, Trash2, X, Search,
  AlertTriangle, RefreshCw, RefreshCcw,
  TrendingUp, Weight, ShieldCheck, ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import SelectInput from "../../../components/UI/SelectInput";
import { selectCurrentFarm } from "../../../store/farm/slice";

import {
  fetchGeneticPerformances,
  fetchGeneticPerformanceById,
  createGeneticPerformance,
  updateGeneticPerformance,
  deleteGeneticPerformance,
  syncGeneticPerformance,
  fetchGeneticStats,
} from "../../../store/Reproduction/action";
import {
  clearError,
  clearSuccess,
  clearCurrentGeneticPerformance,
} from "../../../store/Reproduction/slice";
import type { RootState } from "../../../store";
import type { CreateGeneticPerformancePayload } from "../../../models/reproduction";

// ── Helpers ───────────────────────────────────────────────────────────────────

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmt = (v: number | null | undefined, unit = "") =>
  v != null ? `${v}${unit ? " " + unit : ""}` : "—";

const ScoreBar = ({ value, max = 100 }: { value: number | null | undefined; max?: number }) => {
  if (value == null) return <span className="text-gray-300 text-sm">—</span>;
  const pct = Math.min((value / max) * 100, 100);
  const color = pct > 66 ? "bg-green-400" : pct > 33 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-black text-gray-600">{value}</span>
    </div>
  );
};

const EMPTY: Omit<CreateGeneticPerformancePayload, "farmId" | "createdAt" | "updatedAt"> = {
  animalId: 0,
  growthRate: null, birthWeight: null, weaningWeight: null,
  prolificityScore: null, maternalInstinct: null,
  diseaseResistance: null, inbreedingCoeff: null,
};

// ── Delete Modal ──────────────────────────────────────────────────────────────

const DeleteModal: React.FC<{ id: number; onCancel: () => void; onConfirm: () => void; isDeleting: boolean }> = ({
  id, onCancel, onConfirm, isDeleting,
}) => (
  <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-red-50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-black text-gray-800">Supprimer l'enregistrement ?</h3>
          <p className="text-xs text-gray-400 font-medium">ID #{id} — Action irréversible.</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} disabled={isDeleting}
          className="flex-1 py-2 rounded-xl text-sm font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50">
          Annuler
        </button>
        <button onClick={onConfirm} disabled={isDeleting}
          className="flex-1 py-2 rounded-xl text-sm font-black bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {isDeleting ? <><Spinner /> Suppression…</> : "Supprimer"}
        </button>
      </div>
    </div>
  </div>
);

// ── Detail Modal ──────────────────────────────────────────────────────────────

const DetailModal: React.FC<{ item: any; onClose: () => void; onEdit: () => void }> = ({
  item, onClose, onEdit,
}) => (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4 text-green-50" />
          <span className="font-black text-gray-800">Performance génétique</span>
          <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-gray-50 text-gray-400 border border-gray-200">#{item.id}</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-black text-gray-400 uppercase mb-0.5">Animal</p>
          <p className="text-sm font-black text-gray-800">ID #{item.animalId}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Taux croissance", value: fmt(item.growthRate, "%"), color: "text-yellow-500", bg: "bg-yellow-50", Icon: TrendingUp },
            { label: "Poids naissance", value: fmt(item.birthWeight, "kg"), color: "text-blue-500", bg: "bg-blue-50", Icon: Weight },
            { label: "Poids sevrage", value: fmt(item.weaningWeight, "kg"), color: "text-indigo-500", bg: "bg-indigo-50", Icon: Weight },
          ].map(({ label, value, color, bg, Icon }) => (
            <div key={label} className={`${bg} rounded-xl p-3`}>
              <Icon className={`w-3.5 h-3.5 ${color} mb-1`} />
              <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">{label}</p>
              <p className={`text-xs font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
          <p className="text-xs font-black text-gray-400 uppercase mb-1">Scores de sélection</p>
          {[
            { label: "Prolificité", value: item.prolificityScore },
            { label: "Instinct maternel", value: item.maternalInstinct, max: 10 },
            { label: "Résistance maladie", value: item.diseaseResistance },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">{r.label}</span>
              <ScoreBar value={r.value} max={r.max} />
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Coeff. consanguinité</p>
          <p className="text-sm font-black text-gray-700">{fmt(item.inbreedingCoeff)}</p>
        </div>
      </div>
      <div className="px-5 pb-5">
        <button onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black bg-green-50 text-white hover:bg-vert transition-all">
          <Pencil className="w-4 h-4" /> Modifier
        </button>
      </div>
    </div>
  </div>
);

// ── Form Modal ────────────────────────────────────────────────────────────────

const FormModal: React.FC<{
  farmId: number;
  initial?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  // ✅ Tous les hooks en haut
  const allAnimals = useAppSelector((state) => state.animal.animalist?.entities) ?? [];
  const animalsLoading = useAppSelector((state) => state.animal.animalist?.status === "pending");

  const farmAnimals = allAnimals.filter((a: any) => farmId ? a.farmId === farmId : true);
  const animalOptions = farmAnimals.map((a: any) => ({
    value: a.id,
    label: `${a.name} · ${a.species?.name ?? "?"} · ${a.breed?.name ?? "?"} · ${a.weight} kg`,
  }));

  const [form, setForm] = useState({
    ...EMPTY,
    ...(initial ? {
      animalId: initial.animalId ?? 0,
      growthRate: initial.growthRate ?? null,
      birthWeight: initial.birthWeight ?? null,
      weaningWeight: initial.weaningWeight ?? null,
      prolificityScore: initial.prolificityScore ?? null,
      maternalInstinct: initial.maternalInstinct ?? null,
      diseaseResistance: initial.diseaseResistance ?? null,
      inbreedingCoeff: initial.inbreedingCoeff ?? null,
    } : {}),
  });

  const set = (k: string, v: any) =>
    setForm((p) => ({ ...p, [k]: v === "" ? null : isNaN(Number(v)) ? v : Number(v) }));

  const handleSubmit = async () => {
    if (!form.animalId) { toast.warning("Veuillez sélectionner un animal."); return; }
    setSaving(true);
    try {
      if (initial) {
        await dispatch(updateGeneticPerformance({
          id: initial.id, ...form, farmId,
        })).unwrap();
        toast.success("Performance mise à jour !");
      } else {
        await dispatch(createGeneticPerformance({
          ...form, farmId,
        })).unwrap();
        toast.success("Performance créée !");
      }
      onSuccess();
    } catch (e: any) {
      toast.error(e || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-300 transition-all";
  const labelCls = "text-xs font-black text-gray-400 uppercase mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <Dna className="w-4 h-4 text-green-50" />
            </div>
            <span className="font-black text-gray-800 text-sm">
              {initial ? "Modifier la performance" : "Nouvelle performance génétique"}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <div>
            <label className={labelCls}>Animal *</label>
            {animalOptions.length === 0 && !animalsLoading ? (
              <div className="px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl">
                <span className="text-sm text-orange-500 font-medium">Aucun animal disponible pour cette ferme</span>
              </div>
            ) : (
              <SelectInput
                value={form.animalId || null}
                onChange={(val) => set("animalId", val)}
                options={animalOptions}
                loading={animalsLoading}
                disabled={animalsLoading}
                placeholder="— Sélectionner un animal —"
              />
            )}
          </div>

          <hr className="border-gray-50" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest -mb-1">Indicateurs de croissance</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Taux de croissance (%)</label>
              <input type="number" step="0.1" value={form.growthRate ?? ""} onChange={(e) => set("growthRate", e.target.value)} placeholder="ex: 1.5" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Poids naissance (kg)</label>
              <input type="number" step="0.1" value={form.birthWeight ?? ""} onChange={(e) => set("birthWeight", e.target.value)} placeholder="ex: 35" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Poids sevrage (kg)</label>
              <input type="number" step="0.1" value={form.weaningWeight ?? ""} onChange={(e) => set("weaningWeight", e.target.value)} placeholder="ex: 80" className={inputCls} />
            </div>
          </div>

          <hr className="border-gray-50" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest -mb-1">Scores de sélection</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Score prolificité</label>
              <input type="number" step="0.01" value={form.prolificityScore ?? ""} onChange={(e) => set("prolificityScore", e.target.value)} placeholder="—" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Instinct maternel (1–10)</label>
              <input type="number" step="1" min="1" max="10" value={form.maternalInstinct ?? ""} onChange={(e) => set("maternalInstinct", e.target.value)} placeholder="1 – 10" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Résistance maladie (1-10)</label>
              <input type="number" step="0.01" value={form.diseaseResistance ?? ""} onChange={(e) => set("diseaseResistance", e.target.value)} placeholder="—" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Coeff. consanguinité</label>
              <input type="number" step="0.001" value={form.inbreedingCoeff ?? ""} onChange={(e) => set("inbreedingCoeff", e.target.value)} placeholder="0.000" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving || !form.animalId}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-vert text-white hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Spinner /> Patientez…</> : initial ? "Modifier" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

const GeneticPerformanceManager: React.FC = () => {
  const dispatch = useAppDispatch();

  // ✅ TOUS les hooks ici — avant tout return conditionnel
  const currentFarm = useAppSelector(selectCurrentFarm);
  const farms = useAppSelector((state) => state.farms.farmList.entities) ?? [];
  const allAnimals = useAppSelector((state) => state.animal.animalist?.entities) ?? [];
  const { geneticPerformances, loading, syncLoading, error, success, stats } =
    useAppSelector((s: RootState) => s.reproduction);

  const [searchTerm,   setSearchTerm]   = useState("");
  const [showForm,     setShowForm]     = useState(false);
  const [editingItem,  setEditingItem]  = useState<any | null>(null);
  const [detailItem,   setDetailItem]   = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const [syncId,       setSyncId]       = useState("");
  const [isSyncing,    setIsSyncing]    = useState(false);

const farmsStatus = useAppSelector((state) => state.farms.farmList.status); // "idle"|"pending"|"fulfilled"|"rejected"

const farmId = currentFarm?.id ?? farms[0]?.id;

// ── Garde APRÈS tous les hooks ────────────────────────────────
const isLoadingFarm = farmsStatus === "idle" || farmsStatus === "pending";



  useEffect(() => {
    if (!farmId) return;
    dispatch(fetchGeneticPerformances({ farmId }));
    dispatch(fetchGeneticStats(farmId));
  }, [dispatch, farmId]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) { dispatch(clearSuccess()); }
  }, [success, dispatch]);

  const refresh = useCallback(() => {
    if (!farmId) return;
    dispatch(fetchGeneticPerformances({ farmId }));
    dispatch(fetchGeneticStats(farmId));
  }, [dispatch, farmId]);

 if (!farmId && isLoadingFarm) return (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-400">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
    <p className="text-sm font-medium">Chargement de la ferme...</p>
  </div>
);

if (!farmId && !isLoadingFarm) return (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-400">
    <p className="text-sm font-medium">Aucune ferme trouvée.</p>
    <p className="text-xs text-gray-400">Créez d'abord une ferme pour accéder aux performances génétiques.</p>
  </div>
);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget?.id) { setDeleteTarget(null); return; }
    setIsDeleting(true);
    try {
      await dispatch(deleteGeneticPerformance(deleteTarget.id)).unwrap();
      toast.success("Enregistrement supprimé.");
      setDeleteTarget(null);
      refresh();
    } catch (e: any) {
      toast.error(e || "Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSync = async () => {
    const id = parseInt(syncId);
    if (!id || isNaN(id)) { toast.warning("Entrez un ID d'animal valide."); return; }
    setIsSyncing(true);
    try {
      await dispatch(syncGeneticPerformance(id)).unwrap();
      toast.success(`Animal #${id} synchronisé !`);
      setSyncId("");
      refresh();
    } catch (e: any) {
      toast.error(e || "Erreur de synchronisation.");
    } finally {
      setIsSyncing(false);
    }
  };

  const openEdit = (item: any) => {
    dispatch(fetchGeneticPerformanceById(item.id));
    setEditingItem(item);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    dispatch(clearCurrentGeneticPerformance());
  };

  // ── Data ──────────────────────────────────────────────────────────────────
  const list: any[] = Array.isArray(geneticPerformances) ? geneticPerformances : [];

  const filtered = list.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();
    if (String(p.id).includes(term) || String(p.animalId).includes(term)) return true;
    const animal = allAnimals.find((a: any) => a.id === p.animalId);
    if (!animal) return false;
    return (
      (animal as any).name?.toLowerCase().includes(term) ||
      (animal as any).reference?.toLowerCase().includes(term)
    );
  });

  const statCards = [
    { label: "Total", value: list.length, color: "text-gray-700", bg: "bg-gray-100", Icon: Dna },
    { label: "Croissance moy.", value: stats?.averages?.growthRate != null ? `${stats.averages.growthRate.toFixed(1)}%` : "—", color: "text-yellow-600", bg: "bg-yellow-50", Icon: TrendingUp },
    { label: "Poids nais. moy.", value: stats?.averages?.birthWeight != null ? `${stats.averages.birthWeight.toFixed(1)} kg` : "—", color: "text-blue-600", bg: "bg-blue-50", Icon: Weight },
    { label: "Résistance moy.", value: stats?.averages?.diseaseResistance != null ? stats.averages.diseaseResistance.toFixed(2) : "—", color: "text-green-600", bg: "bg-green-50", Icon: ShieldCheck },
  ];

  const TABLE_HEADERS = ["Animal", "Croissance", "Poids nais.", "Poids sevrage", "Prolificité", "Inst. mat.", "Résistance", "Consangui.", "Actions"];

  return (
    <div className="flex flex-col gap-4 p-4 pt-20">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-50 rounded-xl">
            <Dna className="w-5 h-5 text-green-50" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Performances Génétiques</h2>
            <p className="text-sm text-gray-400 font-medium">
              {currentFarm?.name ?? `Ferme #${farmId}`} · {list.length} enregistrement{list.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditingItem(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-white bg-vert hover:bg-green-700 rounded-xl font-black shadow transition-all">
            <Plus className="w-4 h-4" /> Nouveau
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map(({ label, value, color, bg, Icon }) => (
            <div key={label} className={`${bg} rounded-2xl p-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wide">{label}</p>
              </div>
              <p className={`text-xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Sync Panel ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2 md:flex-row md:items-end md:gap-4">
        <div className="flex-1">
          <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Synchronisation automatique (Upsert)</label>
          <input type="number" value={syncId} onChange={(e) => setSyncId(e.target.value)}
            placeholder="ID Animal à synchroniser…"
            className="w-full max-w-xs px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-300" />
        </div>
        <button onClick={handleSync} disabled={isSyncing || syncLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black bg-vert text-white hover:bg-green-700 disabled:opacity-50 transition-all shadow-sm">
          {isSyncing || syncLoading ? <><Spinner /> Sync…</> : <><RefreshCcw className="w-4 h-4" /> Synchroniser</>}
        </button>
      </div>

      {/* ── Filtres ── */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Rechercher par nom, référence ou scanner…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
            autoComplete="off"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-[10px] text-gray-400 font-medium mt-2 flex items-center gap-1">
          <Search className="w-3 h-3" /> Recherche par nom, ID ou scan de code-barres
        </p>
      </div>

      {/* ── Contenu ── */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <div className="w-8 h-8 border-2 border-green-50 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Chargement des performances…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl"><Dna className="w-8 h-8 text-gray-300" /></div>
          <p className="text-sm font-black text-gray-500">Aucune performance trouvée</p>
          <p className="text-xs text-gray-400">
            {searchTerm ? "Essayez de modifier votre recherche" : "Commencez par créer un enregistrement"}
          </p>
          {!searchTerm && (
            <button onClick={() => setShowForm(true)}
              className="mt-1 flex items-center gap-2 px-4 py-2.5 bg-green-50 text-white text-sm rounded-xl font-black">
              <Plus className="w-4 h-4" /> Créer un enregistrement
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const animal = allAnimals.find((a: any) => a.id === p.animalId) as any;
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-all cursor-pointer" onClick={() => setDetailItem(p)}>
                      <td className="px-4 py-3">
                        <span className="text-sm font-black text-gray-700">{animal?.name ?? `A-${p.animalId}`}</span>
                        <span className="text-[10px] text-gray-400 block">#{p.id}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm font-black text-yellow-500">{fmt(p.growthRate, "%")}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{fmt(p.birthWeight, "kg")}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{fmt(p.weaningWeight, "kg")}</td>
                      <td className="px-4 py-3"><ScoreBar value={p.prolificityScore} /></td>
                      <td className="px-4 py-3"><ScoreBar value={p.maternalInstinct} max={10} /></td>
                      <td className="px-4 py-3"><ScoreBar value={p.diseaseResistance} /></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{fmt(p.inbreedingCoeff)}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-50 hover:bg-green-50 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-2">
            {filtered.map((p) => {
              const animal = allAnimals.find((a: any) => a.id === p.animalId) as any;
              return (
                <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm cursor-pointer" onClick={() => setDetailItem(p)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-lg bg-green-50 text-vert border border-green-200">
                          <Dna className="w-3 h-3" />
                          {animal?.name ?? `Animal #${p.animalId}`}
                        </span>
                        <span className="text-[10px] text-gray-400">ID #{p.id}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[9px] text-gray-400 font-black uppercase">Croissance</p>
                          <p className="text-xs font-black text-yellow-500">{fmt(p.growthRate, "%")}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-black uppercase">Naissance</p>
                          <p className="text-xs font-semibold text-gray-700">{fmt(p.birthWeight, "kg")}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-black uppercase">Sevrage</p>
                          <p className="text-xs font-semibold text-gray-700">{fmt(p.weaningWeight, "kg")}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(p)} className="p-2 rounded-xl text-gray-400 hover:text-green-50 hover:bg-green-50 transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Modals ── */}
      {showForm && (
        <FormModal farmId={farmId} initial={editingItem} onClose={closeForm}
          onSuccess={() => { closeForm(); refresh(); }} />
      )}
      {detailItem && (
        <DetailModal item={detailItem} onClose={() => setDetailItem(null)}
          onEdit={() => { openEdit(detailItem); setDetailItem(null); }} />
      )}
      {deleteTarget && (
        <DeleteModal id={deleteTarget.id} onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete} isDeleting={isDeleting} />
      )}
    </div>
  );
};

export default GeneticPerformanceManager;