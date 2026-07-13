/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Baby, Plus, Pencil, Trash2, X, Search,
  AlertTriangle, ChevronDown, ChevronUp,
  RefreshCw, Calendar, User, Hash,
  Heart, CheckCircle2, Layers,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  fetchBirths, createBirth, updateBirth,
  deleteBirth, createReproductionWithBirth,
} from "../../../store/birth/action";
import {
  selectBirths, selectBirthPagination, selectBirthState,
} from "../../../store/birth/slice";
import { selectCurrentFarm, setCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import { getAllAnimals } from "../../../store/animal/action";
import type { Birth } from "../../../models/birth";
import type { Farm } from "../../../models/farm";

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtInput = (d?: string | null) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

const viabilityRate = (born?: number | null, alive?: number | null) => {
  if (!born || !alive) return null;
  return Math.round((alive / born) * 100);
};

// ══════════════════════════════════════════════════════════════════════════════
// FORM MODAL
// ══════════════════════════════════════════════════════════════════════════════
const BirthFormModal: React.FC<{
  farmId: number;
  userId: number;
  animals: any[];
  initial?: Birth | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, userId, animals, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [mode, setMode]     = useState<"simple" | "repro">("simple");

  const [form, setForm] = useState({
    // Birth
    motherId:    (initial?.motherId ?? "")    as any,
    fatherId:    (initial?.fatherId ?? "")    as any,
    lotId:       (initial?.lotId   ?? "")     as any,
    date:        fmtInput(initial?.date)      ?? fmtInput(new Date().toISOString()),
    numberBorn:  (initial?.numberBorn  ?? 1)  as any,
    numberAlive: (initial?.numberAlive ?? 1)  as any,
    numberDead:  (initial?.numberDead  ?? 0)  as any,
    notes:       initial?.notes ?? "",
    // Repro only
    matingDate:    "",
    expectedBirth: "",
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  // Auto-calcul numberDead
  useEffect(() => {
    const born  = Number(form.numberBorn)  || 0;
    const alive = Number(form.numberAlive) || 0;
    set("numberDead", Math.max(0, born - alive));
  }, [form.numberBorn, form.numberAlive]);

  const females = useMemo(() => animals.filter((a) => {
    const g = (a.gender ?? "").toLowerCase();
    return g === "female" || g === "femelle" || g === "f";
  }), [animals]);

  const males = useMemo(() => animals.filter((a) => {
    const g = (a.gender ?? "").toLowerCase();
    return g === "male" || g === "mâle" || g === "m";
  }), [animals]);

  const inp = "w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all";

  const handleSubmit = async () => {
    if (!form.motherId || !form.date) return;
    setSaving(true);
    try {
      if (mode === "repro" && !initial) {
        await dispatch(createReproductionWithBirth({
          femaleId:       Number(form.motherId),
          maleId:         form.fatherId ? Number(form.fatherId) : undefined,
          matingDate:     form.matingDate  || undefined,
          expectedBirth:  form.expectedBirth || undefined,
          actualBirthDate: form.date,
          numberBorn:     Number(form.numberBorn),
          notes:          form.notes || undefined,
        })).unwrap();
        toast.success("Reproduction et naissance créées");
      } else {
        const payload = {
          farmId,
          motherId:    Number(form.motherId),
          fatherId:    form.fatherId    ? Number(form.fatherId)    : undefined,
          lotId:       form.lotId       ? Number(form.lotId)       : undefined,
          date:        form.date,
          numberBorn:  Number(form.numberBorn),
          numberAlive: Number(form.numberAlive),
          numberDead:  Number(form.numberDead),
          notes:       form.notes || undefined,
          userId,
        };
        if (initial) {
          await dispatch(updateBirth({ id: initial.id!, data: payload })).unwrap();
          toast.success("Naissance mise à jour");
        } else {
          await dispatch(createBirth(payload)).unwrap();
          toast.success("Naissance enregistrée");
        }
      }
      onSuccess();
    } catch { toast.error("Une erreur est survenue"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-pink-50 rounded-lg"><Baby className="w-4 h-4 text-pink-500" /></div>
            <span className="font-black text-gray-800 text-sm">
              {initial ? "Modifier la naissance" : "Enregistrer une naissance"}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        {/* Mode toggle (création seulement) */}
        {!initial && (
          <div className="px-5 pt-4 flex gap-2">
            {([
              { key: "simple", label: "Naissance simple",        icon: Baby  },
              { key: "repro",  label: "Avec reproduction",       icon: Heart },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setMode(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all border ${
                  mode === key
                    ? "bg-pink-500 text-white border-pink-500 shadow"
                    : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                }`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3">

          {/* Mère */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Mère *</label>
            <select value={form.motherId} onChange={(e) => set("motherId", e.target.value)}
              disabled={!!initial} className={inp}>
              <option value="">— choisir la mère —</option>
              {females.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Père */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Père</label>
            <select value={form.fatherId} onChange={(e) => set("fatherId", e.target.value)} className={inp}>
              <option value="">— père inconnu —</option>
              {males.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Mode repro — dates supplémentaires */}
          {mode === "repro" && !initial && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Date saillie</label>
                <input type="date" value={form.matingDate} onChange={(e) => set("matingDate", e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Naissance prévue</label>
                <input type="date" value={form.expectedBirth} onChange={(e) => set("expectedBirth", e.target.value)} className={inp} />
              </div>
            </div>
          )}

          {/* Date naissance */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Date de naissance *</label>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inp} />
          </div>

          {/* Compteurs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Nés</label>
              <input type="number" min={0} value={form.numberBorn}
                onChange={(e) => set("numberBorn", e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Vivants</label>
              <input type="number" min={0} max={form.numberBorn} value={form.numberAlive}
                onChange={(e) => set("numberAlive", e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Morts-nés</label>
              <input type="number" min={0} value={form.numberDead} readOnly
                className={`${inp} bg-red-50 border-red-100 text-red-500 cursor-not-allowed`} />
            </div>
          </div>

          {/* Taux viabilité preview */}
          {form.numberBorn > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Taux de survie : <span className="font-black text-green-600">
                {viabilityRate(Number(form.numberBorn), Number(form.numberAlive))}%
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className={`${inp} resize-none`} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50">
            Annuler
          </button>
          <button onClick={handleSubmit}
            disabled={saving || !form.motherId || !form.date}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-pink-500 text-white hover:bg-pink-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Spinner />{initial ? "Mise à jour…" : "Enregistrement…"}</> : initial ? "Modifier" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL MODAL
// ══════════════════════════════════════════════════════════════════════════════
const BirthDetailModal: React.FC<{
  birth:  any;
  onClose: () => void;
  onEdit:  () => void;
  onDelete: () => void;
}> = ({ birth, onClose, onEdit, onDelete }) => {
  const rate = viabilityRate(birth.numberBorn, birth.numberAlive);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-pink-500" />
            <span className="font-black text-gray-800">Détail naissance</span>
            <span className="text-xs text-gray-400 font-medium">#{birth.id}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Date */}
          <div className="flex items-center gap-2 bg-pink-50 rounded-xl px-3 py-2.5">
            <Calendar className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-black text-pink-700">{fmt(birth.date)}</span>
          </div>

          {/* Parents */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-black text-gray-400 uppercase mb-1">Mère</p>
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-300" />
                {birth.mother?.name ?? `#${birth.motherId}`}
              </p>
              {birth.mother?.species && <p className="text-xs text-gray-400 mt-0.5">{birth.mother.species.name}</p>}
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-black text-gray-400 uppercase mb-1">Père</p>
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-300" />
                {birth.father?.name ?? (birth.fatherId ? `#${birth.fatherId}` : "Inconnu")}
              </p>
            </div>
          </div>

          {/* Compteurs */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs font-black text-blue-400 uppercase mb-1">Nés</p>
              <p className="text-2xl font-black text-blue-700">{birth.numberBorn ?? "—"}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs font-black text-green-500 uppercase mb-1">Vivants</p>
              <p className="text-2xl font-black text-green-700">{birth.numberAlive ?? "—"}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${(birth.numberDead ?? 0) > 0 ? "bg-red-50" : "bg-gray-50"}`}>
              <p className={`text-xs font-black uppercase mb-1 ${(birth.numberDead ?? 0) > 0 ? "text-red-400" : "text-gray-400"}`}>Morts-nés</p>
              <p className={`text-2xl font-black ${(birth.numberDead ?? 0) > 0 ? "text-red-600" : "text-gray-500"}`}>{birth.numberDead ?? 0}</p>
            </div>
          </div>

          {/* Viabilité */}
          {rate !== null && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-xs font-black text-gray-400 uppercase">Taux de survie</span>
              <span className={`text-sm font-black ${rate >= 80 ? "text-green-600" : rate >= 50 ? "text-orange-500" : "text-red-600"}`}>
                {rate}%
              </span>
            </div>
          )}

          {/* Lot */}
          {birth.lot && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
              <Layers className="w-3.5 h-3.5" />
              Lot : <span className="font-semibold">{birth.lot.name}</span>
            </div>
          )}

          {/* Newborns */}
          {birth.newborns?.length > 0 && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase mb-2">
                Animaux enregistrés ({birth.newborns.length})
              </p>
              <div className="flex flex-col gap-1">
                {birth.newborns.map((n: any) => (
                  <div key={n.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 text-sm">
                    <Hash className="w-3 h-3 text-gray-300" />
                    <span className="font-semibold text-gray-700">{n.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">#{n.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {birth.notes && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase mb-1">Notes</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{birth.notes}</p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
            <Pencil className="w-4 h-4" />Modifier
          </button>
          <button onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black bg-red-50 text-red-500 hover:bg-red-100 transition-all">
            <Trash2 className="w-4 h-4" />Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DELETE CONFIRM
// ══════════════════════════════════════════════════════════════════════════════
const DeleteModal: React.FC<{
  onCancel: () => void; onConfirm: () => void; isDeleting: boolean;
}> = ({ onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl">
      <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-2xl mb-3">
        <Trash2 className="w-5 h-5" />
      </div>
      <h3 className="text-base font-black text-gray-800 mb-1">Supprimer cette naissance ?</h3>
      <p className="text-sm text-gray-500 mb-4">Cette action est irréversible.</p>
      <div className="flex gap-2">
        <button onClick={onCancel} disabled={isDeleting}
          className="flex-1 py-2 rounded-xl text-sm font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50">
          Annuler
        </button>
        <button onClick={onConfirm} disabled={isDeleting}
          className="flex-1 py-2 rounded-xl text-sm font-black bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {isDeleting ? <><Spinner />Suppression…</> : "Supprimer"}
        </button>
      </div>
    </div>
    </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
const BirthDashboard: React.FC<{ animalId?: number }> = ({ animalId }) => {
  const dispatch    = useAppDispatch();
  const births      = useAppSelector(selectBirths);
  const birthState  = useAppSelector(selectBirthState);
  const pagination  = useAppSelector(selectBirthPagination);
  const currentUser = useAppSelector((s) => s.authentification.auth.user);
  const currentFarm = useAppSelector(selectCurrentFarm);
  const animalsRaw  = useAppSelector((s) => s.animal?.animalist?.entities);
  const farmId      = currentFarm?.id;

  const animals: any[] = useMemo(
    () => (Array.isArray(animalsRaw) ? animalsRaw : []),
    [animalsRaw],
  );

  const [isLoadingFarm,   setIsLoadingFarm]   = useState(false);
  const [showForm,        setShowForm]         = useState(false);
  const [editingBirth,    setEditingBirth]     = useState<any | null>(null);
  const [detailBirth,     setDetailBirth]      = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId]  = useState<number | null>(null);
  const [isDeleting,      setIsDeleting]       = useState(false);
  const [searchTerm,      setSearchTerm]       = useState("");
  const [expandedId,      setExpandedId]       = useState<number | null>(null);
  const [page,            setPage]             = useState(1);

  // ── Hydratation ferme ─────────────────────────────────────────────────────
  useEffect(() => {
    const hydrate = async () => {
      if (!currentUser?.id || currentFarm?.id) return;
      setIsLoadingFarm(true);
      try {
        const result = await dispatch(getUserFarms()).unwrap();
        const farms  = result?.data || result;
        if (Array.isArray(farms) && farms.length > 0) {
          const saved  = localStorage.getItem("last_farm_id");
          const toUse  = saved
            ? (farms.find((f: Farm) => f.id === parseInt(saved, 10)) ?? farms[0])
            : farms[0];
          if (toUse) dispatch(setCurrentFarm(toUse));
        }
      } catch (e) { console.error(e); }
      finally { setIsLoadingFarm(false); }
    };
    hydrate();
  }, [currentUser?.id, currentFarm?.id, dispatch]);

  // ── Chargement ────────────────────────────────────────────────────────────
  const load = useCallback(() => {
    if (!farmId) return;
    dispatch(fetchBirths({
      farmId,
      ...(animalId && { motherId: animalId }),
      page,
      limit: 20,
    }));
  }, [dispatch, farmId, animalId, page]);

  useEffect(() => {
    if (farmId) {
      load();
      dispatch(getAllAnimals({ farmId, limit: 200, page: 1 }));
    }
  }, [farmId, load]);

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchTerm) return births;
    const q = searchTerm.toLowerCase();
    return births.filter((b: any) =>
      b.mother?.name?.toLowerCase().includes(q) ||
      b.father?.name?.toLowerCase().includes(q) ||
      b.lot?.name?.toLowerCase().includes(q)    ||
      String(b.id).includes(q),
    );
  }, [births, searchTerm]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      births.length,
    totalBorn:  births.reduce((acc: number, b: any) => acc + (b.numberBorn  ?? 0), 0),
    totalAlive: births.reduce((acc: number, b: any) => acc + (b.numberAlive ?? 0), 0),
    totalDead:  births.reduce((acc: number, b: any) => acc + (b.numberDead  ?? 0), 0),
  }), [births]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBirth({ id: confirmDeleteId })).unwrap();
      toast.success("Naissance supprimée");
      setConfirmDeleteId(null);
      setDetailBirth(null);
    } catch { toast.error("Erreur lors de la suppression"); }
    finally { setIsDeleting(false); }
  };

  if (isLoadingFarm) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-500">
      <div className="w-11 h-11 rounded-full border-[3px] border-gray-200 border-t-pink-500 animate-spin" />
      <p className="font-semibold">Chargement de la ferme...</p>
    </div>

  );

  if (!farmId) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="p-5 bg-orange-50 rounded-2xl text-orange-500"><AlertTriangle size={32} /></div>
      <p className="font-bold text-gray-700">Aucune ferme sélectionnée</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-50 rounded-xl"><Baby size={22} className="text-pink-500" /></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Registre des Naissances</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {currentFarm?.name ?? ""} • Suivi des mises-bas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white border border-gray-100 transition-all">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => { setEditingBirth(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-pink-500 text-white rounded-xl font-bold text-sm shadow-md shadow-pink-200 transition-all hover:-translate-y-0.5"
          >
            <Plus size={16} /> Nouvelle naissance
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      {!birthState.loading && births.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Mise-bas",    val: stats.total,      cls: "text-gray-700",   bg: "bg-white"      },
            { label: "Total nés",   val: stats.totalBorn,  cls: "text-blue-600",   bg: "bg-blue-50"    },
            { label: "Vivants",     val: stats.totalAlive, cls: "text-green-600",  bg: "bg-green-50"   },
            { label: "Morts-nés",   val: stats.totalDead,  cls: "text-red-600",    bg: "bg-red-50"     },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center border border-gray-100 shadow-sm`}>
              <p className={`text-2xl font-black ${s.cls}`}>{s.val}</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Search ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
            placeholder="Rechercher par mère, père, lot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Liste ── */}
      {birthState.loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <div className="h-3 rounded-lg bg-gray-100 animate-pulse w-2/5" />
                <div className="h-3.5 rounded-lg bg-gray-100 animate-pulse w-3/4" />
                <div className="h-2.5 rounded-lg bg-gray-100 animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="p-5 bg-gray-100 rounded-2xl"><Baby size={28} className="text-gray-300" /></div>
          <p className="text-sm font-black text-gray-500">Aucune naissance trouvée</p>
          <p className="text-xs text-gray-400">
            {searchTerm ? "Modifiez votre recherche" : "Enregistrez la première naissance"}
          </p>
          {!searchTerm && (
            <button onClick={() => setShowForm(true)}
              className="mt-1 flex items-center gap-2 px-4 py-2.5 bg-pink-500 text-white text-sm rounded-xl font-bold shadow-md shadow-pink-200">
              <Plus size={15} /> Enregistrer une naissance
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
                  {["Date","Mère","Père","Nés","Vivants","Morts-nés","Survie","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b: any) => {
                  const rate = viabilityRate(b.numberBorn, b.numberAlive);
                  return (
                    <tr key={b.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-all cursor-pointer"
                      onClick={() => setDetailBirth(b)}>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <Calendar size={13} className="text-pink-400" />{fmt(b.date)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-700">{b.mother?.name ?? `#${b.motherId}`}</span>
                        {b.mother?.species && <span className="text-xs text-gray-400 ml-1">· {b.mother.species.name}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{b.father?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-sm font-black text-blue-600">{b.numberBorn ?? "—"}</td>
                      <td className="px-4 py-3 text-sm font-black text-green-600">{b.numberAlive ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-black ${(b.numberDead ?? 0) > 0 ? "text-red-500" : "text-gray-400"}`}>
                          {b.numberDead ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {rate !== null && (
                          <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                            rate >= 80 ? "bg-green-50 text-green-600" :
                            rate >= 50 ? "bg-orange-50 text-orange-600" :
                            "bg-red-50 text-red-600"
                          }`}>{rate}%</span>
                        )}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingBirth(b); setShowForm(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setConfirmDeleteId(b.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 size={13} />
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
            {filtered.map((b: any) => {
              const rate       = viabilityRate(b.numberBorn, b.numberAlive);
              const isExpanded = expandedId === b.id;
              return (
                <div key={b.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setDetailBirth(b)}>
                    <div className="p-2.5 bg-pink-50 rounded-xl shrink-0">
                      <Baby size={18} className="text-pink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {b.mother?.name ?? `#${b.motherId}`}
                        </p>
                        {rate !== null && (
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                            rate >= 80 ? "bg-green-100 text-green-700" :
                            rate >= 50 ? "bg-orange-100 text-orange-700" :
                            "bg-red-100 text-red-700"
                          }`}>{rate}%</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-blue-600">{b.numberBorn}</span> nés ·{" "}
                        <span className="font-semibold text-green-600">{b.numberAlive}</span> vivants
                        {(b.numberDead ?? 0) > 0 && <> · <span className="font-semibold text-red-500">{b.numberDead}</span> mort-nés</>}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                        <Calendar size={9} />{fmt(b.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditingBirth(b); setShowForm(true); }}
                        className="p-2 rounded-xl text-gray-400 hover:text-pink-500 hover:bg-pink-50">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(b.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : b.id)}
                        className="p-2 rounded-xl text-gray-400 hover:bg-gray-100">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-50 px-4 pb-4 pt-3 flex flex-col gap-2">
                      {b.father?.name && (
                        <p className="text-xs text-gray-500">Père : <span className="font-semibold">{b.father.name}</span></p>
                      )}
                      {b.newborns?.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {b.newborns.length} animal(ux) enregistré(s)
                        </p>
                      )}
                      {b.notes && <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-2">{b.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-2">
          <button disabled={!pagination.previousPage} onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all">
            ← Précédent
          </button>
          <span className="text-xs font-bold text-gray-500">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button disabled={!pagination.nextPage} onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all">
            Suivant →
          </button>
        </div>
      )}

      {/* ══ MODALS ══ */}
      {showForm && farmId && currentUser?.id && (
        <BirthFormModal
          farmId={farmId}
          userId={currentUser.id}
          animals={animals}
          initial={editingBirth}
          onClose={() => { setShowForm(false); setEditingBirth(null); }}
          onSuccess={() => { setShowForm(false); setEditingBirth(null); load(); }}
        />
      )}

      {detailBirth && (
        <BirthDetailModal
          birth={detailBirth}
          onClose={() => setDetailBirth(null)}
          onEdit={() => { setEditingBirth(detailBirth); setDetailBirth(null); setShowForm(true); }}
          onDelete={() => { setConfirmDeleteId(detailBirth.id); setDetailBirth(null); }}
        />
      )}

      {confirmDeleteId !== null && (
        <DeleteModal
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};


export default BirthDashboard;