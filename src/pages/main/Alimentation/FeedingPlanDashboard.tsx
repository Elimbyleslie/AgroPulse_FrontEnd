/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  Repeat,
  User,
  Package,
  CheckCircle2,
} from "lucide-react";
import SelectInput from "../../../components/UI/SelectInput";
import {
  fetchFeedingPlan,
  createFeedingPlan,
  updateFeedingPlan,
  deleteFeedingPlan,
  distributeFeedingPlan,
} from "../../../store/alimentations/action";
import { fetchFeedStock } from "../../../store/alimentations/feedstockAct";
import { selectFeedingPlans, selectFeedingPlanState } from "../../../store/alimentations/slice";
import { selectFeedStock } from "../../../store/alimentations/sliceStock";
import { selectCurrentFarm, setCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import { getAllAnimals } from "../../../store/animal/action";
import type { FeedingPlan } from "../../../models/alimentation";
import { FeedStock } from "../../../models/alimentation";
import { getAllLots } from "../../../store/lot/action";
import { getAllHerds } from "../../../store/herd/action";
import { getAllPens } from "../../../store/pen/action";
import { Herd } from "../../../models/herd";
import { FecthLot } from "../../../models/lot";
import { Pen } from "../../../models/pen";
import { toast } from "react-toastify";

// ── Helpers ──────────────────────────────────────────────────────────────────
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

type Frequency = "daily" | "weekly" | "custom";

const freqConfig: Record<
  Frequency,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  daily: {
    label: "Quotidien",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border border-yellow-200",
    icon: Clock,
  },
  weekly: {
    label: "Hebdomadaire",
    color: "text-green-700",
    bg: "bg-green-50 border border-green-200",
    icon: Calendar,
  },
  custom: {
    label: "Personnalisé",
    color: "text-blue-700",
    bg: "bg-blue-50 border border-blue-200",
    icon: Repeat,
  },
};
const getFreq = (f: any) =>
  freqConfig[f as Frequency] ?? {
    label: String(f ?? "?"),
    color: "text-gray-500",
    bg: "bg-gray-50 border border-gray-200",
    icon: Repeat,
  };

const isActive = (plan: FeedingPlan) => {
  const today = new Date();
  if (new Date(plan.startDate) > today) return false;
  if (plan.endDate && new Date(plan.endDate) < today) return false;
  return true;
};

const isAlreadyDistributed = (plan: FeedingPlan): boolean => {
  if (!plan.lastDistributedAt) return false;
  const lastDist = new Date(plan.lastDistributedAt);
  const now = new Date();
  switch (plan.frequency) {
    case "daily":
      return lastDist.toDateString() === now.toDateString();
    case "weekly":
      return now.getTime() - lastDist.getTime() < 7 * 24 * 60 * 60 * 1000;
    default:
      return false;
  }
};

// ── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteModal: React.FC<{
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-red-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 bg-red-50 rounded-xl">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-black text-gray-800">
            Supprimer ce plan ?
          </h3>
          <p className="text-xs text-gray-400">Plan de ration</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl px-3 py-2 border border-red-100">
        ⚠️ Cette action est <strong>irréversible</strong>.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-black bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
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

// ── Detail Modal ──────────────────────────────────────────────────────────────
const DetailModal: React.FC<{
  plan: FeedingPlan;
  targetName?: string;
  inventoryName?: string;
  onClose: () => void;
  onEdit: () => void;
}> = ({ plan, targetName, inventoryName, onClose, onEdit }) => {
  const freq = getFreq(plan.frequency);
  const FreqIcon = freq.icon;
  const active = isActive(plan);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-yellow-600" />
            <span className="font-black text-gray-800">Plan de ration</span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-lg ${active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}
            >
              {active ? "Actif" : "Inactif"}
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
          {/* Fréquence */}
          <div className={`rounded-xl p-3 ${freq.bg}`}>
            <p className={`text-xs font-black uppercase mb-1 ${freq.color}`}>
              Fréquence
            </p>
            <div className="flex items-center gap-2">
              <FreqIcon className={`w-4 h-4 ${freq.color}`} />
              <span className={`text-sm font-black ${freq.color}`}>
                {freq.label}
              </span>
            </div>
          </div>

          {/* Cible + Aliment */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-black text-gray-400 uppercase mb-0.5">
                Cible
              </p>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  {targetName ??
                    `#${plan.animalId ?? plan.lotId ?? plan.herdId ?? plan.penId}`}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-black text-gray-400 uppercase mb-0.5">
                Aliment (stock)
              </p>
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  {inventoryName ?? `#${plan.feedStockId}`}
                </p>
              </div>
            </div>
          </div>

          {/* Quantité */}
          <div className="bg-indigo-50 rounded-xl p-3">
            <p className="text-xs font-black text-indigo-400 uppercase mb-0.5">
              Quantité / distribution
            </p>
            <p className="text-2xl font-black text-indigo-700">
              {plan.quantity}{" "}
              <span className="text-base font-semibold">{plan.unit}</span>
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-black text-gray-400 uppercase mb-0.5">
                Début
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {fmtDate(plan.startDate)}
              </p>
            </div>
            {plan.endDate && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-black text-gray-400 uppercase mb-0.5">
                  Fin
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {fmtDate(plan.endDate)}
                </p>
              </div>
            )}
          </div>

          {plan.lastDistributedAt && (
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <p className="text-xs font-black text-emerald-500 uppercase mb-0.5">
                Dernière distribution
              </p>
              <p className="text-sm font-semibold text-emerald-700">
                {fmtDate(plan.lastDistributedAt)}
              </p>
            </div>
          )}

          {plan.notes && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase mb-1">
                Notes
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                {plan.notes}
              </p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black bg-yellow-400 text-white hover:bg-yellow-500 transition-all"
          >
            <Pencil className="w-4 h-4" />
            Modifier ce plan
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Form Modal ────────────────────────────────────────────────────────────────
const FormModal: React.FC<{
  farmId: number;
  userId: number;
  animals: any[];
  lots: any[];
  herds: any[];
  pens: any[];
  feedStock: FeedStock[];
  initial?: FeedingPlan | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({
  farmId,
  userId,
  animals,
  lots,
  herds,
  pens,
  feedStock,
  initial,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const getInitialType = (): "animal" | "lot" | "herd" | "pen" => {
    if (initial?.lotId) return "lot";
    if (initial?.herdId) return "herd";
    if (initial?.penId) return "pen";
    return "animal";
  };

  const [targetType, setTargetType] = useState<
    "animal" | "lot" | "herd" | "pen"
  >(getInitialType());
  const [form, setForm] = useState({
    targetId: (initial?.animalId ??
      initial?.lotId ??
      initial?.herdId ??
      initial?.penId ??
      "") as any,
    feedStockId: (initial?.feedStockId ?? "") as any,
    quantity: (initial?.quantity ?? "") as any,
    unit: initial?.unit ?? "kg",
    frequency: (initial?.frequency ?? "daily") as Frequency,
    startDate: fmtDateInput(initial?.startDate),
    endDate: fmtDateInput(initial?.endDate),
    notes: initial?.notes ?? "",
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  // Options pour les cibles
  const targetOptions: Record<
    "animal" | "lot" | "herd" | "pen",
    { value: number; label: string }[]
  > = {
    animal: animals.map((a) => ({
      value: a.id,
      label: a.name ?? `Animal #${a.id}`,
    })),
    lot: lots.map((l) => ({
      value: l.id,
      label: `${l.name ?? `Lot #${l.id}`}${l._count?.animals ? ` (${l._count.animals} têtes)` : ""}`,
    })),
    herd: herds.map((h) => ({
      value: h.id,
      label: `${h.name ?? `Troupeau #${h.id}`}${h._count?.animals ? ` (${h._count.animals} têtes)` : ""}`,
    })),
    pen: pens.map((p) => ({
      value: p.id,
      label: `${p.name ?? `Enclos #${p.id}`}${p._count?.animals ? ` (${p._count.animals} têtes)` : ""}`,
    })),
  };

  // Options d'aliments — feedStock (store des aliments) contient déjà
  // uniquement des articles de type "aliment", pas besoin de filtrage.
  const inventoryOptions = feedStock.map((s) => ({
    value: s.id,
    label: `${s.name} — ${s.quantity} ${s.unit}${s.status ? ` (${s.status})` : ""}`,
  }));

  const unitOptions = ["kg", "g", "l", "ml", "sac", "botte"].map((u) => ({
    value: u,
    label: u,
  }));

  const typeLabels: Record<"animal" | "lot" | "herd" | "pen", string> = {
    animal: "Animal individuel",
    lot: "Lot",
    herd: "Troupeau",
    pen: "Enclos",
  };

  const handleSubmit = async () => {
    if (
      !form.targetId ||
      !form.feedStockId ||
      form.quantity === "" ||
      !form.startDate
    )
      return;
    setSaving(true);
    try {
      const payload: any = {
        farmId,
        userId,
        feedStockId: Number(form.feedStockId),
        quantity: Number(form.quantity),
        unit: form.unit,
        frequency: form.frequency,
        startDate: form.startDate,
        ...(form.endDate && { endDate: form.endDate }),
        ...(form.notes && { notes: form.notes }),
        animalId: targetType === "animal" ? Number(form.targetId) : null,
        lotId: targetType === "lot" ? Number(form.targetId) : null,
        herdId: targetType === "herd" ? Number(form.targetId) : null,
        penId: targetType === "pen" ? Number(form.targetId) : null,
      };
      if (initial) {
        await dispatch(
          updateFeedingPlan({ id: initial.id, data: payload }),
        ).unwrap();
        toast.success("Plan modifié avec succès");
      } else {
        await dispatch(createFeedingPlan(payload)).unwrap();
        toast.success("Plan créé avec succès");
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message ??
          (initial ? "La modification a échoué" : "La création a échoué"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-50 rounded-lg">
              <ClipboardList className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="font-black text-gray-800 text-sm">
              {initial ? "Modifier le plan" : "Nouveau plan de ration"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Type de cible */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-2 block">
              Cible du plan *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["animal", "lot", "herd", "pen"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={!!initial}
                  onClick={() => {
                    setTargetType(type);
                    set("targetId", "");
                  }}
                  className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${
                    targetType === type
                      ? "bg-yellow-400 text-white border-yellow-400 shadow-sm"
                      : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {type === "animal" ? "Indiv." : type}
                </button>
              ))}
            </div>
          </div>

          {/* Sélecteur entité */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              {typeLabels[targetType]} *
            </label>
            <SelectInput
              value={form.targetId}
              onChange={(v) => set("targetId", v)}
              options={targetOptions[targetType]}
              disabled={!!initial}
              placeholder={`— choisir ${targetType === "animal" ? "un animal" : `un ${targetType}`} —`}
            />
            {targetOptions[targetType].length === 0 && (
              <p className="text-[10px] text-orange-500 font-semibold mt-1">
                Aucun {typeLabels[targetType].toLowerCase()} trouvé pour cette
                ferme.
              </p>
            )}
          </div>

          <hr className="border-gray-50" />

          {/* Aliment (stock) */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Aliment (stock) *
            </label>
            <SelectInput
              value={form.feedStockId}
              onChange={(v) => set("feedStockId", v)}
              options={inventoryOptions}
              placeholder="— choisir un aliment —"
            />
            {feedStock.length === 0 && (
              <p className="text-[10px] text-orange-500 font-semibold mt-1">
                Aucun aliment en stock. Créez d'abord un article dans le stock
                d'aliments.
              </p>
            )}
          </div>

          {/* Quantité + Unité */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Qté / tête *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Unité
              </label>
              <SelectInput
                value={form.unit}
                onChange={(v) => set("unit", v)}
                options={unitOptions}
              />
            </div>
          </div>

          {/* Fréquence */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Fréquence *
            </label>
            <div className="flex gap-2">
              {(["daily", "weekly", "custom"] as Frequency[]).map((f) => {
                const cfg = freqConfig[f];
                const Icon = cfg.icon;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => set("frequency", f)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-black transition-all border ${
                      form.frequency === f
                        ? `${cfg.bg} ${cfg.color}`
                        : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Date début *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Date fin
              </label>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Notes
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
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
              !form.targetId ||
              !form.feedStockId ||
              form.quantity === "" ||
              !form.startDate
            }
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-yellow-400 text-white hover:bg-yellow-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Spinner />
                Patientez…
              </>
            ) : initial ? (
              "Modifier"
            ) : (
              "Créer le plan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const FeedingPlanDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const currentUser = useAppSelector(
    (state) => state.authentification.auth.user,
  );
  const farmId = currentFarm?.id;
  const feedStock = useAppSelector(selectFeedStock);

  const lotsRaw = useAppSelector((s) => s.lot.entities ?? s.lot ?? []);
  const herdsRaw = useAppSelector((s) => s.herd.entities ?? s.herd ?? []);
  const pensRaw = useAppSelector((s) => s.pen.entities ?? s.pen ?? []);

  const lots: FecthLot[] = Array.isArray(lotsRaw) ? lotsRaw : [];
  const herds: Herd[] = Array.isArray(herdsRaw) ? herdsRaw : [];
  const pens: Pen[] = Array.isArray(pensRaw) ? pensRaw : [];

  const feedingPlans = useAppSelector(selectFeedingPlans);
  const { loading } = useAppSelector(selectFeedingPlanState);
  const animalsRaw = useAppSelector(
    (state) => state.animal?.animalist?.entities,
  );
  const animals: any[] = Array.isArray(animalsRaw)
    ? animalsRaw
    : animalsRaw
      ? [animalsRaw]
      : [];

  // Stock d'aliments (FeedStock) filtré pour la ferme courante
  const feedstocked: FeedStock[] = Array.isArray(feedStock)
    ? feedStock
    : feedStock
      ? [feedStock]
      : [];

  const [isLoadingFarm, setIsLoadingFarm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [freqFilter, setFreqFilter] = useState<Frequency | "all">("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FeedingPlan | null>(null);
  const [detailItem, setDetailItem] = useState<FeedingPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeedingPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

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
            dispatch(fetchFeedingPlan(first.id));
            dispatch(fetchFeedStock(first.id));
            dispatch(getAllAnimals({ farmId: first.id, limit: 200, page: 1 }));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingFarm(false);
        }
      }
    };
    load();
  }, [currentUser?.id, currentFarm, dispatch]);

  useEffect(() => {
    if (!farmId) return;
    dispatch(fetchFeedStock(farmId));
    dispatch(getAllAnimals({ farmId, limit: 200, page: 1 }));
    dispatch(getAllLots({ farmId, limit: 100 }));
    dispatch(getAllHerds({ farmId }));
    dispatch(getAllPens({ farmId }));
  }, [dispatch, farmId]);

  useEffect(() => {
    if (!farmId) return;
    dispatch(fetchFeedingPlan(farmId));
  }, [dispatch, farmId]);

  const refresh = useCallback(() => {
    if (!farmId) return;
    dispatch(fetchFeedingPlan(farmId));
  }, [dispatch, farmId]);

  const handleDelete = async () => {
    if (!deleteTarget?.id) {
      setDeleteTarget(null);
      return;
    }
    setIsDeleting(true);
    try {
      await dispatch(deleteFeedingPlan({ id: deleteTarget.id })).unwrap();
      setDeleteTarget(null);
      toast.success("Plan supprimé");
    } catch {
      toast.error("La suppression a échoué");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDistribute = async (planId: number) => {
    setIsDistributing(true);
    try {
      await dispatch(distributeFeedingPlan(planId)).unwrap();
      toast.success("Distribution effectuée !");
    } catch (error: any) {
      // On loggue l'erreur brute pour voir la vraie cause renvoyée par
      // l'API (au lieu d'un message générique qui masque le problème).
      console.error("distributeFeedingPlan error:", error);
      const realMessage =
        error?.message ??
        error?.data?.message ??
        error?.response?.data?.message ??
        (typeof error === "string" ? error : null);
      toast.error(realMessage ?? "La distribution a échoué (voir la console)");
    } finally {
      setIsDistributing(false);
    }
  };

  // Helpers résolution noms
  const getAnimalName = (id?: number | null) =>
    id ? animals.find((a) => a.id === id)?.name : undefined;
  const getFeedStockName = (feedStock?: FeedStock) =>
    feedStock ? feedStock.name : undefined;
  const getLotName = (id?: number | null) =>
    id ? lots.find((l) => l.id === id)?.name : undefined;
  const getHerdName = (id?: number | null) =>
    id ? herds.find((h) => h.id === id)?.name : undefined;
  const getPenName = (id?: number | null) =>
    id ? pens.find((p) => p.id === id)?.name : undefined;

  const getTargetName = (p: FeedingPlan) =>
    p.animalId
      ? getAnimalName(p.animalId)
      : p.lotId
        ? getLotName(p.lotId)
        : p.herdId
          ? getHerdName(p.herdId)
          : p.penId
            ? getPenName(p.penId)
            : undefined;

  const list: FeedingPlan[] = Array.isArray(feedingPlans) ? feedingPlans : [];
  const activeCount = list.filter(isActive).length;

  const filtered = list
    .filter((p) => freqFilter === "all" || p.frequency === freqFilter)
    .filter((p) => !activeOnly || isActive(p))
    .filter((p) => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        getTargetName(p)?.toLowerCase().includes(s) ||
        getFeedStockName(p.feedStock)?.toLowerCase().includes(s)
      );
    });

  if (isLoadingFarm)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-semibold">
          Chargement de votre ferme...
        </p>
      </div>
    );

  if (!farmId)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="p-6 bg-yellow-50 rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
        </div>
        <h3 className="text-xl font-black text-gray-800">
          Aucune ferme trouvée
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          Veuillez créer une ferme pour continuer.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 p-4 pt-20">
      {/* En-tête */}
      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-50 rounded-xl">
            <ClipboardList className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              Plans des rations
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              {currentFarm?.name && `${currentFarm.name} • `}Programmes
              d'alimentation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl font-black shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau plan
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total plans",
              value: list.length,
              color: "text-gray-700",
              bg: "bg-gray-100",
            },
            {
              label: "Actifs",
              value: activeCount,
              color: "text-green-700",
              bg: "bg-green-50",
            },
            {
              label: "Quotidiens",
              value: list.filter((p) => p.frequency === "daily").length,
              color: "text-yellow-700",
              bg: "bg-yellow-50",
            },
            {
              label: "Hebdomadaires",
              value: list.filter((p) => p.frequency === "weekly").length,
              color: "text-green-700",
              bg: "bg-emerald-50",
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

      {/* Filtres */}
      <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Rechercher animal, lot, aliment…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setFreqFilter("all");
              setActiveOnly(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${freqFilter === "all" && !activeOnly ? "bg-yellow-400 text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
          >
            Tous
          </button>
          {(["daily", "weekly", "custom"] as Frequency[]).map((f) => {
            const cfg = freqConfig[f];
            return (
              <button
                key={f}
                onClick={() => {
                  setFreqFilter(f);
                  setActiveOnly(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${freqFilter === f && !activeOnly ? `${cfg.bg} ${cfg.color}` : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
              >
                {cfg.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              setActiveOnly((v) => !v);
              setFreqFilter("all");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${activeOnly ? "bg-green-500 text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
          >
            Actifs seulement
          </button>
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Chargement des plans…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <ClipboardList className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm font-black text-gray-500">Aucun plan trouvé</p>
          <p className="text-xs text-gray-400">
            {searchTerm || freqFilter !== "all" || activeOnly
              ? "Essayez de modifier vos filtres"
              : "Commencez par créer un plan de ration"}
          </p>
          {!searchTerm && freqFilter === "all" && !activeOnly && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-1 flex items-center gap-2 px-4 py-2.5 bg-yellow-400 text-white text-sm rounded-xl font-black"
            >
              <Plus className="w-4 h-4" />
              Créer un plan
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Cible",
                    "Aliment (stock)",
                    "Quantité",
                    "Fréquence",
                    "Période",
                    "Statut",
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
                {filtered.map((p) => {
                  const freq = getFreq(p.frequency);
                  const FreqIcon = freq.icon;
                  const active = isActive(p);
                  const distributed = isAlreadyDistributed(p);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-all cursor-pointer"
                      onClick={() => setDetailItem(p)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-sm font-semibold text-gray-700">
                            {getTargetName(p) ?? `#${p.id}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-sm text-gray-600">
                            {getFeedStockName(p.feedStock) ??
                              `#${p.feedStock?.name}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-black text-yellow-600">
                          {p.quantity}{" "}
                          <span className="text-xs font-semibold text-gray-400">
                            {p.unit}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-black px-2 py-1 rounded-lg ${freq.bg} ${freq.color}`}
                        >
                          <FreqIcon className="w-3 h-3" />
                          {freq.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {fmtDate(p.startDate)}
                        {p.endDate && ` → ${fmtDate(p.endDate)}`}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg ${active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
                        >
                          {active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(p);
                              setShowForm(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDistribute(p.id)}
                            disabled={isDistributing || distributed}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                              distributed
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                            }`}
                          >
                            {isDistributing ? (
                              <Spinner />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            {distributed ? "Fait" : "Distribuer"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-2">
            {filtered.map((p) => {
              const freq = getFreq(p.frequency);
              const FreqIcon = freq.icon;
              const active = isActive(p);
              const distributed = isAlreadyDistributed(p);
              return (
                <div
                  key={p.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm cursor-pointer"
                  onClick={() => setDetailItem(p)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-lg ${freq.bg} ${freq.color}`}
                        >
                          <FreqIcon className="w-3 h-3" />
                          {freq.label}
                        </span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg ${active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
                        >
                          {active ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <p className="text-sm font-black text-gray-800">
                        {getTargetName(p) ?? `Plan #${p.id}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getFeedStockName(p.feedStock) ??
                          `Article #${p.feedStock?.name}`}{" "}
                        ·{" "}
                        <span className="font-semibold text-yellow-600">
                          {p.quantity} {p.unit}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmtDate(p.startDate)}
                        {p.endDate && ` → ${fmtDate(p.endDate)}`}
                      </p>
                    </div>
                    <div
                      className="flex flex-col items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingItem(p);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDistribute(p.id)}
                        disabled={isDistributing || distributed}
                        className={`p-2 rounded-xl transition-all ${distributed ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-white bg-green-500 hover:bg-green-600"}`}
                      >
                        {isDistributing ? (
                          <Spinner />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modals */}
      {showForm && farmId && currentUser?.id && (
        <FormModal
          farmId={farmId}
          userId={currentUser.id}
          animals={animals}
          lots={lots}
          herds={herds}
          pens={pens}
          feedStock={feedstocked}
          initial={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingItem(null);
            refresh();
          }}
        />
      )}
      {detailItem && (
        <DetailModal
          plan={detailItem}
          targetName={getTargetName(detailItem)}
          inventoryName={getFeedStockName(detailItem.feedStock)}
          onClose={() => setDetailItem(null)}
          onEdit={() => {
            setEditingItem(detailItem);
            setDetailItem(null);
            setShowForm(true);
          }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default FeedingPlanDashboard;