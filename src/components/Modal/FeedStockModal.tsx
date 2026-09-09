/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { X, Package, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../hooks/store";
import SelectInput from "../UI/SelectInput";
import {
  FeedStock,
  FeedCategory,
  StockStatus,
} from "../../models/alimentation";
import {
  createFeedStock,
  updateFeedStock,
} from "../../store/alimentations/feedstockAct";




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



// ── Catégorie : labels et styles (FeedCategory, distinct de InventoryCategory) ─
const CATEGORY_META: Record<
  FeedCategory,
  { label: string; cls: string; emoji: string }
> = {
  [FeedCategory.CONCENTRATE]: {
    label: "Concentré",
    cls: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    emoji: "🌽",
  },
  [FeedCategory.FORAGE]: {
    label: "Fourrage",
    cls: "bg-green-50 text-green-700 border border-green-200",
    emoji: "🌾",
  },
  [FeedCategory.SUPPLEMENT]: {
    label: "Supplément",
    cls: "bg-purple-50 text-purple-700 border border-purple-200",
    emoji: "🧪",
  },
  [FeedCategory.MINERAL]: {
    label: "Minéral",
    cls: "bg-sky-50 text-sky-700 border border-sky-200",
    emoji: "🧂",
  },
  [FeedCategory.SILAGE]: {
    label: "Ensilage",
    cls: "bg-lime-50 text-lime-700 border border-lime-200",
    emoji: "🌿",
  },
  [FeedCategory.OTHER]: {
    label: "Autre",
    cls: "bg-gray-50 text-gray-600 border border-gray-200",
    emoji: "📋",
  },
};

// ── Status : labels et styles ─────────────────────────────────────────────────
const STATUS_META: Record<
  StockStatus,
  { label: string; cls: string; dot: string }
> = {
  [StockStatus.IN_STOCK]: {
    label: "En stock",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  [StockStatus.LOW_STOCK]: {
    label: "Stock bas",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  [StockStatus.OUT_OF_STOCK]: {
    label: "Rupture",
    cls: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  [StockStatus.EXPIRED]: {
    label: "Périmé",
    cls: "bg-gray-50 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
  },
};

const fmtCurrency = (v?: number | string | null) =>
  v != null ? `${Number(v).toLocaleString("fr-FR")} FCFA` : "—";

const UNIT_OPTIONS = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "L", label: "L" },
  { value: "mL", label: "mL" },
  { value: "sac", label: "sac" },
  { value: "botte", label: "botte" },
  { value: "tonne", label: "tonne" },
  { value: "balle", label: "balle" },
  { value: "bidon", label: "bidon" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "— choisir —" },
  ...Object.entries(CATEGORY_META).map(([value, { label, emoji }]) => ({
    value,
    label: `${emoji} ${label}`,
  })),
];

const STATUS_OPTIONS = Object.entries(STATUS_META).map(
  ([value, { label }]) => ({ value, label }),
);

const FormModal: React.FC<{
  farmId: number;
  initial?: FeedStock | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    quantity: (initial?.quantity ?? "") as any,
    unit: initial?.unit ?? "kg",
    category: initial?.category ?? FeedCategory.FORAGE,
    status: initial?.status ?? StockStatus.IN_STOCK,
    minQuantity: (initial?.minQuantity ?? "") as any,
    expiryDate: initial?.expiryDate
      ? new Date(initial.expiryDate).toISOString().slice(0, 10)
      : "",
    location: initial?.location ?? "",
    sku: initial?.sku ?? "",
    notes: (initial as any)?.notes ?? "",
    // ── Prix / paiement ──
    unitPrice: (initial?.unitPrice ?? "") as any,
    paymentReference: "",
    paymentNotes: "",
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const inp =
    "w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all";

  const quantityNum = Number(form.quantity);
  const minQtyNum = Number(form.minQuantity);
  const showLowWarn =
    form.quantity !== "" &&
    form.minQuantity !== "" &&
    minQtyNum > 0 &&
    quantityNum <= minQtyNum &&
    quantityNum > 0;
  const showOutWarn = form.quantity !== "" && quantityNum === 0;

  // Prix — calcul en direct, jamais éditable manuellement pour éviter une
  // incohérence entre quantité × prix unitaire et la valeur totale affichée.
  const hasPrice = form.unitPrice !== "" && Number(form.unitPrice) > 0;
  const computedTotal =
    hasPrice && form.quantity !== ""
      ? Number(form.unitPrice) * quantityNum
      : null;

  const handleSubmit = async () => {
    if (!form.name || form.quantity === "") return;
 
    setSaving(true);
    try {
      const payload: any = {
        farmId,
        name: form.name,
        quantity: Number(form.quantity),
        unit: form.unit,
        category: form.category as FeedCategory,
        status: form.status as StockStatus,
        minQuantity:
          form.minQuantity !== "" ? Number(form.minQuantity) : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined,
        location: form.location || undefined,
        sku: form.sku || undefined,
        notes: form.notes || undefined,
        // ── Prix / paiement — le backend crée ou met à jour le Payment lié ──
        unitPrice: hasPrice ? Number(form.unitPrice) : undefined,
        totalValue: computedTotal ?? undefined,
        paymentReference: form.paymentReference || undefined,
        paymentNotes: form.paymentNotes || undefined,
      };
      if (initial) {
        await dispatch(
          updateFeedStock({ id: initial.id, data: payload }),
        ).unwrap();
        toast.success("Aliment modifié avec succès");
      } else {
        await dispatch(createFeedStock(payload)).unwrap();
        toast.success("Aliment créé avec succès");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(
        initial ? "La modification a échoué" : "La création a échoué",
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Package className="w-4 h-4 text-vert" />
            </div>
            <span className="font-black text-gray-800 text-sm">
              {initial ? "Modifier l'aliment" : "Nouvel aliment"}
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
              Nom de l'aliment *
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="ex: Foin de luzerne, Tourteau de soja…"
              className={inp}
            />
          </div>

          <SelectInput
            value={form.category}
            onChange={(v: any) => set("category", v)}
            options={CATEGORY_OPTIONS.filter((o) => o.value !== "")}
            placeholder="— choisir —"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Quantité *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className={inp}
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Unité *
              </label>
              <SelectInput
                value={form.unit}
                onChange={(v: any) => set("unit", v)}
                options={UNIT_OPTIONS}
              />
            </div>
          </div>

          {showOutWarn && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ Quantité à 0 — le statut sera automatiquement{" "}
              <strong>Rupture de stock</strong>.
            </p>
          )}
          {showLowWarn && !showOutWarn && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠️ La quantité est inférieure ou égale au seuil d'alerte (
              {form.minQuantity} {form.unit}).
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Seuil d'alerte
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minQuantity}
                onChange={(e) => set("minQuantity", e.target.value)}
                placeholder="ex: 50"
                className={inp}
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Statut
              </label>
              <SelectInput
                value={form.status}
                onChange={(v: any) => set("status", v)}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Date de péremption
            </label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => set("expiryDate", e.target.value)}
              className={inp}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                Emplacement
              </label>
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="ex: Silo A, Hangar 2"
                className={inp}
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                SKU / Référence
              </label>
              <input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="ex: FEED-001"
                className={`${inp} font-mono`}
              />
            </div>
          </div>

          {/* ── Bloc Prix & Paiement ── */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 flex flex-col gap-3">
            <p className="text-xs font-black text-indigo-500 uppercase tracking-wide flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Prix & Paiement (optionnel)
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                  Prix unitaire
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => set("unitPrice", e.target.value)}
                  placeholder="ex: 250"
                  className={inp}
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                  Valeur totale
                </label>
                <div
                  className={`${inp} bg-white flex items-center font-black text-indigo-700`}
                >
                  {computedTotal != null ? fmtCurrency(computedTotal) : "—"}
                </div>
              </div>
            </div>

            {hasPrice && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
                      Référence
                    </label>
                    <input
                      value={form.paymentReference}
                      onChange={(e) => set("paymentReference", e.target.value)}
                      placeholder="ex: N° transaction"
                      className={inp}
                    />
                  </div>
               
                </div>
                <p className="text-[11px] text-indigo-500">
                  {initial
                    ? "Le paiement lié à cet aliment sera mis à jour avec ce montant."
                    : "Un paiement sera automatiquement créé avec ce montant."}
                </p>
              </>
            )}
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-1 block">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Remarques éventuelles…"
              className={inp}
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
              !form.name ||
              form.quantity === "" 
            }
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-vert text-white hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Spinner />
                Enregistrement…
              </>
            ) : initial ? (
              "Modifier"
            ) : (
              "Créer l'aliment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
