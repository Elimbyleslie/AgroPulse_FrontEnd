/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Dna,
  Baby,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Heart,
  FlaskConical,
  Syringe,
  User,
  RefreshCw,
  Loader2,
} from "lucide-react";

import {
  fetchReproductionCycles,
  createReproductionCycle,
  updateReproductionCycle,
  deleteReproductionCycle,
  fetchGestations,
  createGestation,
  updateGestation,
  deleteGestation,
} from "../../../store/Reproduction/action";

import { selectCurrentFarm, setCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import { getAllAnimals } from "../../../store/animal/action";

import type {
  FetchReproductionCycle,
  FetchGestation,
  CycleType,
  CycleStatus,
  GestationStatus,
  InseminationType,
  CreateReproductionCyclePayload,
  UpdateReproductionCyclePayload,
  CreateGestationPayload,
  UpdateGestationPayload,
} from "../../../models/reproduction";

// ══════════════════════════════════════════════════════════════════════════════
// LOCAL SelectInput COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
type Option = { value: string | number; label: string };

type SelectInputProps = {
  value: string | number | null;
  onChange: (value: string | number) => void;
  options: Option[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

const SelectInput = ({
  value,
  onChange,
  options,
  loading = false,
  disabled = false,
  placeholder = "Sélectionner",
}: SelectInputProps) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-medium border-gray-100 focus:outline-none focus:ring-2 focus:ring-jaune transition-all
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-gray-50"}`}
      >
        <span
          className={`${!selectedOption ? "text-gray-400" : "text-gray-800"}`}
        >
          {selectedOption?.label || placeholder}
        </span>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {open && !disabled && !loading && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-gray-100 bg-white shadow-lg">
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-400">Aucune option</li>
          )}
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 text-sm font-medium hover:bg-jaune-50 hover:text-yellow-600 transition-all ${
                value === option.value
                  ? "bg-jaune-50 text-yellow-600 font-black"
                  : "text-gray-700"
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SelectInputIndigo = (props: SelectInputProps) => {
  const [open, setOpen] = useState(false);
  const {
    value,
    onChange,
    options,
    loading = false,
    disabled = false,
    placeholder = "Sélectionner",
  } = props;
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-medium border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-gray-50"}`}
      >
        <span
          className={`${!selectedOption ? "text-gray-400" : "text-gray-800"}`}
        >
          {selectedOption?.label || placeholder}
        </span>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {open && !disabled && !loading && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-gray-100 bg-white shadow-lg">
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-400">Aucune option</li>
          )}
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all ${
                value === option.value
                  ? "bg-indigo-50 text-indigo-600 font-black"
                  : "text-gray-700"
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// LOCAL SimpleInput COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
type SimpleInputProps = {
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number | string;
  max?: number | string;
  accentColor?: "jaune" | "indigo";
};

const SimpleInput = ({
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
  min,
  max,
  accentColor = "jaune",
}: SimpleInputProps) => {
  const ring =
    accentColor === "jaune" ? "focus:ring-jaune" : "focus:ring-indigo-300";
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      className={`w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 ${ring} transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
    />
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// HELPER — détecte si un animal est mâle quelle que soit la clé/valeur du backend
// ══════════════════════════════════════════════════════════════════════════════
const isMale = (a: any): boolean => {
  const raw = (a.gender ?? a.sex ?? a.genre ?? a.sexe ?? "")
    .toString()
    .toLowerCase()
    .trim();
  return ["male", "m", "mâle", "masculin", "1"].includes(raw);
};

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGS & HELPERS
// ══════════════════════════════════════════════════════════════════════════════
type ActiveTab = "cycles" | "gestations";
interface ReproductionDashboardProps {
  animalId?: number;
}

const DEFAULT_STATUS_CONFIG = {
  label: "Inconnu",
  color: "text-gray-500",
  bg: "bg-gray-50 border border-gray-200",
  dot: "bg-gray-400",
};
const DEFAULT_TYPE_CONFIG = {
  label: "Inconnu",
  icon: AlertCircle,
  color: "text-gray-400",
};

const cycleStatusConfig: Record<CycleStatus, typeof DEFAULT_STATUS_CONFIG> = {
  en_cours: {
    label: "En cours",
    color: "text-blue-600",
    bg: "bg-blue-50 border border-blue-200",
    dot: "bg-blue-500",
  },
  confirme: {
    label: "Confirmé",
    color: "text-green-600",
    bg: "bg-green-50 border border-green-200",
    dot: "bg-green-500",
  },
  echec: {
    label: "Échec",
    color: "text-red-600",
    bg: "bg-red-50 border border-red-200",
    dot: "bg-red-500",
  },
  termine: {
    label: "Terminé",
    color: "text-gray-500",
    bg: "bg-gray-50 border border-gray-200",
    dot: "bg-gray-400",
  },
};

const cycleTypeConfig: Record<
  CycleType,
  { label: string; icon: React.ElementType; color: string }
> = {
  chaleur: { label: "Chaleur", icon: Heart, color: "text-jaune" },
  insemination: {
    label: "Insémination",
    icon: Syringe,
    color: "text-blue-500",
  },
  confirmation: {
    label: "Confirmation",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  echec: { label: "Échec", icon: AlertCircle, color: "text-red-500" },
};

const gestationStatusConfig: Record<
  GestationStatus,
  typeof DEFAULT_STATUS_CONFIG
> = {
  en_attente: {
    label: "En attente",
    color: "text-yellow-600",
    bg: "bg-yellow-50 border border-yellow-200",
    dot: "bg-yellow-500",
  },
  confirmee: {
    label: "Confirmée",
    color: "text-blue-600",
    bg: "bg-blue-50 border border-blue-200",
    dot: "bg-blue-500",
  },
  en_cours: {
    label: "En cours",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border border-indigo-200",
    dot: "bg-indigo-500",
  },
  terminee: {
    label: "Terminée",
    color: "text-green-600",
    bg: "bg-green-50 border border-green-200",
    dot: "bg-green-500",
  },
  avortement: {
    label: "Avortement",
    color: "text-red-600",
    bg: "bg-red-50 border border-red-200",
    dot: "bg-red-500",
  },
};

const getCycleStatus = (s: any) =>
  cycleStatusConfig[s as CycleStatus] ?? {
    ...DEFAULT_STATUS_CONFIG,
    label: String(s ?? "?"),
  };
const getCycleType = (t: any) =>
  cycleTypeConfig[t as CycleType] ?? {
    ...DEFAULT_TYPE_CONFIG,
    label: String(t ?? "?"),
  };
const getGestStatus = (s: any) =>
  gestationStatusConfig[s as GestationStatus] ?? {
    ...DEFAULT_STATUS_CONFIG,
    label: String(s ?? "?"),
  };

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtDateInput = (d?: string | null) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

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

// ══════════════════════════════════════════════════════════════════════════════
// ANIMAL SELECTOR
// ══════════════════════════════════════════════════════════════════════════════
const AnimalSelector: React.FC<{
  value: any;
  onChange: (id: number) => void;
  animals: any[];
  accentColor: "jaune" | "indigo";
  disabled?: boolean;
}> = ({ value, onChange, animals, accentColor, disabled }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const ring =
    accentColor === "jaune" ? "focus:ring-jaune" : "focus:ring-indigo-300";
  const hover =
    accentColor === "jaune"
      ? "hover:bg-jaune-50 hover:text-yellow-600"
      : "hover:bg-indigo-50 hover:text-indigo-600";
  const selected =
    accentColor === "jaune"
      ? "bg-jaune-50 text-yellow-600 font-black"
      : "bg-indigo-50 text-indigo-600 font-black";

  const filtered = animals.filter((a) =>
    a.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const current = animals.find((a) => a.id === Number(value));

  if (disabled) {
    return (
      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-100 rounded-xl text-sm font-medium text-gray-500 flex items-center gap-2">
        <User className="w-3.5 h-3.5 text-gray-400" />
        {current?.name ?? (value ? `Animal #${value}` : "—")}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-left flex items-center justify-between focus:outline-none focus:ring-2 ${ring} transition-all`}
      >
        <span className={current ? "text-gray-800" : "text-gray-400"}>
          {current ? current.name : "— Choisir un animal —"}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                autoFocus
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">
                Aucun animal trouvé
              </p>
            ) : (
              filtered.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    onChange(a.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm font-medium ${hover} transition-all flex items-center gap-2 ${Number(value) === a.id ? selected : "text-gray-700"}`}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                  {a.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DELETE CONFIRM MODAL
// ══════════════════════════════════════════════════════════════════════════════
const DeleteConfirmModal: React.FC<{
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl">
      <h3 className="text-base font-black text-gray-800 mb-1">
        Confirmer la suppression ?
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Cette action est irréversible.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-2 rounded-xl text-sm font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2 rounded-xl text-sm font-black bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <>
              <Spinner />
              Suppression…
            </>
          ) : (
            "Supprimer"
          )}
        </button>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// MODAL CYCLE FORM
// ══════════════════════════════════════════════════════════════════════════════
const CycleFormModal: React.FC<{
  farmId: number;
  animalId?: number;
  initial?: FetchReproductionCycle | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, animalId, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const currentUser = useAppSelector(
    (state) => state.authentification.auth.user,
  );
  const animalsRaw = useAppSelector(
    (state) => state.animal?.animalist?.entities,
  );

  // Normalise en tableau
  const animals: any[] = Array.isArray(animalsRaw)
    ? animalsRaw
    : animalsRaw
      ? [animalsRaw]
      : [];

  // ✅ Filtre robuste — couvre gender/sex/genre/sexe en toutes casses
  const males = animals.filter(isMale);

  // Charge tous les animaux dès l'ouverture du modal
  useEffect(() => {
    dispatch(getAllAnimals({ farmId, limit: 200, page: 1 }));
  }, [farmId, dispatch]);

  const [form, setForm] = useState({
    animalId: initial?.animalId ?? animalId ?? "",
    cycleType: (initial?.cycleType ?? "chaleur") as CycleType,
    startDate: fmtDateInput(initial?.startDate),
    endDate: fmtDateInput(initial?.endDate),
    status: (initial?.status ?? "en_cours") as CycleStatus,
    heatIntensity: (initial?.heatIntensity ?? "") as any,
    heatBehavior: initial?.heatBehavior ?? "",
    inseminationType: (initial?.inseminationType ?? "") as
      | InseminationType
      | "",
    // ✅ Correction : initial?.maleId (pas initial?.animalId)
    maleId: (initial?.maleId ?? "") as any,
    semenBatch: initial?.semenBatch ?? "",
    technicianId: (initial?.technicianId ?? currentUser?.id ?? "") as any,
    technicianName: currentUser?.name ?? "",
    notes: initial?.notes ?? "",
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.animalId || !form.startDate) return;
    setSaving(true);
    try {
      const base = {
        cycleType: form.cycleType,
        startDate: form.startDate,
        status: form.status,
        ...(form.endDate && { endDate: form.endDate }),
        ...(form.heatIntensity !== "" && {
          heatIntensity: Number(form.heatIntensity),
        }),
        ...(form.heatBehavior && { heatBehavior: form.heatBehavior }),
        ...(form.inseminationType && {
          inseminationType: form.inseminationType as InseminationType,
        }),
        ...(form.maleId !== "" && { maleId: Number(form.maleId) }),
        ...(form.semenBatch && { semenBatch: form.semenBatch }),
        ...(form.technicianId !== "" && {
          technicianId: Number(form.technicianId),
        }),
        ...(form.notes && { notes: form.notes }),
      };
      if (initial) {
        await dispatch(
          updateReproductionCycle({
            id: initial.id,
            ...base,
          } as UpdateReproductionCyclePayload),
        ).unwrap();
      } else {
        await dispatch(
          createReproductionCycle({
            farmId,
            animalId: Number(form.animalId),
            ...base,
          } as CreateReproductionCyclePayload),
        ).unwrap();
      }
      onSuccess();
    } catch {
      /* toast géré slice */
    } finally {
      setSaving(false);
    }
  };

  const cycleTypeOptions = (
    ["chaleur", "insemination", "confirmation", "echec"] as CycleType[]
  ).map((t) => ({ value: t, label: cycleTypeConfig[t].label }));
  const cycleStatusOptions = (
    ["en_cours", "confirme", "echec", "termine"] as CycleStatus[]
  ).map((s) => ({ value: s, label: cycleStatusConfig[s].label }));
  const inseminationTypeOptions = [
    { value: "", label: "— choisir —" },
    { value: "naturelle", label: "Naturelle" },
    { value: "artificielle", label: "Artificielle" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-jaune-50 rounded-lg">
              <Dna className="w-4 h-4 text-jaune" />
            </div>
            <span className="font-black text-gray-800 text-sm">
              {initial ? "Modifier le cycle" : "Nouveau cycle de reproduction"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Animal *
            </label>
            <AnimalSelector
              value={form.animalId}
              animals={animals}
              accentColor="jaune"
              disabled={!!(animalId || initial)}
              onChange={(id) => set("animalId", id)}
            />
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Type de cycle *
            </label>
            <SelectInput
              value={form.cycleType}
              onChange={(v) => set("cycleType", v)}
              options={cycleTypeOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Date début *
              </label>
              <SimpleInput
                type="date"
                value={form.startDate}
                onChange={(v) => set("startDate", v)}
                accentColor="jaune"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Date fin
              </label>
              <SimpleInput
                type="date"
                value={form.endDate}
                onChange={(v) => set("endDate", v)}
                accentColor="jaune"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Statut
            </label>
            <SelectInput
              value={form.status}
              onChange={(v) => set("status", v)}
              options={cycleStatusOptions}
            />
          </div>

          {form.cycleType === "chaleur" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                  Intensité (1-5)
                </label>
                <SimpleInput
                  type="number"
                  min={1}
                  max={5}
                  value={form.heatIntensity}
                  onChange={(v) => set("heatIntensity", v)}
                  accentColor="jaune"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                  Comportement
                </label>
                <SimpleInput
                  type="text"
                  value={form.heatBehavior}
                  onChange={(v) => set("heatBehavior", v)}
                  placeholder="ex: agitation…"
                  accentColor="jaune"
                />
              </div>
            </div>
          )}

          {form.cycleType === "insemination" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                  Type insémination
                </label>
                <SelectInput
                  value={form.inseminationType}
                  onChange={(v) => {
                    set("inseminationType", v);
                    // Reset les champs liés au type quand on change
                    set("maleId", "");
                    set("semenBatch", "");
                  }}
                  options={inseminationTypeOptions}
                  placeholder="— choisir —"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                  {form.inseminationType === "artificielle"
                    ? "Lot semence"
                    : "Mâle reproducteur"}
                </label>

                {form.inseminationType === "artificielle" ? (
                  <SimpleInput
                    type="text"
                    value={form.semenBatch}
                    onChange={(v) => set("semenBatch", v)}
                    placeholder="ex: LOT-2024-01"
                    accentColor="jaune"
                  />
                ) : // ✅ AnimalSelector filtré sur les mâles uniquement
                males.length > 0 ? (
                  <AnimalSelector
                    value={form.maleId}
                    animals={males}
                    accentColor="jaune"
                    onChange={(id) => set("maleId", id)}
                  />
                ) : (
                  <div className="w-full px-3 py-2 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 italic text-center">
                    Aucun mâle disponible
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Technicien / Vétérinaire
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{form.technicianName || "Utilisateur connecté"}</span>
              <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-lg">
                Auto
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-jaune resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.animalId || !form.startDate}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-jaune text-white hover:bg-yellow-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Spinner />
                Enregistrement…
              </>
            ) : initial ? (
              "Modifier"
            ) : (
              "Créer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL GESTATION FORM
// ══════════════════════════════════════════════════════════════════════════════
const GestationFormModal: React.FC<{
  farmId: number;
  animalId?: number;
  initial?: FetchGestation | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, animalId, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const currentUser = useAppSelector(
    (state) => state.authentification.auth.user,
  );
  const animalsRaw = useAppSelector(
    (state) => state.animal?.animalist?.entities,
  );
  const animals: any[] = Array.isArray(animalsRaw)
    ? animalsRaw
    : animalsRaw
      ? [animalsRaw]
      : [];
  const cyclesRaw = useAppSelector((state) => state.reproduction.cycles);

  const cyclesList: any[] = Array.isArray(cyclesRaw)
    ? cyclesRaw
    : cyclesRaw
      ? [cyclesRaw]
      : [];
  const availableCycles = animalId
    ? cyclesList.filter((c: any) => c.animalId === animalId)
    : cyclesList;

  useEffect(() => {
    dispatch(fetchReproductionCycles({ farmId, limit: 10 }));
  }, [farmId, dispatch]);

  useEffect(() => {
    dispatch(getAllAnimals({ farmId, limit: 200, page: 1 }));
  }, [farmId, dispatch]);

  const [form, setForm] = useState({
    animalId: initial?.animalId ?? animalId ?? "",
    reproductionCycleId: (initial?.reproductionCycleId ?? "") as any,
    inseminationDate: fmtDateInput(initial?.inseminationDate),
    expectedDeliveryDate: fmtDateInput(initial?.expectedDeliveryDate),
    actualDeliveryDate: fmtDateInput(initial?.actualDeliveryDate),
    status: (initial?.status ?? "en_attente") as GestationStatus,
    confirmationDate: fmtDateInput(initial?.confirmationDate),
    confirmationMethod: initial?.confirmationMethod ?? "",
    numberOfOffspring: (initial?.numberOfOffspring ?? "") as any,
    complications: initial?.complications ?? "",
    veterinarianId: (initial?.veterinarianId ?? currentUser?.id ?? "") as any,
    veterinarianName: currentUser?.name ?? "",
    notes: initial?.notes ?? "",
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.animalId || !form.inseminationDate || !form.expectedDeliveryDate)
      return;
    setSaving(true);
    try {
      const base = {
        status: form.status,
        ...(form.expectedDeliveryDate && {
          expectedDeliveryDate: form.expectedDeliveryDate,
        }),
        ...(form.actualDeliveryDate && {
          actualDeliveryDate: form.actualDeliveryDate,
        }),
        ...(form.confirmationDate && {
          confirmationDate: form.confirmationDate,
        }),
        ...(form.confirmationMethod && {
          confirmationMethod: form.confirmationMethod as any,
        }),
        ...(form.numberOfOffspring !== "" && {
          numberOfOffspring: Number(form.numberOfOffspring),
        }),
        ...(form.complications && { complications: form.complications }),
        ...(form.veterinarianId !== "" && {
          veterinarianId: Number(form.veterinarianId),
        }),
        ...(form.notes && { notes: form.notes }),
      };
      if (initial) {
        await dispatch(
          updateGestation({
            id: initial.id,
            ...base,
          } as UpdateGestationPayload),
        ).unwrap();
      } else {
        await dispatch(
          createGestation({
            farmId,
            animalId: Number(form.animalId),
            reproductionCycleId: Number(form.reproductionCycleId),
            inseminationDate: form.inseminationDate,
            ...base,
          } as CreateGestationPayload),
        ).unwrap();
      }
      onSuccess();
    } catch {
      /* toast géré slice */
    } finally {
      setSaving(false);
    }
  };

  const gestationStatusOptions = (
    [
      "en_attente",
      "confirmee",
      "en_cours",
      "terminee",
      "avortement",
    ] as GestationStatus[]
  ).map((s) => ({ value: s, label: gestationStatusConfig[s].label }));
  const confirmationMethodOptions = [
    { value: "", label: "— choisir —" },
    { value: "echographie", label: "Échographie" },
    { value: "palpation", label: "Palpation" },
    { value: "test_sanguin", label: "Test sanguin" },
    { value: "observation", label: "Observation" },
  ];

  const cycleOptions = availableCycles.map((c: any) => ({
  value: c.id,
  label: `#${c.id} – ${cycleTypeConfig[c.cycleType as CycleType]?.label ?? c.cycleType} (${fmtDate(c.startDate)})`,
}));

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <Baby className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="font-black text-gray-800 text-sm">
              {initial ? "Modifier la gestation" : "Nouvelle gestation"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Animal *
            </label>
            <AnimalSelector
              value={form.animalId}
              animals={animals}
              accentColor="indigo"
              disabled={!!(animalId || initial)}
              onChange={(id) => set("animalId", id)}
            />
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Cycle de reproduction *
            </label>
            <SelectInputIndigo
              value={form.reproductionCycleId}
              onChange={(v) => set("reproductionCycleId", v)}
              options={cycleOptions}
              disabled={!!initial}
              placeholder="— Choisir un cycle —"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Date insémination *
              </label>
              <SimpleInput
                type="date"
                value={form.inseminationDate}
                onChange={(v) => set("inseminationDate", v)}
                disabled={!!initial}
                accentColor="indigo"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Mise-bas prévue *
              </label>
              <SimpleInput
                type="date"
                value={form.expectedDeliveryDate}
                onChange={(v) => set("expectedDeliveryDate", v)}
                accentColor="indigo"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Date réelle mise-bas
              </label>
              <SimpleInput
                type="date"
                value={form.actualDeliveryDate}
                onChange={(v) => set("actualDeliveryDate", v)}
                accentColor="indigo"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Statut
              </label>
              <SelectInputIndigo
                value={form.status}
                onChange={(v) => set("status", v)}
                options={gestationStatusOptions}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Date confirmation
              </label>
              <SimpleInput
                type="date"
                value={form.confirmationDate}
                onChange={(v) => set("confirmationDate", v)}
                accentColor="indigo"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Méthode
              </label>
              <SelectInputIndigo
                value={form.confirmationMethod}
                onChange={(v) => set("confirmationMethod", v)}
                options={confirmationMethodOptions}
                placeholder="— choisir —"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Nombre de petits prévu
            </label>
            <SimpleInput
              type="number"
              value={form.numberOfOffspring}
              onChange={(v) => set("numberOfOffspring", v)}
              accentColor="indigo"
            />
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Vétérinaire suivi
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{form.veterinarianName || "Utilisateur connecté"}</span>
              <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-lg">
                Auto
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Complications
            </label>
            <SimpleInput
              type="text"
              value={form.complications}
              onChange={(v) => set("complications", v)}
              placeholder="Décrivez les complications éventuelles…"
              accentColor="indigo"
            />
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              saving ||
              !form.animalId ||
              !form.inseminationDate ||
              !form.expectedDeliveryDate
            }
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-indigo-500 text-white hover:bg-indigo-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Spinner />
                Enregistrement…
              </>
            ) : initial ? (
              "Modifier"
            ) : (
              "Créer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL DÉTAIL CYCLE
// ══════════════════════════════════════════════════════════════════════════════
const CycleDetailModal: React.FC<{
  cycle: FetchReproductionCycle;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ cycle, onClose, onEdit, onDelete }) => {
  const st = getCycleStatus(cycle.status);
  const tp = getCycleType(cycle.cycleType);
  const TypeIcon = tp.icon;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TypeIcon className={`w-4 h-4 ${tp.color}`} />
            <span className="font-black text-gray-800">{tp.label}</span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-lg ${st.bg} ${st.color}`}
            >
              {st.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {cycle.animal && (
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {cycle.animal.name}
              {cycle.animal.species && (
                <span className="text-gray-400 font-normal">
                  · {cycle.animal.species.name}
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-black text-gray-400 uppercase mb-0.5">
                Début
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {fmtDate(cycle.startDate)}
              </p>
            </div>
            {cycle.endDate && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-black text-gray-400 uppercase mb-0.5">
                  Fin
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {fmtDate(cycle.endDate)}
                </p>
              </div>
            )}
          </div>
          {cycle.heatIntensity && (
            <div className="bg-jaune-50 rounded-xl p-3">
              <p className="text-xs font-black text-jaune-400 uppercase mb-1">
                Chaleur
              </p>
              <p className="text-sm font-semibold text-gray-700">
                Intensité : {cycle.heatIntensity}/5
                {cycle.heatBehavior && (
                  <span className="text-xs text-gray-500 ml-2">
                    · {cycle.heatBehavior}
                  </span>
                )}
              </p>
            </div>
          )}
          {cycle.inseminationType && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-black text-blue-400 uppercase mb-1">
                Insémination
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                <span className="font-semibold capitalize">
                  {cycle.inseminationType}
                </span>
                {cycle.semenBatch && (
                  <span className="text-xs text-gray-500">
                    Lot : {cycle.semenBatch}
                  </span>
                )}
                {cycle.male && (
                  <span className="text-xs text-gray-500">
                    Mâle : {cycle.male.name}
                  </span>
                )}
              </div>
            </div>
          )}
          {cycle.technician && (
            <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
              <FlaskConical className="w-3.5 h-3.5" />
              Technicien : {cycle.technician.name}
            </div>
          )}
          {cycle.notes && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase mb-1">
                Notes
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                {cycle.notes}
              </p>
            </div>
          )}
          {cycle.gestation && (
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-xl px-3 py-2">
              <Baby className="w-3.5 h-3.5" />
              Gestation liée · {getGestStatus(cycle.gestation.status).label}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            <Pencil className="w-4 h-4" />
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black bg-red-50 text-red-500 hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL DÉTAIL GESTATION
// ══════════════════════════════════════════════════════════════════════════════
const GestationDetailModal: React.FC<{
  gestation: FetchGestation;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ gestation, onClose, onEdit, onDelete }) => {
  const st = getGestStatus(gestation.status);
  const daysLeft = gestation.expectedDeliveryDate
    ? Math.ceil(
        (new Date(gestation.expectedDeliveryDate).getTime() - Date.now()) /
          86400000,
      )
    : null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-indigo-500" />
            <span className="font-black text-gray-800">Détail gestation</span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-lg ${st.bg} ${st.color}`}
            >
              {st.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {gestation.animal && (
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {gestation.animal.name}
              {gestation.animal.species && (
                <span className="text-gray-400 font-normal">
                  · {gestation.animal.species.name}
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-black text-blue-400 uppercase mb-0.5">
                Insémination
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {fmtDate(gestation.inseminationDate)}
              </p>
            </div>
            <div
              className={`rounded-xl p-3 ${daysLeft !== null && daysLeft <= 14 && daysLeft > 0 ? "bg-orange-50" : "bg-indigo-50"}`}
            >
              <p className="text-xs font-black text-indigo-400 uppercase mb-0.5">
                Mise-bas prévue
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {fmtDate(gestation.expectedDeliveryDate)}
              </p>
              {daysLeft !== null && daysLeft > 0 && (
                <p
                  className={`text-xs font-black mt-0.5 ${daysLeft <= 14 ? "text-orange-500" : "text-indigo-400"}`}
                >
                  J-{daysLeft}
                </p>
              )}
            </div>
          </div>
          {gestation.gestationDays != null && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-xs font-black text-gray-400 uppercase">
                Jours de gestation
              </span>
              <span className="text-sm font-black text-gray-700">
                {gestation.gestationDays} j
              </span>
            </div>
          )}
          {gestation.confirmationMethod && (
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs font-black text-green-500 uppercase mb-1">
                Confirmation
              </p>
              <div className="flex gap-2 text-sm text-gray-700">
                <span className="capitalize">
                  {gestation.confirmationMethod.replace("_", " ")}
                </span>
                {gestation.confirmationDate && (
                  <span className="text-xs text-gray-400">
                    · {fmtDate(gestation.confirmationDate)}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {gestation.numberOfOffspring && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-black text-gray-400 uppercase mb-0.5">
                  Petits prévus
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {gestation.numberOfOffspring}
                </p>
              </div>
            )}
            {gestation.veterinarian && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-black text-gray-400 uppercase mb-0.5">
                  Vétérinaire
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {gestation.veterinarian.name}
                </p>
              </div>
            )}
          </div>
          {gestation.complications && (
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs font-black text-red-400 uppercase mb-1">
                Complications
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {gestation.complications}
              </p>
            </div>
          )}
          {gestation.notes && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase mb-1">
                Notes
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                {gestation.notes}
              </p>
            </div>
          )}
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            <Pencil className="w-4 h-4" />
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black bg-red-50 text-red-500 hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TABLEAU CYCLES
// ══════════════════════════════════════════════════════════════════════════════
const CyclesTable: React.FC<{
  cycles: FetchReproductionCycle[];
  loading: boolean;
  onAdd: () => void;
  onDetail: (c: FetchReproductionCycle) => void;
  onEdit: (c: FetchReproductionCycle) => void;
  onDelete: (c: FetchReproductionCycle) => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  statusFilter: CycleStatus | "all";
  onStatusFilterChange: (v: CycleStatus | "all") => void;
}> = ({
  cycles,
  loading,
  onAdd,
  onDetail,
  onEdit,
  onDelete,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const filtered = cycles
    .filter((c) => statusFilter === "all" || c.status === statusFilter)
    .filter((c) => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        c.animal?.name?.toLowerCase().includes(s) ||
        String(c.cycleType).toLowerCase().includes(s)
      );
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Rechercher animal, type…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-jaune transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(
            [
              { val: "all", label: "Tous" },
              { val: "en_cours", label: "En cours" },
              { val: "confirme", label: "Confirmé" },
              { val: "echec", label: "Échec" },
              { val: "termine", label: "Terminé" },
            ] as { val: CycleStatus | "all"; label: string }[]
          ).map(({ val, label }) => (
            <button
              key={val}
              onClick={() => onStatusFilterChange(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${statusFilter === val ? (val === "all" ? "bg-jaune text-white" : `${getCycleStatus(val).bg} ${getCycleStatus(val).color}`) : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <div className="w-8 h-8 border-2 border-jaune-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Chargement des cycles…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <Dna className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm font-black text-gray-500">Aucun cycle trouvé</p>
          <p className="text-xs text-gray-400">
            {searchTerm || statusFilter !== "all"
              ? "Essayez de modifier vos filtres"
              : "Commencez par ajouter un cycle"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={onAdd}
              className="mt-1 flex items-center gap-2 px-4 py-2.5 bg-jaune text-white text-sm rounded-xl font-black"
            >
              <Plus className="w-4 h-4" />
              Ajouter un cycle
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Animal",
                    "Type",
                    "Début",
                    "Fin",
                    "Statut",
                    "Insémination",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const st = getCycleStatus(c.status);
                  const tp = getCycleType(c.cycleType);
                  const TypeIcon = tp.icon;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-all cursor-pointer"
                      onClick={() => onDetail(c)}
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-700">
                          {c.animal?.name ?? `#${c.animalId}`}
                        </span>
                        {c.animal?.species && (
                          <span className="text-xs text-gray-400 ml-1">
                            · {c.animal.species.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`flex items-center gap-1.5 text-xs font-black ${tp.color}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          {tp.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                        {fmtDate(c.startDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {fmtDate(c.endDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-black px-2 py-1 rounded-lg ${st.bg} ${st.color}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                          />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {c.inseminationType ? (
                          <span className="capitalize">
                            {c.inseminationType}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEdit(c)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-jaune hover:bg-jaune-50 transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(c)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
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
          <div className="md:hidden flex flex-col gap-2">
            {filtered.map((c) => {
              const st = getCycleStatus(c.status);
              const tp = getCycleType(c.cycleType);
              const TypeIcon = tp.icon;
              return (
                <div
                  key={c.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm cursor-pointer"
                  onClick={() => onDetail(c)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`flex items-center gap-1 text-xs font-black ${tp.color}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          {tp.label}
                        </span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg ${st.bg} ${st.color}`}
                        >
                          {st.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        {c.animal?.name ?? `Animal #${c.animalId}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmtDate(c.startDate)}
                        {c.endDate && ` → ${fmtDate(c.endDate)}`}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onEdit(c)}
                        className="p-2 rounded-xl text-gray-400 hover:text-jaune hover:bg-jaune-50 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(c)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TABLEAU GESTATIONS
// ══════════════════════════════════════════════════════════════════════════════
const GestationsTable: React.FC<{
  gestations: FetchGestation[];
  loading: boolean;
  onAdd: () => void;
  onDetail: (g: FetchGestation) => void;
  onEdit: (g: FetchGestation) => void;
  onDelete: (g: FetchGestation) => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  statusFilter: GestationStatus | "all";
  onStatusFilterChange: (v: GestationStatus | "all") => void;
}> = ({
  gestations,
  loading,
  onAdd,
  onDetail,
  onEdit,
  onDelete,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const filtered = gestations
    .filter((g) => statusFilter === "all" || g.status === statusFilter)
    .filter(
      (g) =>
        !searchTerm ||
        g.animal?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Rechercher animal…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(
            [
              { val: "all", label: "Toutes" },
              { val: "en_attente", label: "En attente" },
              { val: "confirmee", label: "Confirmée" },
              { val: "en_cours", label: "En cours" },
              { val: "terminee", label: "Terminée" },
              { val: "avortement", label: "Avortement" },
            ] as { val: GestationStatus | "all"; label: string }[]
          ).map(({ val, label }) => (
            <button
              key={val}
              onClick={() => onStatusFilterChange(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${statusFilter === val ? (val === "all" ? "bg-indigo-500 text-white" : `${getGestStatus(val).bg} ${getGestStatus(val).color}`) : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Chargement des gestations…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <Baby className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm font-black text-gray-500">
            Aucune gestation trouvée
          </p>
          <p className="text-xs text-gray-400">
            {searchTerm || statusFilter !== "all"
              ? "Essayez de modifier vos filtres"
              : "Commencez par ajouter une gestation"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={onAdd}
              className="mt-1 flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm rounded-xl font-black"
            >
              <Plus className="w-4 h-4" />
              Ajouter une gestation
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Animal",
                    "Insémination",
                    "Mise-bas prévue",
                    "J restants",
                    "Statut",
                    "Confirmation",
                    "Petits",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => {
                  const st = getGestStatus(g.status);
                  const daysLeft = Math.ceil(
                    (new Date(g.expectedDeliveryDate).getTime() - Date.now()) /
                      86400000,
                  );
                  return (
                    <tr
                      key={g.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-all cursor-pointer"
                      onClick={() => onDetail(g)}
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-700">
                          {g.animal?.name ?? `#${g.animalId}`}
                        </span>
                        {g.animal?.species && (
                          <span className="text-xs text-gray-400 ml-1">
                            · {g.animal.species.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                        {fmtDate(g.inseminationDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                        {fmtDate(g.expectedDeliveryDate)}
                      </td>
                      <td className="px-4 py-3">
                        {g.status !== "terminee" &&
                        g.status !== "avortement" ? (
                          <span
                            className={`text-xs font-black ${daysLeft <= 0 ? "text-red-500" : daysLeft <= 14 ? "text-orange-500" : "text-indigo-500"}`}
                          >
                            {daysLeft <= 0 ? "Dépassé" : `J-${daysLeft}`}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-black px-2 py-1 rounded-lg ${st.bg} ${st.color}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                          />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 capitalize">
                        {g.confirmationMethod?.replace("_", " ") ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {g.numberOfOffspring ?? "—"}
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEdit(g)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(g)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
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
          <div className="md:hidden flex flex-col gap-2">
            {filtered.map((g) => {
              const st = getGestStatus(g.status);
              const daysLeft = Math.ceil(
                (new Date(g.expectedDeliveryDate).getTime() - Date.now()) /
                  86400000,
              );
              return (
                <div
                  key={g.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm cursor-pointer"
                  onClick={() => onDetail(g)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg ${st.bg} ${st.color}`}
                        >
                          {st.label}
                        </span>
                        {g.status !== "terminee" &&
                          g.status !== "avortement" && (
                            <span
                              className={`text-xs font-black ${daysLeft <= 0 ? "text-red-500" : daysLeft <= 14 ? "text-orange-500" : "text-indigo-400"}`}
                            >
                              {daysLeft <= 0 ? "Dépassé" : `J-${daysLeft}`}
                            </span>
                          )}
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        {g.animal?.name ?? `Animal #${g.animalId}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <Calendar className="inline w-3 h-3 mr-0.5" />
                        Prévu : {fmtDate(g.expectedDeliveryDate)}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onEdit(g)}
                        className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(g)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
const ReproductionDashboard: React.FC<ReproductionDashboardProps> = ({
  animalId,
}) => {
  const dispatch = useAppDispatch();
  const { cycles, gestations, loading } = useAppSelector(
    (state) => state.reproduction,
  );
  const currentUser = useAppSelector(
    (state) => state.authentification.auth.user,
  );
  const currentFarm = useAppSelector(selectCurrentFarm);
  const farmId = currentFarm?.id;

  const [activeTab, setActiveTab] = useState<ActiveTab>("cycles");
  const [isLoadingFarm, setIsLoadingFarm] = useState(false);
  const [cycleSearch, setCycleSearch] = useState("");
  const [gestationSearch, setGestationSearch] = useState("");
  const [cycleStatusFilter, setCycleStatusFilter] = useState<
    CycleStatus | "all"
  >("all");
  const [gestationStatusFilter, setGestationStatusFilter] = useState<
    GestationStatus | "all"
  >("all");
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [showGestationForm, setShowGestationForm] = useState(false);
  const [editingCycle, setEditingCycle] =
    useState<FetchReproductionCycle | null>(null);
  const [editingGestation, setEditingGestation] =
    useState<FetchGestation | null>(null);
  const [detailCycle, setDetailCycle] = useState<FetchReproductionCycle | null>(
    null,
  );
  const [detailGestation, setDetailGestation] = useState<FetchGestation | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "cycle" | "gestation";
    id: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!currentFarm && currentUser?.id) {
        setIsLoadingFarm(true);
        try {
          const result = await dispatch(getUserFarms()).unwrap();
          const farms = result?.data || result;
          if (Array.isArray(farms) && farms.length > 0) {
            const first = farms[0];
            dispatch(setCurrentFarm(first));
            dispatch(
              fetchReproductionCycles({
                farmId: first.id,
                ...(animalId && { animalId }),
              }),
            );
            dispatch(
              fetchGestations({
                farmId: first.id,
                ...(animalId && { animalId }),
              }),
            );
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingFarm(false);
        }
      }
    };
    load();
  }, [currentUser?.id, currentFarm, dispatch, animalId]);

  useEffect(() => {
    if (!farmId) return;
    dispatch(
      fetchReproductionCycles({ farmId, ...(animalId && { animalId }) }),
    );
    dispatch(fetchGestations({ farmId, ...(animalId && { animalId }) }));
  }, [dispatch, farmId, animalId]);

  const refresh = useCallback(() => {
    if (!farmId) return;
    dispatch(
      fetchReproductionCycles({ farmId, ...(animalId && { animalId }) }),
    );
    dispatch(fetchGestations({ farmId, ...(animalId && { animalId }) }));
  }, [dispatch, farmId, animalId]);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      if (confirmDelete.type === "cycle")
        await dispatch(deleteReproductionCycle(confirmDelete.id)).unwrap();
      else await dispatch(deleteGestation(confirmDelete.id)).unwrap();
      setConfirmDelete(null);
    } catch {
      /* toast */
    } finally {
      setIsDeleting(false);
    }
  };

  const cyclesList = Array.isArray(cycles) ? cycles : cycles ? [cycles] : [];
  const gestationsList = Array.isArray(gestations)
    ? gestations
    : gestations
      ? [gestations]
      : [];
  const cyclesForFarm = cyclesList.filter((c: any) =>
    animalId ? c.animalId === animalId : true,
  );
  const gestationsForFarm = gestationsList.filter((g: any) =>
    animalId ? g.animalId === animalId : true,
  );

  const upcomingDeliveries = gestationsForFarm.filter((g: any) => {
    if (g.status === "terminee" || g.status === "avortement") return false;
    const d = Math.ceil(
      (new Date(g.expectedDeliveryDate).getTime() - Date.now()) / 86400000,
    );
    return d >= 0 && d <= 30;
  }).length;

  if (isLoadingFarm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-semibold">
          Chargement de votre ferme...
        </p>
      </div>
    );
  }

  if (!farmId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="p-6 bg-orange-50 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-orange-500" />
        </div>
        <h3 className="text-xl font-black text-gray-800">
          Aucune ferme trouvée
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          Veuillez créer une ferme pour continuer.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pt-20">
      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Dna className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Reproduction</h2>
            <p className="text-sm text-gray-400 font-medium">
              {currentFarm?.name && `${currentFarm.name} • `}Cycles & Gestations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              activeTab === "cycles"
                ? setShowCycleForm(true)
                : setShowGestationForm(true)
            }
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm text-white rounded-xl font-black shadow transition-all ${activeTab === "cycles" ? "bg-jaune hover:bg-yellow-600" : "bg-indigo-500 hover:bg-indigo-600"}`}
          >
            <Plus className="w-4 h-4" />
            {activeTab === "cycles" ? "Nouveau cycle" : "Nouvelle gestation"}
          </button>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Cycles actifs",
              value: cyclesForFarm.filter((c: any) => c.status === "en_cours")
                .length,
              color: "text-yellow-600",
              bg: "bg-jaune-50",
            },
            {
              label: "Gestations en cours",
              value: gestationsForFarm.filter((g: any) =>
                ["en_cours", "confirmee", "en_attente"].includes(g.status),
              ).length,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Mise-bas < 30j",
              value: upcomingDeliveries,
              color: "text-orange-500",
              bg: "bg-orange-50",
            },
            {
              label: "Cycles terminés",
              value: cyclesForFarm.filter((c: any) => c.status === "termine")
                .length,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-2xl p-3 text-center`}
            >
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab("cycles")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === "cycles" ? "bg-white text-yellow-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
        >
          <Dna className="w-4 h-4" />
          Cycles
          {cyclesForFarm.length > 0 && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-lg font-black ${activeTab === "cycles" ? "bg-jaune-50 text-jaune" : "bg-gray-200 text-gray-500"}`}
            >
              {cyclesForFarm.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("gestations")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === "gestations" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
        >
          <Baby className="w-4 h-4" />
          Gestations
          {gestationsForFarm.length > 0 && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-lg font-black ${activeTab === "gestations" ? "bg-indigo-50 text-indigo-500" : "bg-gray-200 text-gray-500"}`}
            >
              {gestationsForFarm.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "cycles" ? (
        <CyclesTable
          cycles={cyclesForFarm}
          loading={loading}
          onAdd={() => setShowCycleForm(true)}
          onDetail={(c) => setDetailCycle(c)}
          onEdit={(c) => {
            setEditingCycle(c);
            setShowCycleForm(true);
          }}
          onDelete={(c) => setConfirmDelete({ type: "cycle", id: c.id })}
          searchTerm={cycleSearch}
          onSearchChange={setCycleSearch}
          statusFilter={cycleStatusFilter}
          onStatusFilterChange={setCycleStatusFilter}
        />
      ) : (
        <GestationsTable
          gestations={gestationsForFarm}
          loading={loading}
          onAdd={() => setShowGestationForm(true)}
          onDetail={(g) => setDetailGestation(g)}
          onEdit={(g) => {
            setEditingGestation(g);
            setShowGestationForm(true);
          }}
          onDelete={(g) => setConfirmDelete({ type: "gestation", id: g.id })}
          searchTerm={gestationSearch}
          onSearchChange={setGestationSearch}
          statusFilter={gestationStatusFilter}
          onStatusFilterChange={setGestationStatusFilter}
        />
      )}

      {showCycleForm && farmId && (
        <CycleFormModal
          farmId={farmId}
          animalId={animalId}
          initial={editingCycle}
          onClose={() => {
            setShowCycleForm(false);
            setEditingCycle(null);
          }}
          onSuccess={() => {
            setShowCycleForm(false);
            setEditingCycle(null);
            refresh();
          }}
        />
      )}
      {showGestationForm && farmId && (
        <GestationFormModal
          farmId={farmId}
          animalId={animalId}
          initial={editingGestation}
          onClose={() => {
            setShowGestationForm(false);
            setEditingGestation(null);
          }}
          onSuccess={() => {
            setShowGestationForm(false);
            setEditingGestation(null);
            refresh();
          }}
        />
      )}
      {detailCycle && (
        <CycleDetailModal
          cycle={detailCycle}
          onClose={() => setDetailCycle(null)}
          onEdit={() => {
            setEditingCycle(detailCycle);
            setDetailCycle(null);
            setShowCycleForm(true);
          }}
          onDelete={() => {
            setConfirmDelete({ type: "cycle", id: detailCycle.id });
            setDetailCycle(null);
          }}
        />
      )}
      {detailGestation && (
        <GestationDetailModal
          gestation={detailGestation}
          onClose={() => setDetailGestation(null)}
          onEdit={() => {
            setEditingGestation(detailGestation);
            setDetailGestation(null);
            setShowGestationForm(true);
          }}
          onDelete={() => {
            setConfirmDelete({ type: "gestation", id: detailGestation.id });
            setDetailGestation(null);
          }}
        />
      )}
      {confirmDelete && (
        <DeleteConfirmModal
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default ReproductionDashboard;
