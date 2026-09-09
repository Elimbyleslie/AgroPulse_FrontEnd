/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  AlertTriangle,
  RefreshCw,
  Tag,
  TrendingDown,
  BarChart3,
  Calendar,
  MapPin,
  Hash,
  ShieldAlert,
  Clock,
  Link2,
} from "lucide-react";

import {
  fetchFeedStock,
  deleteFeedStock,
} from "../../../store/alimentations/feedstockAct";
import {
  selectFeedStock,
  selectFeedStockState,
} from "../../../store/alimentations/sliceStock";
import { selectCurrentFarm, setCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import { selectFeedingPlans } from "../../../store/alimentations/slice";
import type { FeedStock } from "../../../models/alimentation";
import { FeedCategory, StockStatus } from "../../../models/alimentation";
import { toast } from "react-toastify";
import FormModal from "../../../components/Modal/FeedStockModal";

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

// Statut dérivé dynamiquement — jamais lu depuis s.status (même logique que
// InventoryDashboard : le champ status en base peut être stale après un
// réapprovisionnement si le backend ne le recalcule pas).
const deriveStatus = (s: FeedStock): StockStatus => {
  // Prisma renvoie les champs Decimal (quantity, minQuantity) sous forme de
  // string dans le JSON. Comparer deux strings avec <= fait une comparaison
  // LEXICOGRAPHIQUE en JS ("490" <= "50" est vrai !), pas numérique.
  // On force donc explicitement la conversion en Number avant de comparer.
  const qty = Number(s.quantity);
  const minQty = s.minQuantity != null ? Number(s.minQuantity) : null;

  if (s.expiryDate != null && new Date(s.expiryDate) < new Date()) {
    return StockStatus.EXPIRED;
  }
  if (qty <= 0) {
    return StockStatus.OUT_OF_STOCK;
  }
  if (minQty != null && minQty > 0 && qty <= minQty) {
    return StockStatus.LOW_STOCK;
  }
  return StockStatus.IN_STOCK;
};

const isLowStock = (s: FeedStock) => {
  const st = deriveStatus(s);
  return st === StockStatus.LOW_STOCK || st === StockStatus.OUT_OF_STOCK;
};

const isExpired = (s: FeedStock) => deriveStatus(s) === StockStatus.EXPIRED;

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

const getCatMeta = (c?: FeedCategory) =>
  c && CATEGORY_META[c] ? CATEGORY_META[c] : CATEGORY_META[FeedCategory.OTHER];

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

const fmtDate = (d?: Date | string | null) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtCurrency = (v?: number | string | null) =>
  v != null ? `${Number(v).toLocaleString("fr-FR")} FCFA` : "—";

// ── Badge Statut ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ item: FeedStock }> = ({ item }) => {
  const status = deriveStatus(item);
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-black px-2 py-0.5 rounded-lg ${meta.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

// ── FeedingPlan Blocker Modal ─────────────────────────────────────────────────
// Réutilise selectFeedingPlans (le même sélecteur que InventoryDashboard),
// filtré par stockId, plutôt que de compter sur une relation `feedingPlans`
// embarquée dans FeedStock qui dépend d'un `include` Prisma côté backend.
const FeedingPlanBlockerModal: React.FC<{
  itemName: string;
  linkedPlanNames: string[];
  onClose: () => void;
}> = ({ itemName, linkedPlanNames, onClose }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-amber-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 bg-amber-50 rounded-xl shrink-0">
          <Link2 className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-base font-black text-gray-800">
            Suppression impossible
          </h3>
          <p className="text-xs text-gray-400">« {itemName} »</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Cet aliment est encore utilisé dans{" "}
        <strong>
          {linkedPlanNames.length} plan{linkedPlanNames.length > 1 ? "s" : ""}{" "}
          de ration
        </strong>{" "}
        actif{linkedPlanNames.length > 1 ? "s" : ""} :
      </p>
      <ul className="mb-5 flex flex-col gap-1.5">
        {linkedPlanNames.map((name, i) => (
          <li
            key={i}
            className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            {name}
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-400 mb-5 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
        Retirez cet aliment de tous les plans de ration avant de le supprimer.
      </p>
      <button
        onClick={onClose}
        className="w-full py-2.5 rounded-xl text-sm font-black bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200"
      >
        Compris
      </button>
    </div>
  </div>
);

// ── Delete Confirm ────────────────────────────────────────────────────────────
const DeleteModal: React.FC<{
  item: FeedStock;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ item, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-red-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 bg-red-50 rounded-xl">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-black text-gray-800">
            Supprimer cet aliment ?
          </h3>
          <p className="text-xs text-gray-400">« {item.name} »</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl px-3 py-2 border border-red-100">
        ⚠️ Cette action est <strong>irréversible</strong>. Toutes les données
        associées seront perdues.
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
  item: FeedStock;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ item, onClose, onEdit, onDelete }) => {
  const catMeta = getCatMeta(item.category);
  const status = deriveStatus(item);
  const expired = status === StockStatus.EXPIRED;
  const low =
    status === StockStatus.LOW_STOCK || status === StockStatus.OUT_OF_STOCK;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{catMeta.emoji}</span>
            <span className="font-black text-gray-800">{item.name}</span>
            <StatusBadge item={item} />
            {expired && (
              <span className="flex items-center gap-1 text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                <ShieldAlert className="w-3 h-3" />
                Périmé
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3">
          <div
            className={`rounded-xl p-4 ${low ? "bg-red-50 border border-red-100" : "bg-emerald-50 border border-emerald-100"}`}
          >
            <p
              className={`text-xs font-black uppercase mb-1 ${low ? "text-red-400" : "text-emerald-600"}`}
            >
              Quantité en stock
            </p>
            <p
              className={`text-3xl font-black ${low ? "text-red-600" : "text-emerald-700"}`}
            >
              {item.quantity}{" "}
              <span className="text-base font-semibold text-gray-400">
                {item.unit}
              </span>
            </p>
            {item.minQuantity != null && item.minQuantity > 0 && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Seuil d'alerte : {item.minQuantity} {item.unit}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-black text-gray-400 uppercase mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Catégorie
              </p>
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-lg ${catMeta.cls}`}
              >
                {catMeta.emoji} {catMeta.label}
              </span>
            </div>

            {item.totalValue != null && (
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs font-black text-indigo-400 uppercase mb-1 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Valeur totale
                </p>
                <p className="text-sm font-black text-indigo-700">
                  {fmtCurrency(item.totalValue)}
                </p>
              </div>
            )}

            <div
              className={`rounded-xl p-3 ${expired ? "bg-rose-50" : "bg-gray-50"}`}
            >
              <p
                className={`text-xs font-black uppercase mb-1 flex items-center gap-1 ${expired ? "text-rose-400" : "text-gray-400"}`}
              >
                <Calendar className="w-3 h-3" />
                Péremption
              </p>
              <p
                className={`text-sm font-semibold ${expired ? "text-rose-600" : "text-gray-700"}`}
              >
                {fmtDate(item.expiryDate)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {item.location && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-black text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Emplacement
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {item.location}
                </p>
              </div>
            )}
            {item.sku && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-black text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  SKU
                </p>
                <p className="text-sm font-mono font-semibold text-gray-700">
                  {item.sku}
                </p>
              </div>
            )}
            {item.supplier?.name && (
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-xs font-black text-gray-400 uppercase mb-1">
                  Fournisseur
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {item.supplier.name}
                </p>
              </div>
            )}
          </div>

          {item.notes && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-black text-gray-400 uppercase mb-1">
                Notes
              </p>
              <p className="text-sm text-gray-600">{item.notes}</p>
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

// ── Form Modal ────────────────────────────────────────────────────────────────

// ── Main ──────────────────────────────────────────────────────────────────────
const FeedStockDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const feedStockRaw = useAppSelector(selectFeedStock);
  const { fetchLoading: loading } = useAppSelector(selectFeedStockState);
  const feedingPlans = useAppSelector(selectFeedingPlans);
  const currentFarm = useAppSelector(selectCurrentFarm);
  const currentUser = useAppSelector(
    (state) => state.authentification.auth.user,
  );
  const farmId = currentFarm?.id;

  const [isLoadingFarm, setIsLoadingFarm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FeedCategory | "all">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<StockStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FeedStock | null>(null);
  const [detailItem, setDetailItem] = useState<FeedStock | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeedStock | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blockerItem, setBlockerItem] = useState<FeedStock | null>(null);
  const [blockerPlanNames, setBlockerPlanNames] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!currentFarm && currentUser?.id) {
        setIsLoadingFarm(true);
        try {
          const result = await dispatch(getUserFarms()).unwrap();
          const farms = (result as any)?.data || result;
          if (Array.isArray(farms) && farms.length > 0) {
            const first = farms[0];
            dispatch(setCurrentFarm(first));
            dispatch(fetchFeedStock(first.id));
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
    if (farmId !== undefined) dispatch(fetchFeedStock(farmId as any));
  }, [dispatch, farmId]);

  const refresh = useCallback(() => {
    if (farmId) dispatch(fetchFeedStock(farmId as any));
  }, [dispatch, farmId]);

  const requestDelete = (item: FeedStock) => {
    const linked = feedingPlans.filter(
      (plan: any) => plan.stockId === item.id || plan.feedStockId === item.id,
    );
    if (linked.length > 0) {
      setBlockerItem(item);
      setBlockerPlanNames(
        linked.map((p: any) => p.name ?? p.title ?? `Plan #${p.id}`),
      );
    } else {
      setDeleteTarget(item);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteFeedStock({ id: deleteTarget.id })).unwrap();
      setDeleteTarget(null);
      toast.success("Aliment supprimé");
    } catch {
      toast.error("La suppression a échoué");
    } finally {
      setIsDeleting(false);
    }
  };

  const list: FeedStock[] = Array.isArray(feedStockRaw)
    ? feedStockRaw
    : feedStockRaw
      ? [feedStockRaw]
      : [];

  const totalValue = list.reduce(
    (acc, s) => acc + Number(s.totalValue ?? 0),
    0,
  );
  const lowCount = list.filter(isLowStock).length;
  const expiredCount = list.filter(isExpired).length;

  const categories = Array.from(
    new Set(list.map((s) => s.category).filter(Boolean)),
  ) as FeedCategory[];

  const filtered = list
    .filter((s) => categoryFilter === "all" || s.category === categoryFilter)
    .filter((s) => statusFilter === "all" || deriveStatus(s) === statusFilter)
    .filter(
      (s) =>
        !searchTerm ||
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  if (isLoadingFarm)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-semibold">
          Chargement de votre ferme...
        </p>
      </div>
    );

  if (!farmId)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="p-6 bg-green-50 rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-vert" />
        </div>
        <h3 className="text-xl font-black text-gray-800">
          Aucune ferme trouvée
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          Veuillez créer une ferme pour continuer.
        </p>
      </div>
    );

  const tableHeaders = [
    "Aliment",
    "Catégorie",
    "Quantité",
    "Seuil",
    "Péremption",
    "Statut",
    "Actions",
  ];

  return (
    <div className="flex flex-col gap-4 p-4 pt-20">
      {/* En-tête */}
      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <Package className="w-5 h-5 text-vert" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              Stock d'aliments
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              {currentFarm?.name && `${currentFarm.name} • `}Gestion des stocks
              d'aliments
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
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-white bg-vert hover:bg-green-700 rounded-xl font-black shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouvel aliment
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total aliments",
              value: list.length,
              color: "text-gray-700",
              bg: "bg-gray-50",
              icon: Package,
            },
            {
              label: "Valeur totale",
              value: fmtCurrency(totalValue),
              color: "text-indigo-700",
              bg: "bg-indigo-50",
              icon: BarChart3,
            },
            {
              label: "Stock bas / 0",
              value: lowCount,
              color: "text-amber-600",
              bg: "bg-amber-50",
              icon: TrendingDown,
            },
            {
              label: "Périmés",
              value: expiredCount,
              color: "text-rose-600",
              bg: "bg-rose-50",
              icon: Clock,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}
              >
                <Icon className={`w-8 h-8 opacity-30 ${s.color}`} />
                <div>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alertes */}
      {lowCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm font-semibold text-amber-700">
            <span className="font-black">
              {lowCount} aliment{lowCount > 1 ? "s" : ""}
            </span>{" "}
            en stock bas ou en rupture
          </p>
          <button
            onClick={() => {
              setStatusFilter(StockStatus.LOW_STOCK);
              setCategoryFilter("all");
            }}
            className="ml-auto text-xs font-black text-amber-600 hover:underline shrink-0"
          >
            Voir tout
          </button>
        </div>
      )}
      {expiredCount > 0 && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="text-sm font-semibold text-rose-700">
            <span className="font-black">
              {expiredCount} aliment{expiredCount > 1 ? "s" : ""}
            </span>{" "}
            périmé{expiredCount > 1 ? "s" : ""}
          </p>
          <button
            onClick={() => {
              setStatusFilter(StockStatus.EXPIRED);
              setCategoryFilter("all");
            }}
            className="ml-auto text-xs font-black text-rose-600 hover:underline shrink-0"
          >
            Voir tout
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Rechercher par nom, SKU, emplacement…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all"
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
              setCategoryFilter("all");
              setStatusFilter("all");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${categoryFilter === "all" && statusFilter === "all" ? "bg-vert text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
          >
            Tous
          </button>
          {categories.map((cat) => {
            const meta = getCatMeta(cat);
            return (
              <button
                key={cat}
                onClick={() => {
                  setCategoryFilter(cat);
                  setStatusFilter("all");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${categoryFilter === cat ? meta.cls : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
              >
                {meta.emoji} {meta.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 flex-wrap">
          {Object.entries(STATUS_META).map(([status, meta]) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status as StockStatus);
                setCategoryFilter("all");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1 ${statusFilter === status ? meta.cls : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Chargement du stock d'aliments…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm font-black text-gray-500">
            Aucun aliment trouvé
          </p>
          <p className="text-xs text-gray-400">
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
              ? "Essayez de modifier vos filtres"
              : "Commencez par ajouter un aliment"}
          </p>
          {!searchTerm &&
            categoryFilter === "all" &&
            statusFilter === "all" && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-1 flex items-center gap-2 px-4 py-2.5 bg-vert text-white text-sm rounded-xl font-black"
              >
                <Plus className="w-4 h-4" />
                Ajouter un aliment
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
                  {tableHeaders.map((h) => (
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
                {filtered.map((s) => {
                  const catMeta = getCatMeta(s.category);
                  const status = deriveStatus(s);
                  const expired = status === StockStatus.EXPIRED;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-all cursor-pointer"
                      onClick={() => setDetailItem(s)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-sm text-gray-700">
                            {s.name}
                          </p>
                          {s.sku && (
                            <p className="text-xs text-gray-400 font-mono">
                              {s.sku}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg ${catMeta.cls}`}
                        >
                          {catMeta.emoji} {catMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-black ${isLowStock(s) ? "text-red-600" : "text-green-700"}`}
                        >
                          {s.quantity}{" "}
                          <span className="font-semibold text-gray-400 text-xs">
                            {s.unit}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {s.minQuantity != null && s.minQuantity > 0
                          ? `${s.minQuantity} ${s.unit}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold ${expired ? "text-rose-600" : "text-gray-500"}`}
                        >
                          {fmtDate(s.expiryDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge item={s} />
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(s);
                              setShowForm(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-vert hover:bg-emerald-50 transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => requestDelete(s)}
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

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-2">
            {filtered.map((s) => {
              const catMeta = getCatMeta(s.category);
              return (
                <div
                  key={s.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm cursor-pointer"
                  onClick={() => setDetailItem(s)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg ${catMeta.cls}`}
                        >
                          {catMeta.emoji} {catMeta.label}
                        </span>
                        <StatusBadge item={s} />
                      </div>
                      <p className="text-sm font-black text-gray-800">
                        {s.name}
                      </p>
                      {s.sku && (
                        <p className="text-xs text-gray-400 font-mono">
                          {s.sku}
                        </p>
                      )}
                      <p
                        className={`text-sm font-semibold mt-0.5 ${isLowStock(s) ? "text-red-500" : "text-green-700"}`}
                      >
                        {s.quantity} {s.unit}
                        {s.minQuantity != null && s.minQuantity > 0 && (
                          <span className="text-xs text-gray-400 ml-1">
                            / min {s.minQuantity}
                          </span>
                        )}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingItem(s);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:text-vert hover:bg-emerald-50 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => requestDelete(s)}
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

      {/* Modals */}
      {showForm && farmId && (
        <FormModal
          farmId={farmId}
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
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={() => {
            setEditingItem(detailItem);
            setDetailItem(null);
            setShowForm(true);
          }}
          onDelete={() => {
            requestDelete(detailItem);
            setDetailItem(null);
          }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
      {blockerItem && (
        <FeedingPlanBlockerModal
          itemName={blockerItem.name}
          linkedPlanNames={blockerPlanNames}
          onClose={() => {
            setBlockerItem(null);
            setBlockerPlanNames([]);
          }}
        />
      )}
    </div>
  );
};

export default FeedStockDashboard;
