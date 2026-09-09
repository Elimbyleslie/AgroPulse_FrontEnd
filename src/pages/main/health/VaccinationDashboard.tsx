/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  Syringe,
  Pill,
  Calendar,
  ChevronRight,
  Package,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchVaccination,
  createAnimalVaccination,
  updateAnimalVaccination,
  deleteAnimalVaccination,
  fetchTreatments,
  createAnimalTreatment,
  updateAnimalTreatment,
  deleteAnimalTreatment,
  confirmAnimalVaccination,
  confirmAnimalTreatment,
} from "../../../store/health/action";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { getAllAnimals } from "../../../store/animal/action";
import { getAllLots } from "../../../store/lot/action";
import { fecthInventory } from "../../../store/alimentations/action";
import SelectInput from "../../../components/UI/SelectInput";
import type {
  Vaccination,
  FecthVaccination,
  Treatment,
  FetchTreatment,
} from "../../../models/health";
import {
  getVaccinationStatus,
  getTreatmentStatus,
} from "../../../utilities/healthConfirmation";
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

const fmtDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtDateInput = (d?: string | Date | null) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

type TabType = "vaccinations" | "treatments";

// ── Badge de statut ──────────────────────────────────────────────────────
const StatusBadge: React.FC<{ confirmed: boolean }> = ({ confirmed }) =>
  confirmed ? (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-50 text-vert shrink-0">
      <CheckCircle2 className="w-3 h-3" /> Confirmé
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-amber-50 text-amber-600 shrink-0">
      <Clock className="w-3 h-3" /> En attente
    </span>
  );

// ── Modal Vaccination ────────────────────────────────────────────────────
const VaccinationFormModal: React.FC<{
  farmId: number;
  animals: any[];
  lots: any[];
  medications: any[];
  initial?: FecthVaccination | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, animals, lots, medications, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    animalId: initial?.animalId ? String(initial.animalId) : "",
    lotId: initial?.lotId ? String(initial.lotId) : "",
    inventoryId: initial?.inventoryId ? String(initial.inventoryId) : "",
    vaccineName: initial?.vaccineName || "",
    dateGiven: fmtDateInput(initial?.dateGiven) || fmtDateInput(new Date()),
    nextDue: fmtDateInput(initial?.nextDue),
    administeredBy: initial?.administeredBy
      ? String(initial.administeredBy)
      : "",
    quantityUsed: initial?.quantityUsed ?? "",
  });

  const set = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const animalOptions = animals.map((a) => ({
    value: String(a.id),
    label: a.name ?? `Animal #${a.id}`,
  }));
  const lotOptions = lots.map((l: any) => ({
    value: String(l.id),
    label: l.name ?? `Lot #${l.id}`,
  }));
  const medOptions = medications.map((m: any) => ({
    value: String(m.id),
    label: `${m.name} (${m.quantity} ${m.unit} en stock)`,
  }));

  // Sélectionner un médicament dans la liste pré-remplit le nom du vaccin
  const handleMedicationChange = (value: string | number) => {
    const selectedValue = Number(value);
    set("inventoryId", String(selectedValue));
    const med = medications.find((m: any) => Number(m.id) === selectedValue);
    if (med && !form.vaccineName) set("vaccineName", med.name);
  };

  const canSubmit =
    (form.animalId || form.lotId) && form.vaccineName && form.dateGiven;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const payload: Vaccination = {
        animalId: form.animalId ? Number(form.animalId) : null,
        lotId: form.lotId ? Number(form.lotId) : null,
        inventoryId: form.inventoryId ? Number(form.inventoryId) : null,
        vaccineName: form.vaccineName,
        dateGiven: form.dateGiven,
        nextDue: form.nextDue || null,
        administeredBy: form.administeredBy
          ? Number(form.administeredBy)
          : null,
        quantityUsed: form.quantityUsed ? Number(form.quantityUsed) : null,
        farmId,
      };
      if (initial) {
        await dispatch(
          updateAnimalVaccination({ id: initial.id, data: payload }),
        ).unwrap();
        toast.success("Vaccination mise à jour");
      } else {
        await dispatch(createAnimalVaccination(payload)).unwrap();
        toast.success("Vaccination enregistrée");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm transition";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Syringe className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">
              {initial ? "Modifier la vaccination" : "Nouvelle vaccination"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Animal
              </label>
              <SelectInput
                value={form.animalId}
                onChange={(v) => set("animalId", v)}
                options={animalOptions}
                placeholder="— choisir —"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                ou Lot
              </label>
              <SelectInput
                value={form.lotId}
                onChange={(v) => set("lotId", v)}
                options={lotOptions}
                placeholder="— choisir —"
              />
            </div>
          </div>
          {!form.animalId && !form.lotId && (
            <p className="text-[11px] text-yellow-500 font-semibold -mt-3">
              Choisis un animal ou un lot (au moins un des deux).
            </p>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider  mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Médicament (depuis
              l'inventaire)
            </label>
            <SelectInput
              value={form.inventoryId}
              onChange={handleMedicationChange}
              options={medOptions}
              placeholder="— choisir dans le stock —"
            />
            {medOptions.length === 0 && (
              <p className="text-[10px] text-yellow-500 font-semibold mt-1.5">
                Aucun médicament trouvé dans l'inventaire de cette ferme.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nom du vaccin <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.vaccineName}
              onChange={(e) => set("vaccineName", e.target.value)}
              placeholder="ex: Clostridium, Rage..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Date d'administration <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.dateGiven}
                onChange={(e) => set("dateGiven", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Prochain rappel
              </label>
              <input
                type="date"
                value={form.nextDue}
                onChange={(e) => set("nextDue", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Administré par (ID){" "}
                {/* ⚠️ pas de liste d'utilisateurs vétérinaires — cf. remarque ConsultationsDashboard */}
              </label>
              <input
                type="number"
                value={form.administeredBy}
                onChange={(e) => set("administeredBy", e.target.value)}
                placeholder="ID utilisateur"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Quantité utilisée
              </label>
              <input
                type="number"
                step="0.01"
                value={form.quantityUsed}
                onChange={(e) => set("quantityUsed", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !canSubmit}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
          >
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : initial ? (
              "Enregistrer"
            ) : (
              "Créer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal Traitement ─────────────────────────────────────────────────────
const TreatmentFormModal: React.FC<{
  farmId: number;
  animals: any[];
  lots: any[];
  medications: any[];
  initial?: FetchTreatment | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, animals, lots, medications, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    animalId: initial?.animalId ? String(initial.animalId) : "",
    lotId: initial?.lotId ? String(initial.lotId) : "",
    inventoryId: initial?.inventoryId ? String(initial.inventoryId) : "",
    treatmentName: initial?.treatmentName || "",
    medication: initial?.medication || "",
    dosage: initial?.dosage || "",
    quantityUsed: initial?.quantityUsed ?? "",
    startDate: fmtDateInput(initial?.startDate) || fmtDateInput(new Date()),
    endDate: fmtDateInput(initial?.endDate),
    administeredBy: initial?.administeredBy
      ? String(initial.administeredBy)
      : "",
    frequencyDays: initial?.frequencyDays ? String(initial.frequencyDays) : "1",
  });

  const set = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const animalOptions = animals.map((a) => ({
    value: String(a.id),
    label: a.name ?? `Animal #${a.id}`,
  }));
  const lotOptions = lots.map((l: any) => ({
    value: String(l.id),
    label: l.name ?? `Lot #${l.id}`,
  }));
  const medOptions = medications.map((m: any) => ({
    value: String(m.id),
    label: `${m.name} (${m.quantity} ${m.unit} en stock)`,
  }));

  const handleMedicationChange = (value: string | number) => {
    const v = String(value);
    set("inventoryId", v);
    const med = medications.find((m: any) => String(m.id) === v);
    if (med && !form.medication) set("medication", med.name);
  };

  const canSubmit =
    (form.animalId || form.lotId) && form.treatmentName && form.startDate;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const payload: Treatment = {
        animalId: form.animalId ? Number(form.animalId) : null,
        lotId: form.lotId ? Number(form.lotId) : null,
        inventoryId: form.inventoryId ? Number(form.inventoryId) : null,
        treatmentName: form.treatmentName,
        medication: form.medication || undefined,
        dosage: form.dosage || undefined,
        quantityUsed: form.quantityUsed ? Number(form.quantityUsed) : null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        administeredBy: form.administeredBy
          ? Number(form.administeredBy)
          : null,
        frequencyDays: Number(form.frequencyDays) || 1,
        farmId,
      };
      if (initial) {
        await dispatch(
          updateAnimalTreatment({ id: initial.id, data: payload }),
        ).unwrap();
        toast.success("Traitement mis à jour");
      } else {
        await dispatch(createAnimalTreatment(payload)).unwrap();
        toast.success("Traitement enregistré");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm transition";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Pill className="w-4 h-4 text-jaune" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">
              {initial ? "Modifier le traitement" : "Nouveau traitement"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Animal
              </label>
              <SelectInput
                value={form.animalId}
                onChange={(v) => set("animalId", v)}
                options={animalOptions}
                placeholder="— choisir —"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                ou Lot
              </label>
              <SelectInput
                value={form.lotId}
                onChange={(v) => set("lotId", v)}
                options={lotOptions}
                placeholder="— choisir —"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nom du traitement <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.treatmentName}
              onChange={(e) => set("treatmentName", e.target.value)}
              placeholder="ex: Antiparasitaire, Antibiotique..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Médicament (depuis
              l'inventaire)
            </label>
            <SelectInput
              value={form.inventoryId}
              onChange={handleMedicationChange}
              options={medOptions}
              placeholder="— choisir dans le stock —"
            />
            {medOptions.length === 0 && (
              <p className="text-[10px] text-yellow-500 font-semibold mt-1.5">
                Aucun médicament trouvé dans l'inventaire de cette ferme.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Dosage
              </label>
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => set("dosage", e.target.value)}
                placeholder="ex: 5ml/jour"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Quantité utilisée
              </label>
              <input
                type="number"
                step="0.01"
                value={form.quantityUsed}
                onChange={(e) => set("quantityUsed", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Fréquence (jours)
              </label>
              <input
                type="number"
                min={1}
                value={form.frequencyDays}
                onChange={(e) => set("frequencyDays", e.target.value)}
                placeholder="ex: 1 = tous les jours, 3 = tous les 3 jours"
                className={inputClass}
              />
              <p className="text-[10px] text-gray-400 mt-1.5">
                Intervalle entre deux confirmations autorisées.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Début <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Fin
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Administré par (ID)
            </label>
            <input
              type="number"
              value={form.administeredBy}
              onChange={(e) => set("administeredBy", e.target.value)}
              placeholder="ID utilisateur"
              className={inputClass}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !canSubmit}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-jaune text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-darkJaune transition"
          >
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : initial ? (
              "Enregistrer"
            ) : (
              "Créer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────
// ── Page principale ───────────────────────────────────────────────────────
const VaccinsTraitementsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const farmId = currentFarm?.id;

  const [tab, setTab] = useState<TabType>("vaccinations");

  const vaccinations = useAppSelector((s: any) => s.health.vaccinations) ?? [];
  const treatments = useAppSelector((s: any) => s.health.treatments) ?? [];
  const isLoading = useAppSelector((s: any) => s.health.loading);

  const animalsRaw = useAppSelector((s: any) => s.animal?.animalist?.entities);
  const lotsRaw = useAppSelector((s: any) => s.lot?.entities);
  const medicationsRaw =
    useAppSelector((state) => state.alimentation.Inventory) ?? [];

  const animals = Array.isArray(animalsRaw) ? animalsRaw : [];
  const lots = Array.isArray(lotsRaw) ? lotsRaw : [];
  const allMedications = Array.isArray(medicationsRaw) ? medicationsRaw : [];
  const medications = allMedications.filter(
    (m: any) => !m.category || m.category === "MEDICINE",
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [showVaccForm, setShowVaccForm] = useState(false);
  const [editingVacc, setEditingVacc] = useState<FecthVaccination | null>(null);
  const [showTreatForm, setShowTreatForm] = useState(false);
  const [editingTreat, setEditingTreat] = useState<FetchTreatment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: TabType;
    id: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Confirmation vaccination/traitement ──
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const handleConfirmVaccination = async (id: number) => {
    setConfirmingId(id);
    try {
      await dispatch(confirmAnimalVaccination({ id })).unwrap();
      toast.success("Vaccination confirmée — stock mis à jour");
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la confirmation");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleConfirmTreatment = async (id: number) => {
    setConfirmingId(id);
    try {
      await dispatch(confirmAnimalTreatment({ id })).unwrap();
      toast.success("Traitement confirmé — stock mis à jour");
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la confirmation");
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    if (farmId) {
      dispatch(fetchVaccination({ farmId, limit: 200 }));
      dispatch(fetchTreatments({ farmId, limit: 200 }));
      dispatch(getAllAnimals({ farmId, limit: 200, page: 1 }));
      dispatch(getAllLots({ farmId, limit: 100 }));
      dispatch(fecthInventory({ farmId, category: "MEDICINE", limit: 200 }));
    }
  }, [dispatch, farmId]);

  const refresh = () => {
    if (!farmId) return;
    if (tab === "vaccinations")
      dispatch(fetchVaccination({ farmId, limit: 200 }));
    else dispatch(fetchTreatments({ farmId, limit: 200 }));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "vaccinations") {
        await dispatch(
          deleteAnimalVaccination({ id: deleteTarget.id }),
        ).unwrap();
        toast.success("Vaccination supprimée");
      } else {
        await dispatch(deleteAnimalTreatment({ id: deleteTarget.id })).unwrap();
        toast.success("Traitement supprimé");
      }
      setDeleteTarget(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const findAnimal = (id?: number | null) =>
    animals.find((a: any) => a.id === id);
  const findLot = (id?: number | null) => lots.find((l: any) => l.id === id);

  const filteredVacc = useMemo(() => {
    const list = Array.isArray(vaccinations) ? vaccinations : [];
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((v: any) =>
      [
        v.vaccineName,
        findAnimal(v.animalId)?.name,
        findLot(v.lotId)?.name,
      ].some((val) => val?.toLowerCase().includes(q)),
    );
  }, [vaccinations, searchTerm, animals, lots]);

  const filteredTreat = useMemo(() => {
    const list = Array.isArray(treatments) ? treatments : [];
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((t: any) =>
      [
        t.treatmentName,
        t.medication,
        findAnimal(t.animalId)?.name,
        findLot(t.lotId)?.name,
      ].some((val) => val?.toLowerCase().includes(q)),
    );
  }, [treatments, searchTerm, animals, lots]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium"
      />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Santé Animale</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">
                Vaccins & Traitements
              </span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">
              Vaccins & Traitements
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Suivi sanitaire et pharmacie de la ferme
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                tab === "vaccinations"
                  ? (setEditingVacc(null), setShowVaccForm(true))
                  : (setEditingTreat(null), setShowTreatForm(true))
              }
              className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-semibold text-sm transition shadow-sm ${tab === "vaccinations" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-jaune   hover:bg-darkJaune"}`}
            >
              <Plus className="w-4 h-4" />{" "}
              {tab === "vaccinations"
                ? "Nouvelle vaccination"
                : "Nouveau traitement"}
            </button>
          </div>
        </div>

        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("vaccinations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "vaccinations" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Syringe className="w-4 h-4" /> Vaccinations ({vaccinations.length})
          </button>
          <button
            onClick={() => setTab("treatments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "treatments" ? "bg-jaune text-white" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Pill className="w-4 h-4" /> Traitements ({treatments.length})
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : tab === "vaccinations" ? (
          filteredVacc.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Syringe className="w-10 h-10 text-gray-200" />
              <p className="font-semibold text-gray-500">
                Aucune vaccination enregistrée
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {filteredVacc.map((v: FecthVaccination) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/70 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Syringe className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {v.vaccineName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {v.animalId
                        ? (findAnimal(v.animalId)?.name ??
                          `Animal #${v.animalId}`)
                        : (findLot(v.lotId)?.name ?? `Lot #${v.lotId}`)}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                    <Calendar className="w-3 h-3" /> {fmtDate(v.dateGiven)}
                  </span>
                  {v.nextDue && (
                    <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-1 rounded-lg shrink-0">
                      Rappel {fmtDate(v.nextDue)}
                    </span>
                  )}
                  <StatusBadge confirmed={Boolean(v.vaccinated)} />
                  {(() => {
                    const status = getVaccinationStatus(v);

                    if (status.state === "ready") {
                      return (
                        <button
                          onClick={() => handleConfirmVaccination(v.id)}
                          disabled={confirmingId === v.id}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-vert text-white hover:bg-dark_vert transition disabled:opacity-50 shrink-0"
                        >
                          {confirmingId === v.id ? (
                            <Spinner className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Confirmer
                        </button>
                      );
                    }
                    if (status.state === "waiting") {
                      return (
                        <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 shrink-0">
                          <Clock className="w-3.5 h-3.5" /> Rappel{" "}
                          {fmtDate(status.date)}
                        </span>
                      );
                    }
                    if (status.state === "notyet") {
                      return (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 shrink-0">
                          Prévue {fmtDate(status.date)}
                        </span>
                      );
                    }
                    if (status.state === "missed") {
                      return (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-rouge shrink-0">
                          Rappel manqué
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingVacc(v);
                        setShowVaccForm(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({ type: "vaccinations", id: v.id })
                      }
                      className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredTreat.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Pill className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">
              Aucun traitement enregistré
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {filteredTreat.map((treatments:FetchTreatment) => (
              <div
                key={treatments.id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/70 transition"
              >
                <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4 text-jaune" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {treatments.treatmentName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {treatments.animalId
                      ? (findAnimal(treatments.animalId)?.name ??
                        `Animal #${treatments.animalId}`)
                      : (findLot(treatments.lotId)?.name ?? `Lot #${treatments.lotId}`)}
                    {treatments.dosage ? ` · ${treatments.dosage}` : ""}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <Calendar className="w-3 h-3" /> {fmtDate(treatments.startDate)}
                  {treatments.endDate ? ` → ${fmtDate(treatments.endDate)}` : ""}
                </span>
                <StatusBadge confirmed={Boolean(treatments.treated)} />
                {(() => {
                  const status = getTreatmentStatus(treatments);

                  if (status.state === "ready") {
                    return (
                      <button
                        onClick={() => handleConfirmTreatment(treatments.id)}
                        disabled={confirmingId === treatments.id}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-vert text-white hover:bg-emerald-700 transition disabled:opacity-50 shrink-0"
                      >
                        {confirmingId === treatments.id ? (
                          <Spinner className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Confirmer
                      </button>
                    );
                  }
                  if (status.state === "waiting") {
                    return (
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" /> Prochaine dose{" "}
                        {fmtDate(status.date)}
                      </span>
                    );
                  }
                  if (status.state === "notyet") {
                    return (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 shrink-0">
                        Débute {fmtDate(status.date)}
                      </span>
                    );
                  }
                  return (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 shrink-0">
                      Terminé
                    </span>
                  ); // "done"
                })()}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingTreat(treatments);
                      setShowTreatForm(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({ type: "treatments", id: treatments.id })
                    }
                    className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showVaccForm && farmId && (
        <VaccinationFormModal
          farmId={farmId}
          animals={animals}
          lots={lots}
          medications={medications}
          initial={editingVacc}
          onClose={() => {
            setShowVaccForm(false);
            setEditingVacc(null);
          }}
          onSuccess={() => {
            setShowVaccForm(false);
            setEditingVacc(null);
            dispatch(fetchVaccination({ farmId, limit: 200 }));
          }}
        />
      )}

      {showTreatForm && farmId && (
        <TreatmentFormModal
          farmId={farmId}
          animals={animals}
          lots={lots}
          medications={medications}
          initial={editingTreat}
          onClose={() => {
            setShowTreatForm(false);
            setEditingTreat(null);
          }}
          onSuccess={() => {
            setShowTreatForm(false);
            setEditingTreat(null);
            dispatch(fetchTreatments({ farmId, limit: 200 }));
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Supprimer{" "}
                {deleteTarget.type === "vaccinations"
                  ? "cette vaccination"
                  : "ce traitement"}{" "}
                ?
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
              Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Spinner /> Suppression…
                  </>
                ) : (
                  "Confirmer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VaccinsTraitementsDashboard;
