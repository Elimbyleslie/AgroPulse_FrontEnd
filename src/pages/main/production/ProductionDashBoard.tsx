/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search, RefreshCw, ChevronRight, Filter, Download,
  Layers, TrendingUp, BarChart3, Calendar, ChevronDown, ChevronUp,
  Award, Package, Plus, Pencil, Trash2, X
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchProductions, fetchProductionStats,
  createProduction, updateProduction, deleteProduction,
} from "../../../store/production/action";

import {
  selectProductions, selectProductionsLoading, selectProductionStatsData,
} from "../../../features/productions/productionSelectors";

import { selectCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import { getAllAnimals } from "../../../store/animal/action";
import { getAllLots } from "../../../store/lot/action";
import { getAllHerds } from "../../../store/herd/action";
import { getAllPens } from "../../../store/pen/action";
import SelectInput from "../../../components/UI/SelectInput";
import type { FetchProduction } from "../../../models/production";
import type { Herd } from "../../../models/herd";
import type { FecthLot } from "../../../models/lot";
import type { Pen } from "../../../models/pen";

// ── Helpers ─────────────────────────────────────────────────────────────────────
const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDateInput = (d?: string) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

const fmtNum = (n?: number | null, dec = 1) =>
  n != null ? Number(n).toFixed(dec).replace(".", ",") : "—";

const categoryLabel = (cat: string) => cat === "Product" ? "Produit" : "Sous-produit";

const qualityColors: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  B: "bg-blue-100 text-blue-700 border border-blue-200",
  C: "bg-amber-100 text-amber-700 border border-amber-200",
};

// ── Delete Modal ─────────────────────────────────────────────────────────────────
const DeleteModal: React.FC<{
  production: FetchProduction;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ production, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Supprimer cette production ?</h3>
          <p className="text-sm text-gray-500">{production.Type} · {production.quantity} {production.unit}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
        Cette action est <strong>irréversible</strong>. La production sera définitivement supprimée.
      </p>
      <div className="flex gap-2">
        <button onClick={onCancel} disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50">
          Annuler
        </button>
        <button onClick={onConfirm} disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rouge text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {isDeleting ? <><Spinner /> Suppression…</> : "Confirmer"}
        </button>
      </div>
    </div>
  </div>
);

// ── Form Modal ───────────────────────────────────────────────────────────────────
const ProductionFormModal: React.FC<{
  farmId: number;
  userId?: number;
  animals: any[];
  lots: any[];
  herds: any[];
  pens: any[];
  initial?: FetchProduction | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, userId, animals, lots, herds, pens, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"base" | "origine">("base");

  const [form, setForm] = useState({
    Category: initial?.Category || ("Product" as "Product" | "byproduct"),
    Type: initial?.Type || "",
    quantity: initial?.quantity || ("" as any),
    unit: initial?.unit || "L",
    date: fmtDateInput(initial?.date),
    qualityGrade: initial?.qualityGrade || "",
    notes: initial?.notes || "",
    lotId:    initial?.lotId    ? String(initial.lotId)    : "",
    animalId: initial?.animalId ? String(initial.animalId) : "",
    herdId:   initial?.herdId   ? String(initial.herdId)   : "",
    penId:    initial?.penId    ? String(initial.penId)    : "",
  });

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  // Options SelectInput dérivées des props
  const animalOptions = animals.map((a) => ({ value: String(a.id), label: a.name ?? `Animal #${a.id}` }));
  const lotOptions    = lots.map((l)    => ({ value: String(l.id), label: (l as any).name ?? `Lot #${l.id}` }));
  const herdOptions   = herds.map((h)   => ({ value: String(h.id), label: (h as any).name ?? `Troupeau #${h.id}` }));
  const penOptions    = pens.map((p)    => ({ value: String(p.id), label: (p as any).name ?? `Enclos #${p.id}` }));

  const hasOrigine = form.lotId || form.animalId || form.herdId || form.penId;

  const handleSubmit = async () => {
    if (!form.Type || !form.quantity || !form.unit || !form.date) return;
    setSaving(true);
    try {
      const payload: any = {
        farmId, userId,
        Category: form.Category,
        Type: form.Type,
        quantity: Number(form.quantity),
        unit: form.unit,
        date: form.date,
        qualityGrade: form.qualityGrade || null,
        notes: form.notes || null,
        lotId:    form.lotId    ? Number(form.lotId)    : null,
        animalId: form.animalId ? Number(form.animalId) : null,
        herdId:   form.herdId   ? Number(form.herdId)   : null,
        penId:    form.penId    ? Number(form.penId)    : null,
      };
      if (initial) {
        await dispatch(updateProduction({ id: initial.id, data: payload })).unwrap();
        toast.success("Production mise à jour avec succès");
      } else {
        await dispatch(createProduction(payload)).unwrap();
        toast.success("Production enregistrée avec succès");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {initial ? "Modifier la production" : "Nouvelle production"}
              </h2>
              <p className="text-xs text-gray-400">
                {initial ? `ID #${initial.id}` : "Remplissez les informations"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {[
            { key: "base", label: "Production" },
            { key: "origine", label: "Origine / Assignation", badge: hasOrigine ? "✓" : undefined },
          ].map(({ key, label, badge }) => (
            <button key={key} onClick={() => setActiveSection(key as any)}
              className={`py-3 px-1 mr-5 text-sm font-semibold border-b-2 transition ${
                activeSection === key
                  ? "border-vert text-vert"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              {label}
              {badge && <span className="ml-1.5 text-xs bg-emerald-100 text-vert px-1.5 py-0.5 rounded-full">{badge}</span>}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {activeSection === "base" && (
            <>
              {/* Catégorie */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Catégorie</label>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                  {["Product", "byproduct"].map((cat) => (
                    <button key={cat} type="button" onClick={() => set("Category", cat)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                        form.Category === cat ? "bg-white text-vert shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}>
                      {cat === "Product" ? "Produit" : "Sous-produit"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Type <span className="text-red-400">*</span>
                </label>
                <input type="text" value={form.Type} onChange={(e) => set("Type", e.target.value)}
                  placeholder="ex: Lait, Œufs, Viande..." className={inputClass} />
              </div>

              {/* Quantité + Unité */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Quantité <span className="text-red-400">*</span>
                  </label>
                  <input type="number" step="0.01" value={form.quantity}
                    onChange={(e) => set("quantity", e.target.value)}
                    className={inputClass} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Unité</label>
                  <SelectInput value={form.unit} onChange={(v) => set("unit", v)}
                    options={[
                      { value: "L", label: "Litres" },
                      { value: "kg", label: "Kilogrammes" },
                      { value: "pcs", label: "Pièces" },
                      { value: "g", label: "Grammes" },
                    ]} />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Date <span className="text-red-400">*</span>
                </label>
                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
              </div>

              {/* Qualité */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Qualité</label>
                <SelectInput value={form.qualityGrade} onChange={(v) => set("qualityGrade", v)}
                  options={[
                    { value: "", label: "Non définie" },
                    { value: "A", label: "A — Excellente" },
                    { value: "B", label: "B — Bonne" },
                    { value: "C", label: "C — Acceptable" },
                  ]} />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
                  className={`${inputClass} resize-none`} placeholder="Observations, remarques..." />
              </div>
            </>
          )}

          {activeSection === "origine" && (
            <>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                Associez cette production à un ou plusieurs éléments de votre élevage.
                Ces champs sont <span className="font-semibold text-gray-600">optionnels</span>.
              </p>

              {/* Lot */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-vert" />
                  </div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Lot</p>
                </div>
                <SelectInput
                  value={form.lotId}
                  onChange={(v) => set("lotId", v)}
                  options={lotOptions}
                  placeholder="— choisir un lot —"
                />
                {lotOptions.length === 0 && (
                  <p className="text-[10px] text-orange-500 font-semibold">
                    Aucun lot trouvé pour cette ferme.
                  </p>
                )}
              </div>

              {/* Animal */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Package className="w-3.5 h-3.5 text-jaune" />
                  </div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Animal</p>
                </div>
                <SelectInput
                  value={form.animalId}
                  onChange={(v) => set("animalId", v)}
                  options={animalOptions}
                  placeholder="— choisir un animal —"
                />
                {animalOptions.length === 0 && (
                  <p className="text-[10px] text-orange-500 font-semibold">
                    Aucun animal trouvé pour cette ferme.
                  </p>
                )}
              </div>

              {/* Troupeau (Herd) */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-bleu" />
                  </div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Troupeau (Herd)</p>
                </div>
                <SelectInput
                  value={form.herdId}
                  onChange={(v) => set("herdId", v)}
                  options={herdOptions}
                  placeholder="— choisir un troupeau —"
                />
                {herdOptions.length === 0 && (
                  <p className="text-[10px] text-orange-500 font-semibold">
                    Aucun troupeau trouvé pour cette ferme.
                  </p>
                )}
              </div>

              {/* Enclos (Pen) */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Enclos (Pen)</p>
                </div>
                <SelectInput
                  value={form.penId}
                  onChange={(v) => set("penId", v)}
                  options={penOptions}
                  placeholder="— choisir un enclos —"
                />
                {penOptions.length === 0 && (
                  <p className="text-[10px] text-orange-500 font-semibold">
                    Aucun enclos trouvé pour cette ferme.
                  </p>
                )}
              </div>

              {/* Résumé assignation */}
              {hasOrigine && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-vert mb-1.5">Assignations actives</p>
                  <div className="flex flex-wrap gap-2">
                    {form.lotId && (
                      <span className="text-xs bg-white border border-emerald-200 text-vert font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {lotOptions.find((o) => o.value === form.lotId)?.label ?? `Lot #${form.lotId}`}
                        <button onClick={() => set("lotId", "")}
                          className="ml-1 text-gray-400 hover:text-rouge transition">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {form.animalId && (
                      <span className="text-xs bg-white border border-amber-200 text-amber-600 font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {animalOptions.find((o) => o.value === form.animalId)?.label ?? `Animal #${form.animalId}`}
                        <button onClick={() => set("animalId", "")}
                          className="ml-1 text-gray-400 hover:text-rouge transition">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {form.herdId && (
                      <span className="text-xs bg-white border border-blue-200 text-bleu font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {herdOptions.find((o) => o.value === form.herdId)?.label ?? `Troupeau #${form.herdId}`}
                        <button onClick={() => set("herdId", "")}
                          className="ml-1 text-gray-400 hover:text-rouge transition">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {form.penId && (
                      <span className="text-xs bg-white border border-purple-200 text-purple-600 font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {penOptions.find((o) => o.value === form.penId)?.label ?? `Enclos #${form.penId}`}
                        <button onClick={() => set("penId", "")}
                          className="ml-1 text-gray-400 hover:text-rouge transition">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
            Annuler
          </button>
          {activeSection === "base" ? (
            <button onClick={() => setActiveSection("origine")}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-800 text-white hover:bg-gray-700 transition flex items-center justify-center gap-2">
              Suivant : Origine <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit}
              disabled={saving || !form.Type || !form.quantity || !form.date}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200">
              {saving ? <><Spinner /> Enregistrement…</> : initial ? "Enregistrer les modifications" : "Créer la production"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; bg: string;
}> = ({ label, value, sub, icon, bg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

// ── Type Distribution Bar ─────────────────────────────────────────────────────────
const TypeBar: React.FC<{ productions: FetchProduction[] }> = ({ productions }) => {
  const types = useMemo(() => {
    const map: Record<string, number> = {};
    productions.forEach((p) => { map[p.Type] = (map[p.Type] || 0) + p.quantity; });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([type, qty]) => ({ type, qty, pct: total > 0 ? (qty / total) * 100 : 0 }));
  }, [productions]);

  const barColors = ["bg-vert", "bg-bleu", "bg-jaune", "bg-rouge", "bg-gray-400"];
  if (types.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Répartition par type</p>
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-3">
        {types.map((t, i) => (
          <div key={t.type} className={`${barColors[i]} rounded-sm transition-all`}
            style={{ width: `${t.pct}%` }} title={`${t.type}: ${fmtNum(t.qty)}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {types.map((t, i) => (
          <div key={t.type} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${barColors[i]}`} />
            <span className="text-xs text-gray-600 font-medium">{t.type}</span>
            <span className="text-xs text-gray-400">{t.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Column Header ─────────────────────────────────────────────────────────────────
type SortKey = "date" | "Type" | "Category" | "quantity" | "qualityGrade";

const ColHeader: React.FC<{
  label: string; colKey: SortKey; current: SortKey; dir: "asc" | "desc"; onSort: (k: SortKey) => void;
}> = ({ label, colKey, current, dir, onSort }) => (
  <button onClick={() => onSort(colKey)}
    className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition">
    {label}
    {current === colKey
      ? dir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3 opacity-20" />}
  </button>
);

// ── Main Component ─────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 20;

const ProductionTableau: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const currentUser = useAppSelector((state) => state.authentification?.auth?.user);
  const productions = useAppSelector(selectProductions);
  const stats = useAppSelector(selectProductionStatsData);
  const isLoading = useAppSelector(selectProductionsLoading);

  const farmId = currentFarm?.id;

  // ── Listes depuis le store (même pattern que FeedingPlanDashboard) ──
  const lotsRaw   = useAppSelector((s) => s.lot.entities  ?? s.lot  ?? []);
  const herdsRaw  = useAppSelector((s) => s.herd.entities ?? s.herd ?? []);
  const pensRaw   = useAppSelector((s) => s.pen.entities  ?? s.pen  ?? []);
  const animalsRaw = useAppSelector((s) => s.animal?.animalist?.entities);

  const lots:    FecthLot[] = Array.isArray(lotsRaw)    ? lotsRaw    : [];
  const herds:   Herd[]     = Array.isArray(herdsRaw)   ? herdsRaw   : [];
  const pens:    Pen[]      = Array.isArray(pensRaw)    ? pensRaw    : [];
  const animals: any[]      = Array.isArray(animalsRaw) ? animalsRaw : animalsRaw ? [animalsRaw] : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "Product" | "byproduct">("all");
  const [filterType, setFilterType] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FetchProduction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FetchProduction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!farmId && currentUser?.id) dispatch(getUserFarms());
  }, [dispatch, farmId, currentUser?.id]);

  useEffect(() => {
    if (farmId) {
      dispatch(fetchProductions({ farmId, limit: 500 }));
      dispatch(fetchProductionStats({ farmId }));
      dispatch(getAllAnimals({ farmId, limit: 200, page: 1 }));
      dispatch(getAllLots({ farmId, limit: 100 }));
      dispatch(getAllHerds({ farmId }));
      dispatch(getAllPens({ farmId }));
    }
  }, [dispatch, farmId]);

  const refresh = useCallback(() => {
    if (farmId) {
      dispatch(fetchProductions({ farmId, limit: 500 }));
      dispatch(fetchProductionStats({ farmId }));
      toast.info("Données actualisées");
    }
  }, [dispatch, farmId]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProduction(deleteTarget.id)).unwrap();
      toast.success(`"${deleteTarget.Type}" supprimé avec succès`);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const allTypes = useMemo(() => [...new Set(productions.map((p) => p.Type))], [productions]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...productions];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p) =>
        [p.Type, p.animal?.name, p.lot?.name, p.herd?.name, p.pen?.name]
          .some((v) => v?.toLowerCase().includes(q))
      );
    }
    if (filterCategory !== "all") list = list.filter((p) => p.Category === filterCategory);
    if (filterType !== "all") list = list.filter((p) => p.Type === filterType);
    if (filterGrade !== "all") list = list.filter((p) => p.qualityGrade === filterGrade);
    if (dateFrom) list = list.filter((p) => p.date && p.date >= dateFrom);
    if (dateTo) list = list.filter((p) => p.date && p.date <= dateTo);

    list.sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortKey === "date") { aVal = a.date || ""; bVal = b.date || ""; }
      else if (sortKey === "quantity") { aVal = a.quantity; bVal = b.quantity; }
      else if (sortKey === "qualityGrade") { aVal = a.qualityGrade || "Z"; bVal = b.qualityGrade || "Z"; }
      else { aVal = (a as any)[sortKey] || ""; bVal = (b as any)[sortKey] || ""; }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [productions, searchTerm, filterCategory, filterType, filterGrade, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const filteredQty = filtered.reduce((s, p) => s + p.quantity, 0);
  const activeFilters = [filterCategory !== "all", filterType !== "all", filterGrade !== "all", !!dateFrom, !!dateTo, !!searchTerm].filter(Boolean).length;

  const exportCSV = () => {
    const rows = [
      ["Date","Type","Catégorie","Quantité","Unité","Grade","Lot","Troupeau","Animal","Enclos","Notes"],
      ...filtered.map((p) => [
        p.date||"", p.Type, p.Category, p.quantity, p.unit,
        p.qualityGrade||"", p.lot?.name||"", p.herd?.name||"",
        p.animal?.name||"", p.pen?.name||"", p.notes||"",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "productions.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
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
              <span className="text-gray-600 font-medium">Tableau Production</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Tableau Production</h1>
            <p className="text-sm text-gray-400 mt-0.5">Vue complète et filtrable de toutes les productions</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition shadow-sm shadow-emerald-200">
              <Plus className="w-4 h-4" /> Nouvelle production
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total productions" value={stats.total.totalRecords} sub="enregistrements"
              icon={<Layers className="w-5 h-5 text-vert" />} bg="bg-emerald-50" />
            <StatCard label="Quantité totale" value={fmtNum(stats.total.totalQuantity)} sub="toutes unités"
              icon={<TrendingUp className="w-5 h-5 text-bleu" />} bg="bg-blue-50" />
            <StatCard label="Types distincts" value={allTypes.length} sub="types de production"
              icon={<BarChart3 className="w-5 h-5 text-jaune" />} bg="bg-yellow-50" />
            <StatCard label="Dernière entrée" value={productions[0] ? fmtDate(productions[0].date) : "—"}
              sub={productions[0]?.Type || ""}
              icon={<Calendar className="w-5 h-5 text-amber-600" />} bg="bg-amber-50" />
          </div>
        )}

        {/* ── Répartition ── */}
        {productions.length > 0 && <TypeBar productions={productions} />}

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Rechercher type, animal, lot, troupeau, enclos..."
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition" />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(["all", "Product", "byproduct"] as const).map((cat) => (
              <button key={cat} onClick={() => { setFilterCategory(cat); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterCategory === cat ? "bg-vert text-white" : "text-gray-500 hover:text-gray-700"}`}>
                {cat === "all" ? "Tous" : cat === "Product" ? "Produits" : "Sous-produits"}
              </button>
            ))}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${showFilters ? "bg-vert text-white border-vert" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            <Filter className="w-3.5 h-3.5" /> Filtres
            {activeFilters > 0 && (
              <span className={`ml-0.5 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${showFilters ? "bg-white text-vert" : "bg-vert text-white"}`}>
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* ── Filtres avancés ── */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Type</label>
              <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="all">Tous</option>
                {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Grade</label>
              <select value={filterGrade} onChange={(e) => { setFilterGrade(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="all">Tous</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Du</label>
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Au</label>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>
        )}

        {/* ── Résumé filtre ── */}
        {activeFilters > 0 && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
            <p className="text-xs font-semibold text-vert">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""} filtré{filtered.length > 1 ? "s" : ""} · Total : {fmtNum(filteredQty)} unités
            </p>
            <button onClick={() => { setSearchTerm(""); setFilterCategory("all"); setFilterType("all"); setFilterGrade("all"); setDateFrom(""); setDateTo(""); setPage(1); }}
              className="text-xs font-bold text-vert hover:underline">Réinitialiser</button>
          </div>
        )}

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Package className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">Aucune production trouvée</p>
            <p className="text-sm">Modifiez les filtres ou ajoutez des productions</p>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition">
              <Plus className="w-4 h-4" /> Nouvelle production
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* En-tête */}
            <div className="hidden md:grid grid-cols-[110px_1fr_105px_95px_110px_95px_110px_96px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <ColHeader label="Date" colKey="date" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Type" colKey="Type" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Catégorie" colKey="Category" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Quantité" colKey="quantity" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Origine</p>
              <ColHeader label="Grade" colKey="qualityGrade" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notes</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider"></p>
            </div>

            {/* Lignes */}
            <div className="divide-y divide-gray-50">
              {paginated.map((p) => (
                <div key={p.id}
                  className="grid grid-cols-[1fr_auto] md:grid-cols-[110px_1fr_105px_95px_110px_95px_110px_96px] gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition items-center group">
                  <p className="text-xs text-gray-500">{fmtDate(p.date)}</p>
                  <p className="font-semibold text-gray-800 text-sm">{p.Type}</p>
                  <div className="hidden md:block">
                    <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-lg ${p.Category === "Product" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      {categoryLabel(p.Category)}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-gray-800">
                      {p.quantity} <span className="font-normal text-gray-400">{p.unit}</span>
                    </p>
                  </div>
                  <div className="hidden md:flex flex-col gap-0.5">
                    {p.lot    && <span className="text-xs text-gray-500 flex items-center gap-1"><Layers    className="w-3 h-3 text-vert"         />{p.lot.name}</span>}
                    {p.herd   && <span className="text-xs text-gray-500 flex items-center gap-1"><BarChart3  className="w-3 h-3 text-bleu"         />{p.herd.name}</span>}
                    {p.animal && <span className="text-xs text-gray-500 flex items-center gap-1"><Package    className="w-3 h-3 text-jaune"        />{p.animal.name}</span>}
                    {p.pen    && <span className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-purple-500"   />{p.pen.name}</span>}
                    {!p.lot && !p.herd && !p.animal && !p.pen && <span className="text-xs text-gray-300">—</span>}
                  </div>
                  <div className="hidden md:block">
                    {p.qualityGrade ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${qualityColors[p.qualityGrade] || ""}`}>
                        <Award className="w-3 h-3" /> {p.qualityGrade}
                      </span>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </div>
                  <div className="hidden md:block">
                    {p.notes
                      ? <p className="text-xs text-gray-400 truncate max-w-[100px]" title={p.notes}>{p.notes}</p>
                      : <span className="text-xs text-gray-300">—</span>}
                  </div>
                  <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setEditingItem(p); setShowForm(true); }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700" title="Modifier">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(p)}
                      className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge" title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${pg === page ? "bg-vert text-white" : "hover:bg-gray-200 text-gray-600"}`}>
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showForm && farmId && (
        <ProductionFormModal
          farmId={farmId}
          userId={currentUser?.id}
          animals={animals}
          lots={lots}
          herds={herds}
          pens={pens}
          initial={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSuccess={() => { setShowForm(false); setEditingItem(null); refresh(); }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          production={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default ProductionTableau;