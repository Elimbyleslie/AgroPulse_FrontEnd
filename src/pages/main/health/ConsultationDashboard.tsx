/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search, RefreshCw, Plus, Pencil, Trash2, X, Stethoscope,
  Calendar, ChevronRight, ChevronDown, ChevronUp, User2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchConsultations, createConsultation, updateConsultation, deleteConsultation,
} from "../../../store/health/action";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { getAllAnimals } from "../../../store/animal/action";
import { getAllLots } from "../../../store/lot/action";
import SelectInput from "../../../components/UI/SelectInput";
import { selectAuthenticatedUser } from "../../../store/auth/slice";
import type { Consultation, FetchConsultation } from "../../../models/health";

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateInput = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : "");


// ── Modal formulaire ──────────────────────────────────────────────────────
const ConsultationFormModal: React.FC<{
  farmId: number;
  animals: any[];
  lots: any[];
  initial?: FetchConsultation | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, animals, lots, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthenticatedUser)
  const veterinarian = user.user?.id;
  const userName = user.user?.name;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    animalId: initial?.animalId ? String(initial.animalId) : "",
    lotId: initial?.lotId ? String(initial.lotId) : "",
    checkDate: fmtDateInput(initial?.checkDate) || fmtDateInput(new Date().toISOString()),
    veterinarianId: veterinarian ,
    symptoms: initial?.symptoms || "",
    diagnosis: initial?.diagnosis || "",
    treatment: initial?.treatment || "",
  });


  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const animalOptions = animals.map((a) => ({ value: String(a.id), label: a.name ?? `Animal #${a.id}` }));
  const lotOptions = lots.map((l: any) => ({ value: String(l.id), label: l.name ?? `Lot #${l.id}` }));

  const canSubmit = form.animalId && form.checkDate && form.veterinarianId && form.symptoms;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const payload: Consultation = {
        animalId: Number(form.animalId),
        lotId: form.lotId ? Number(form.lotId) : undefined,
        checkDate: form.checkDate,
        farmId,
        veterinarianId: Number(form.veterinarianId),
        symptoms: form.symptoms,
        diagnosis: form.diagnosis || undefined,
        treatment: form.treatment || undefined,
      };
      if (initial) {
        await dispatch(updateConsultation({ id: initial.id, data: payload })).unwrap();
        toast.success("Consultation mise à jour");
      } else {
        await dispatch(createConsultation(payload)).unwrap();
        toast.success("Consultation enregistrée");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition";

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {initial ? "Modifier la consultation" : "Nouvelle consultation"}
              </h2>
              <p className="text-xs text-gray-400">{initial ? `ID #${initial.id}` : "Renseignez les détails"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Animal <span className="text-red-400">*</span>
            </label>
            <SelectInput value={form.animalId} onChange={(v) => set("animalId", v)} options={animalOptions} placeholder="— choisir un animal —" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Lot (optionnel)</label>
            <SelectInput value={form.lotId} onChange={(v) => set("lotId", v)} options={lotOptions} placeholder="— aucun —" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Date <span className="text-red-400">*</span>
              </label>
              <input type="date" value={form.checkDate} onChange={(e) => set("checkDate", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Vétérinaire <span className="text-red-400">*</span>
              </label>
              {/* ⚠️ Pas de liste d'utilisateurs filtrée par rôle vétérinaire disponible — ID brut en attendant */}
              <input type="number"  onChange={(e) => set("veterinarianId", e.target.value)}
                placeholder={userName} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Symptômes <span className="text-red-400">*</span>
            </label>
            <textarea rows={2} value={form.symptoms} onChange={(e) => set("symptoms", e.target.value)}
              className={`${inputClass} resize-none`} placeholder="Symptômes observés..." />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Diagnostic</label>
            <textarea rows={2} value={form.diagnosis} onChange={(e) => set("diagnosis", e.target.value)}
              className={`${inputClass} resize-none`} placeholder="Diagnostic du vétérinaire..." />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Traitement prescrit</label>
            <textarea rows={2} value={form.treatment} onChange={(e) => set("treatment", e.target.value)}
              className={`${inputClass} resize-none`} placeholder="Traitement recommandé..." />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving || !canSubmit}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-blue-700 transition">
            {saving ? <><Spinner /> Enregistrement…</> : initial ? "Enregistrer" : "Créer la consultation"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────
const ConsultationsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const farmId = currentFarm?.id;

  const consultations = useAppSelector((s: any) => s.health.consultations) ?? [];
  const isLoading = useAppSelector((s: any) => s.health.loading);

  const animalsRaw = useAppSelector((s: any) => s.animal?.animalist?.entities);
  const lotsRaw = useAppSelector((s: any) => s.lot?.entities);
  const animals = Array.isArray(animalsRaw) ? animalsRaw : [];
  const lots = Array.isArray(lotsRaw) ? lotsRaw : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FetchConsultation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FetchConsultation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (farmId) {
      dispatch(fetchConsultations(farmId));
      dispatch(getAllAnimals({ farmId, limit: 200, page: 1 }));
      dispatch(getAllLots({ farmId, limit: 100 }));
    }
  }, [dispatch, farmId]);

  const refresh = () => {
    if (farmId) dispatch(fetchConsultations(farmId));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteConsultation({ id: deleteTarget.id })).unwrap();
      toast.success("Consultation supprimée");
      setDeleteTarget(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const findAnimal = (id?: number) => animals.find((a: any) => a.id === id);

  const filtered = useMemo(() => {
    const list = Array.isArray(consultations) ? consultations : [];
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((c: any) =>
      [c.symptoms, c.diagnosis, findAnimal(c.animalId)?.name].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [consultations, searchTerm]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium" />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Santé Animale</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Consultations & Soins</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Consultations & Soins</h1>
            <p className="text-sm text-gray-400 mt-0.5">Historique des visites vétérinaires</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-sm">
              <Plus className="w-4 h-4" /> Nouvelle consultation
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Rechercher par animal, symptôme, diagnostic..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" /><span className="text-sm">Chargement…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Stethoscope className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">Aucune consultation enregistrée</p>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition">
              <Plus className="w-4 h-4" /> Nouvelle consultation
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {filtered.map((c: any) => {
              const isExpanded = expandedId === c.id;
              const animal = findAnimal(c.animalId);
              return (
                <div key={c.id}>
                  <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/70 transition cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {animal?.name ?? `Animal #${c.animalId}`}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{c.symptoms}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      <Calendar className="w-3 h-3" /> {fmtDate(c.checkDate)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      <User2 className="w-3 h-3" /> Vét. #{c.veterinarianId}
                    </span>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditingItem(c); setShowForm(true); }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(c)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-4 pl-16 space-y-2 text-sm">
                      {c.diagnosis && (
                        <p><span className="font-semibold text-gray-600">Diagnostic : </span>
                          <span className="text-gray-500">{c.diagnosis}</span></p>
                      )}
                      {c.treatment && (
                        <p><span className="font-semibold text-gray-600">Traitement : </span>
                          <span className="text-gray-500">{c.treatment}</span></p>
                      )}
                      {!c.diagnosis && !c.treatment && (
                        <p className="text-gray-400 text-xs">Aucun détail supplémentaire</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && farmId && (
        <ConsultationFormModal
          farmId={farmId}
          animals={animals}
          lots={lots}
          initial={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSuccess={() => { setShowForm(false); setEditingItem(null); refresh(); }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Supprimer cette consultation ?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
              Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isDeleting ? <><Spinner /> Suppression…</> : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultationsDashboard;