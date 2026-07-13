/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search,
  RefreshCw,
  ChevronRight,
  Filter,
  Download,
  Receipt,
  TrendingDown,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  X,
  Wallet,
  Tag,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../../../store/gestionFinanciere/action";

import { selectExpenseList } from "../../../store/gestionFinanciere/slice";

import { selectCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import {
  Expense,
  ExpenseCategory,
  PaymentMethod,
} from "../../../models/gestionFinanciere";
import { LoadingType } from "../../../models/store";

// ── Helpers ───────────────────────────────────────────────────────────────────
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

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtDateInput = (d?: string) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

const fmtCurrency = (n?: number | null) =>
  n != null
    ? new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n) +
      " FCFA"
    : "—";

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.FEED]: "Alimentation",
  [ExpenseCategory.LABOR]: "Main d'œuvre",
  [ExpenseCategory.VETERINARY]: "Vétérinaire",
  [ExpenseCategory.EQUIPMENT]: "Équipement",
  [ExpenseCategory.MAINTENANCE]: "Maintenance",
  [ExpenseCategory.FUEL]: "Carburant",
  [ExpenseCategory.FERTILIZER]: "Engrais",
  [ExpenseCategory.SEEDS]: "Semences",
  [ExpenseCategory.WATER]: "Eau",
  [ExpenseCategory.TRANSPORT]: "Transport",
  [ExpenseCategory.INSURANCE]: "Assurance",
  [ExpenseCategory.TAXES]: "Taxes",
  [ExpenseCategory.SUPPLIES]: "Fournitures",
  [ExpenseCategory.UTILITIES]: "Services",
  [ExpenseCategory.MARKETING]: "Marketing",
  [ExpenseCategory.MISC]: "Divers",
  [ExpenseCategory.OTHER]: "Autre",
};

const CATEGORY_COLORS: Record<string, string> = {
  FEED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LABOR: "bg-blue-50 text-blue-700 border-blue-200",
  VETERINARY: "bg-red-50 text-red-700 border-red-200",
  EQUIPMENT: "bg-purple-50 text-purple-700 border-purple-200",
  FUEL: "bg-orange-50 text-orange-700 border-orange-200",
  TRANSPORT: "bg-cyan-50 text-cyan-700 border-cyan-200",
  MAINTENANCE: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.card]: "Carte",
  [PaymentMethod.mobile_money]: "Mobile Money",
  [PaymentMethod.orange_money]: "Orange Money",
  [PaymentMethod.paypal]: "PayPal",
  [PaymentMethod.cash]: "Espèces",
  [PaymentMethod.others]: "Autre",
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  bg: string;
  trend?: { value: string; up: boolean };
}> = ({ label, value, sub, icon, bg, trend }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-lg font-black text-gray-900 leading-tight truncate">
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {trend && (
        <p
          className={`text-xs font-semibold mt-1 ${trend.up ? "text-rouge" : "text-emerald-600"}`}
        >
          {trend.up ? "▲" : "▼"} {trend.value}
        </p>
      )}
    </div>
  </div>
);

// ── Category Distribution Bar ─────────────────────────────────────────────────
const CategoryBar: React.FC<{ expenses: Expense[] }> = ({ expenses }) => {
  const cats = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.totalAmount;
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cat, amt]) => ({
        cat,
        amt,
        pct: total > 0 ? (amt / total) * 100 : 0,
      }));
  }, [expenses]);

  const barColors = [
    "bg-rouge",
    "bg-bleu",
    "bg-jaune",
    "bg-vert",
    "bg-purple-500",
    "bg-gray-400",
  ];
  if (cats.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        Répartition des dépenses
      </p>
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-3">
        {cats.map((c, i) => (
          <div
            key={c.cat}
            className={`${barColors[i]} rounded-sm transition-all`}
            style={{ width: `${c.pct}%` }}
            title={`${CATEGORY_LABELS[c.cat as ExpenseCategory] ?? c.cat}: ${fmtCurrency(c.amt)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {cats.map((c, i) => (
          <div key={c.cat} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${barColors[i]}`} />
            <span className="text-xs text-gray-600 font-medium">
              {CATEGORY_LABELS[c.cat as ExpenseCategory] ?? c.cat}
            </span>
            <span className="text-xs text-gray-400">{c.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Delete Modal ───────────────────────────────────────────────────────────────
const DeleteModal: React.FC<{
  expense: Expense;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ expense, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-rouge" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Supprimer cette dépense ?
          </h3>
          <p className="text-sm text-gray-500">
            {CATEGORY_LABELS[expense.category]} ·{" "}
            {fmtCurrency(expense.totalAmount)}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
        Cette action est <strong>irréversible</strong>. La dépense sera
        définitivement supprimée.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rouge text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
);

// ── Expense Form Modal ─────────────────────────────────────────────────────────
const ExpenseFormModal: React.FC<{
  farmId: number;
  initial?: Expense | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    category: initial?.category || ExpenseCategory.MISC,
    amount: initial?.amount ? String(initial.amount) : "",
    taxAmount: initial?.taxAmount ? String(initial.taxAmount) : "",
    date: fmtDateInput(initial?.date),
    paymentMethod: initial?.paymentMethod || PaymentMethod.cash,
    invoiceNumber: initial?.invoiceNumber || "",
    notes: initial?.notes || "",
    isRecurring: initial?.isRecurring || false,
  });

  const set = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const totalAmount = useMemo(() => {
    const base = parseFloat(form.amount) || 0;
    const tax = parseFloat(form.taxAmount) || 0;
    return base + tax;
  }, [form.amount, form.taxAmount]);

  const handleSubmit = async () => {
    if (!form.category || !form.amount || !form.date) {
      toast.error("Les champs Catégorie, Montant et Date sont obligatoires");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Expense> = {
        farmId,
        category: form.category as ExpenseCategory,
        amount: parseFloat(form.amount),
        taxAmount: form.taxAmount ? parseFloat(form.taxAmount) : undefined,
        totalAmount,
        date: form.date,
        paymentMethod: form.paymentMethod as PaymentMethod,
        invoiceNumber: form.invoiceNumber || undefined,
        notes: form.notes || undefined,
        isRecurring: form.isRecurring,
      };

      console.log("🚀 Submitting expense payload:", payload);

      if (initial) {
        await dispatch(
          updateExpense({ id: initial.id, data: payload }),
        ).unwrap();
        toast.success("Dépense mise à jour avec succès");
      } else {
        await dispatch(createExpense(payload)).unwrap();
        toast.success("Dépense enregistrée avec succès");
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message || "Une erreur est survenue lors de l'enregistrement",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm transition";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-rouge" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {initial ? "Modifier la dépense" : "Nouvelle dépense"}
              </h2>
              <p className="text-xs text-gray-400">
                {initial ? `ID #${initial.id}` : "Enregistrez une dépense"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Catégorie */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Catégorie <span className="text-rouge">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass}
            >
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Montant + TVA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Montant HT <span className="text-rouge">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                  FCFA
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                TVA / Taxes
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={form.taxAmount}
                  onChange={(e) => set("taxAmount", e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                  FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Total calculé */}
          {parseFloat(form.amount) > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">
                Total TTC
              </span>
              <span className="text-base font-black text-rouge">
                {fmtCurrency(totalAmount)}
              </span>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Date <span className="text-rouge">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Méthode de paiement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PAYMENT_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set("paymentMethod", val)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    form.paymentMethod === val
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* N° Facture */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              N° Facture
            </label>
            <input
              type="text"
              value={form.invoiceNumber}
              onChange={(e) => set("invoiceNumber", e.target.value)}
              placeholder="ex: FAC-2024-001"
              className={inputClass}
            />
          </div>

          {/* Récurrent */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Dépense récurrente
              </p>
              <p className="text-xs text-gray-400">
                Marquer comme charge régulière
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("isRecurring", !form.isRecurring)}
              className={`w-10 h-6 rounded-full transition-colors relative ${form.isRecurring ? "bg-rouge" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isRecurring ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Notes
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Détails, fournisseur, remarques…"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.category || !form.amount || !form.date}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-rouge text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-red-600 transition shadow-sm shadow-red-200"
          >
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : initial ? (
              "Enregistrer les modifications"
            ) : (
              "Créer la dépense"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Sort Column Header ─────────────────────────────────────────────────────────
type SortKey = "date" | "category" | "totalAmount" | "paymentMethod";

const ColHeader: React.FC<{
  label: string;
  colKey: SortKey;
  current: SortKey;
  dir: "asc" | "desc";
  onSort: (k: SortKey) => void;
}> = ({ label, colKey, current, dir, onSort }) => (
  <button
    onClick={() => onSort(colKey)}
    className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition"
  >
    {label}
    {current === colKey ? (
      dir === "desc" ? (
        <ChevronDown className="w-3 h-3" />
      ) : (
        <ChevronUp className="w-3 h-3" />
      )
    ) : (
      <ChevronDown className="w-3 h-3 opacity-20" />
    )}
  </button>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 20;

const ExpensesDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const expenseState = useAppSelector(selectExpenseList);
  const farmId = currentFarm?.id;

  const expenses: Expense[] = (expenseState.entities as Expense[] | null) ?? [];
  const isLoading = expenseState.status === LoadingType.PENDING;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterRecurring, setFilterRecurring] = useState<"all" | "yes" | "no">(
    "all",
  );
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(() => {
    if (farmId) dispatch(getAllExpenses({ farmId, limit: 500, page: 1 }));
  }, [dispatch, farmId]);

  useEffect(() => {
    if (!farmId) dispatch(getUserFarms());
    else fetchData();
  }, [farmId, fetchData, dispatch]);

  const refresh = useCallback(() => {
    fetchData();
    toast.info("Données actualisées");
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteExpense(deleteTarget.id)).unwrap();
      toast.success("Dépense supprimée avec succès");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((e) =>
        [
          CATEGORY_LABELS[e.category],
          e.invoiceNumber,
          e.notes,
          PAYMENT_LABELS[e.paymentMethod],
        ].some((v) => v?.toLowerCase().includes(q)),
      );
    }
    if (filterCategory !== "all")
      list = list.filter((e) => e.category === filterCategory);
    if (filterPayment !== "all")
      list = list.filter((e) => e.paymentMethod === filterPayment);
    if (filterRecurring === "yes") list = list.filter((e) => e.isRecurring);
    if (filterRecurring === "no") list = list.filter((e) => !e.isRecurring);
    if (dateFrom)
      list = list.filter((e) => new Date(e.date) >= new Date(dateFrom));
    if (dateTo) list = list.filter((e) => new Date(e.date) <= new Date(dateTo));

    list.sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortKey === "date") {
        aVal = a.date;
        bVal = b.date;
      } else if (sortKey === "totalAmount") {
        aVal = a.totalAmount;
        bVal = b.totalAmount;
      } else {
        aVal = (a as any)[sortKey] ?? "";
        bVal = (b as any)[sortKey] ?? "";
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  return list;
}, [expenses, searchTerm, filterCategory, filterPayment, filterRecurring, dateFrom, dateTo, sortKey, sortDir]);
 

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.totalAmount, 0);
    const filteredTotal = filtered.reduce((s, e) => s + e.totalAmount, 0);
    const recurring = expenses
      .filter((e) => e.isRecurring)
      .reduce((s, e) => s + e.totalAmount, 0);
    const thisMonth = expenses
      .filter((e) => {
        const d = new Date(e.date);
        const now = new Date();
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, e) => s + e.totalAmount, 0);
    const topCat = Object.entries(
      expenses.reduce(
        (acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.totalAmount;
          return acc;
        },
        {} as Record<string, number>,
      ),
    ).sort((a, b) => b[1] - a[1])[0];
    return { total, filteredTotal, recurring, thisMonth, topCat };
  }, [expenses, filtered]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const activeFilters = [
    filterCategory !== "all",
    filterPayment !== "all",
    filterRecurring !== "all",
    !!dateFrom,
    !!dateTo,
    !!searchTerm,
  ].filter(Boolean).length;

  const exportCSV = () => {
    const rows = [
      [
        "Date",
        "Catégorie",
        "Montant HT",
        "TVA",
        "Total TTC",
        "Paiement",
        "N° Facture",
        "Récurrent",
        "Notes",
      ],
      ...filtered.map((e) => [
        e.date,
        CATEGORY_LABELS[e.category],
        e.amount,
        e.taxAmount ?? 0,
        e.totalAmount,
        PAYMENT_LABELS[e.paymentMethod],
        e.invoiceNumber ?? "",
        e.isRecurring ? "Oui" : "Non",
        e.notes ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "depenses.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium"
      />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Finance & Ventes</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">
                Dépenses & Achats
              </span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">
              Dépenses & Achats
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Suivi de toutes vos charges et dépenses
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-rouge text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition shadow-sm shadow-red-200"
            >
              <Plus className="w-4 h-4" /> Nouvelle dépense
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total dépenses"
            value={fmtCurrency(stats.total)}
            sub={`${expenses.length} enregistrements`}
            icon={<TrendingDown className="w-5 h-5 text-rouge" />}
            bg="bg-red-50"
          />
          <StatCard
            label="Ce mois-ci"
            value={fmtCurrency(stats.thisMonth)}
            sub="mois en cours"
            icon={<Calendar className="w-5 h-5 text-bleu" />}
            bg="bg-blue-50"
          />
          <StatCard
            label="Charges récurrentes"
            value={fmtCurrency(stats.recurring)}
            sub={`${expenses.filter((e) => e.isRecurring).length} postes récurrents`}
            icon={<RefreshCw className="w-5 h-5 text-jaune" />}
            bg="bg-yellow-50"
          />
          <StatCard
            label="Poste principal"
            value={
              stats.topCat
                ? (CATEGORY_LABELS[stats.topCat[0] as ExpenseCategory] ??
                  stats.topCat[0])
                : "—"
            }
            sub={stats.topCat ? fmtCurrency(stats.topCat[1]) : ""}
            icon={<Tag className="w-5 h-5 text-purple-500" />}
            bg="bg-purple-50"
          />
        </div>

        {/* ── Répartition ── */}
        {expenses.length > 0 && <CategoryBar expenses={expenses} />}

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher catégorie, facture, notes…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${showFilters ? "bg-rouge text-white border-rouge" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <Filter className="w-3.5 h-3.5" /> Filtres
            {activeFilters > 0 && (
              <span
                className={`ml-0.5 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${showFilters ? "bg-white text-rouge" : "bg-rouge text-white"}`}
              >
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* ── Filtres avancés ── */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Catégorie
              </label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <option value="all">Toutes</option>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Paiement
              </label>
              <select
                value={filterPayment}
                onChange={(e) => {
                  setFilterPayment(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <option value="all">Tous</option>
                {Object.entries(PAYMENT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Du
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Au
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
          </div>
        )}

        {/* ── Résumé filtre ── */}
        {activeFilters > 0 && (
          <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            <p className="text-xs font-semibold text-rouge">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""} · Total
              : {fmtCurrency(stats.filteredTotal)}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("all");
                setFilterPayment("all");
                setFilterRecurring("all");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
              className="text-xs font-bold text-rouge hover:underline"
            >
              Réinitialiser
            </button>
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
            <Wallet className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">
              Aucune dépense trouvée
            </p>
            <p className="text-sm">
              Modifiez les filtres ou ajoutez des dépenses
            </p>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-50 text-rouge rounded-xl text-sm font-semibold hover:bg-red-100 transition"
            >
              <Plus className="w-4 h-4" /> Nouvelle dépense
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4">
                      <ColHeader
                        label="Date"
                        colKey="date"
                        current={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="p-4">
                      <ColHeader
                        label="Catégorie"
                        colKey="category"
                        current={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="p-4">
                      <ColHeader
                        label="Montant TTC"
                        colKey="totalAmount"
                        current={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="p-4">
                      <ColHeader
                        label="Paiement"
                        colKey="paymentMethod"
                        current={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Facture / Notes
                    </th>
                    <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {paginated.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/70 transition"
                    >
                      <td className="p-4 font-medium text-gray-700 whitespace-nowrap">
                        {fmtDate(item.date)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[item.category] || "bg-gray-50 text-gray-700 border-gray-200"}`}
                        >
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                        {item.isRecurring && (
                          <span
                            className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200"
                            title="Récurrent"
                          >
                            🔄
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-black text-gray-900 whitespace-nowrap">
                        {fmtCurrency(item.totalAmount)}
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {PAYMENT_LABELS[item.paymentMethod] ||
                          item.paymentMethod}
                      </td>
                      <td className="p-4 max-w-xs truncate hidden lg:table-cell text-gray-400">
                        {item.invoiceNumber && (
                          <span className="text-gray-600 font-mono text-xs block">
                            {item.invoiceNumber}
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-xs block truncate">
                            {item.notes}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowForm(true);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-rouge transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                <span className="text-xs text-gray-500 font-medium">
                  Page <strong>{page}</strong> sur <strong>{totalPages}</strong>
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals Modulaires ── */}
      {showForm && (
        <ExpenseFormModal
          farmId={farmId!}
          initial={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingItem(null);
            fetchData();
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          expense={deleteTarget}
          isDeleting={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default ExpensesDashboard;
