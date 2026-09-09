/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search, RefreshCw, ChevronRight, Filter, Download, Wallet,
  Calendar, ChevronDown, ChevronUp, Plus, Pencil, Trash2, X, CreditCard, Tag,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchPayments, createPayment, updatePayment, deletePayment,
} from "../../../store/gestionFinanciere/paymentAction";
import {
  selectPayments, selectPaymentsListState,
} from "../../../store/gestionFinanciere/paymentSlice";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import { getAllExpenses } from "../../../store/gestionFinanciere/action";

import { getAllSales } from "../../../store/gestionFinanciere/action";
import { PaymentMethod, PaymentStatus } from "../../../models/gestionFinanciere";

// ── Helpers ───────────────────────────────────────────────────────────────────
const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateInput = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const fmtCurrency = (n?: number | null) =>
  n != null ? new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n) + " FCFA" : "—";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.card]: "Carte",
  [PaymentMethod.mobile_money]: "Mobile Money",
  [PaymentMethod.orange_money]: "Orange Money",
  [PaymentMethod.bank_transfer]: "Virement bancaire",
  [PaymentMethod.check]: "Chèque",
  [PaymentMethod.cash]: "Espèces",
  [PaymentMethod.other]: "Autre",
};

const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; cls: string }> = {
  [PaymentStatus.PENDING]: { label: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  [PaymentStatus.PARTIAL]: { label: "Partiel", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  [PaymentStatus.COMPLETED]: { label: "Complété", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  [PaymentStatus.FAILED]: { label: "Échoué", cls: "bg-red-50 text-red-700 border-red-200" },
  [PaymentStatus.CANCELLED]: { label: "Annulé", cls: "bg-gray-50 text-gray-600 border-gray-200" },
  [PaymentStatus.REFUNDED]: { label: "Remboursé", cls: "bg-purple-50 text-purple-700 border-purple-200" },
};

type TargetType = "sale" | "purchase" | "expense" | "none";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string; sub?: string; icon: React.ReactNode; bg: string }> =
  ({ label, value, sub, icon, bg }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
        <p className="text-lg font-black text-gray-900 leading-tight truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

// ── Delete Modal ─────────────────────────────────────────────────────────────
const DeleteModal: React.FC<{
  payment: any; onCancel: () => void; onConfirm: () => void; isDeleting: boolean;
}> = ({ payment, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-rouge" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Supprimer ce paiement ?</h3>
          <p className="text-sm text-gray-500">{fmtCurrency(payment.amount)}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
        Cette action est <strong>irréversible</strong>.
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

// ── Form Modal ────────────────────────────────────────────────────────────────
const PaymentFormModal: React.FC<{
  farmId: number; sales: any[]; expenses: any[]; initial?: any | null;
  onClose: () => void; onSuccess: () => void;
}> = ({ farmId, sales, expenses, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const initialTarget: TargetType = initial?.saleId ? "sale" : initial?.purchaseId ? "purchase" : initial?.expenseId ? "expense" : "none";

  const [form, setForm] = useState({
    targetType: initialTarget,
    saleId: initial?.saleId ? String(initial.saleId) : "",
    purchaseId: initial?.purchaseId ? String(initial.purchaseId) : "",
    expenseId: initial?.expenseId ? String(initial.expenseId) : "",
    amount: initial?.amount ? String(initial.amount) : "",
    currency: initial?.currency || "XOF",
    method: initial?.method || PaymentMethod.cash,
    status: initial?.status || PaymentStatus.COMPLETED,
    reference: initial?.reference || "",
    notes: initial?.notes || "",
    paidAt: fmtDateInput(initial?.paidAt) || fmtDateInput(new Date().toISOString()),
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const changeTarget = (t: TargetType) => {
    setForm((p) => ({ ...p, targetType: t, saleId: "", purchaseId: "", expenseId: "" }));
  };

  const canSubmit = form.amount && form.method &&
    (form.targetType === "none" ? true :
      form.targetType === "sale" ? !!form.saleId :
      form.targetType === "purchase" ? !!form.purchaseId :
      !!form.expenseId);

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Montant, méthode et cible sont obligatoires");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        farmId,
        saleId: form.targetType === "sale" ? Number(form.saleId) : null,
        purchaseId: form.targetType === "purchase" ? Number(form.purchaseId) : null,
        expenseId: form.targetType === "expense" ? Number(form.expenseId) : null,
        amount: Number(form.amount),
        currency: form.currency,
        method: form.method,
        status: form.status,
        reference: form.reference || null,
        notes: form.notes || null,
        paidAt: form.paidAt || null,
      };
      if (initial) {
        await dispatch(updatePayment({ id: initial.id, data: payload })).unwrap();
        toast.success("Paiement mis à jour");
      } else {
        await dispatch(createPayment(payload)).unwrap();
        toast.success("Paiement enregistré");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm transition";

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-rouge" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">
              {initial ? "Modifier le paiement" : "Nouveau paiement"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Ce paiement concerne</label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { key: "none", label: "Aucun" },
                { key: "sale", label: "Vente" },
                { key: "purchase", label: "Achat" },
                { key: "expense", label: "Dépense" },
              ] as const).map(({ key, label }) => (
                <button key={key} type="button" onClick={() => changeTarget(key)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                    form.targetType === key ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.targetType === "sale" && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Vente</label>
              <select value={form.saleId} onChange={(e) => set("saleId", e.target.value)} className={inputClass}>
                <option value="">— choisir —</option>
                {sales.map((s: any) => (
                  <option key={s.id} value={s.id}>#{s.id} · {fmtCurrency(s.total)} · {fmtDate(s.date)}</option>
                ))}
              </select>
            </div>
          )}

          {form.targetType === "purchase" && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                ID de l'achat {/* ⚠️ pas de liste des achats disponible */}
              </label>
              <input type="number" value={form.purchaseId} onChange={(e) => set("purchaseId", e.target.value)}
                placeholder="ID de l'achat" className={inputClass} />
            </div>
          )}

          {form.targetType === "expense" && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Dépense</label>
              <select value={form.expenseId} onChange={(e) => set("expenseId", e.target.value)} className={inputClass}>
                <option value="">— choisir —</option>
                {expenses.map((e: any) => (
                  <option key={e.id} value={e.id}>#{e.id} · {fmtCurrency(e.totalAmount)} · {fmtDate(e.date)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Montant <span className="text-rouge">*</span>
              </label>
              <div className="relative">
                <input type="number" step="1" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)}
                  className={inputClass} placeholder="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">{form.currency}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Date</label>
              <input type="date" value={form.paidAt} onChange={(e) => set("paidAt", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Méthode de paiement</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PAYMENT_METHOD_LABELS).map(([val, label]) => (
                <button key={val} type="button" onClick={() => set("method", val)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    form.method === val ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Statut</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
              {Object.entries(PAYMENT_STATUS_META).map(([val, meta]) => (
                <option key={val} value={val}>{meta.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Référence</label>
            <input type="text" value={form.reference} onChange={(e) => set("reference", e.target.value)}
              placeholder="ex: N° transaction" className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className={`${inputClass} resize-none`} placeholder="Remarques éventuelles…" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving || !canSubmit}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-rouge text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-red-600 transition">
            {saving ? <><Spinner /> Enregistrement…</> : initial ? "Enregistrer" : "Créer le paiement"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Sort Column Header ─────────────────────────────────────────────────────────
type SortKey = "paidAt" | "amount" | "method" | "status";

const ColHeader: React.FC<{ label: string; colKey: SortKey; current: SortKey; dir: "asc" | "desc"; onSort: (k: SortKey) => void }> =
  ({ label, colKey, current, dir, onSort }) => (
    <button onClick={() => onSort(colKey)} className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition">
      {label}
      {current === colKey ? (dir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-20" />}
    </button>
  );

// ── Main Component ─────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 20;

const PaymentsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const farmId = currentFarm?.id;

  const payments = useAppSelector(selectPayments) ?? [];
  const listState = useAppSelector(selectPaymentsListState);
  const isLoading = listState?.loading;

  const salesRaw = useAppSelector((s: any) => s.finance?.saleList?.entities);
  const expensesRaw = useAppSelector((s: any) => s.finance?.expenseList?.entities);
  const sales = Array.isArray(salesRaw) ? salesRaw : [];
  const expenses = Array.isArray(expensesRaw) ? expensesRaw : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("paidAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(() => {
    if (farmId) dispatch(fetchPayments({ farmId, limit: 500, page: 1 }));
  }, [dispatch, farmId]);

  useEffect(() => {
    if (!farmId) dispatch(getUserFarms());
    else {
      fetchData();
      dispatch(getAllSales({ farmId, page: 1, limit: 200 }));
      dispatch(getAllExpenses({ farmId, page: 1, limit: 200 }));
    }
  }, [farmId, fetchData, dispatch]);

  const refresh = useCallback(() => {
    fetchData();
    toast.info("Données actualisées");
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deletePayment({ id: deleteTarget.id })).unwrap();
      toast.success("Paiement supprimé");
      setDeleteTarget(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const targetLabel = (p: any) => {
    if (p.reference) return `Vente #${p.reference}`;
    if (p.notes) return `Achat #${p.notes}`;
    if (p.inventory.name) return `Dépense #${p.inventory.name}`;
    return "—";
  };

  const filtered = useMemo(() => {
    let list = [...payments];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p: any) =>
        [p.reference, p.notes, targetLabel(p)].some((v) => v?.toLowerCase?.().includes(q)),
      );
    }
    if (filterMethod !== "all") list = list.filter((p: any) => p.method === filterMethod);
    if (filterStatus !== "all") list = list.filter((p: any) => p.status === filterStatus);
    if (dateFrom) list = list.filter((p: any) => p.paidAt && p.paidAt >= dateFrom);
    if (dateTo) list = list.filter((p: any) => p.paidAt && p.paidAt <= dateTo);

    list.sort((a: any, b: any) => {
      let aVal: any, bVal: any;
      if (sortKey === "paidAt") { aVal = a.paidAt || ""; bVal = b.paidAt || ""; }
      else if (sortKey === "amount") { aVal = a.amount; bVal = b.amount; }
      else { aVal = a[sortKey] || ""; bVal = b[sortKey] || ""; }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [payments, searchTerm, filterMethod, filterStatus, dateFrom, dateTo, sortKey, sortDir]);

  const stats = useMemo(() => {
    const total = payments.reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    const completed = payments.filter((p: any) => p.status === PaymentStatus.COMPLETED).reduce((s: number, p: any) => s + p.amount, 0);
    const pending = payments.filter((p: any) => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.PARTIAL).reduce((s: number, p: any) => s + p.amount, 0);
    const failed = payments.filter((p: any) => p.status === PaymentStatus.FAILED).length;
    return { total, completed, pending, failed, count: payments.length };
  }, [payments]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const activeFilters = [filterMethod !== "all", filterStatus !== "all", !!dateFrom, !!dateTo, !!searchTerm].filter(Boolean).length;

  const exportCSV = () => {
    const rows = [
      ["Date", "Cible", "Montant", "Méthode", "Statut", "Référence", "Notes"],
      ...filtered.map((p: any) => [
        p.paidAt || "", targetLabel(p), p.amount,
        PAYMENT_METHOD_LABELS[p.method as PaymentMethod] || p.method,
        PAYMENT_STATUS_META[p.status as PaymentStatus]?.label || p.status,
        p.reference || "", p.notes || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "paiements.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium" />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Finance & Ventes</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Paiements</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Paiements</h1>
            <p className="text-sm text-gray-400 mt-0.5">Historique des règlements ventes, achats et dépenses</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-rouge text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition shadow-sm shadow-red-200">
              <Plus className="w-4 h-4" /> Nouveau paiement
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total encaissé" value={fmtCurrency(stats.total)} sub={`${stats.count} paiements`}
            icon={<Wallet className="w-5 h-5 text-rouge" />} bg="bg-red-50" />
          <StatCard label="Complétés" value={fmtCurrency(stats.completed)} sub="paiements finalisés"
            icon={<CreditCard className="w-5 h-5 text-vert" />} bg="bg-green-50" />
          <StatCard label="En attente / partiels" value={fmtCurrency(stats.pending)} sub="à suivre"
            icon={<Calendar className="w-5 h-5 text-jaune" />} bg="bg-yellow-50" />
          <StatCard label="Échoués" value={String(stats.failed)} sub="paiements en échec"
            icon={<Tag className="w-5 h-5 text-purple-500" />} bg="bg-purple-50" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Rechercher référence, notes, cible…" value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${showFilters ? "bg-rouge text-white border-rouge" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            <Filter className="w-3.5 h-3.5" /> Filtres
            {activeFilters > 0 && (
              <span className={`ml-0.5 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${showFilters ? "bg-white text-rouge" : "bg-rouge text-white"}`}>
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Méthode</label>
              <select value={filterMethod} onChange={(e) => { setFilterMethod(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                <option value="all">Toutes</option>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Statut</label>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                <option value="all">Tous</option>
                {Object.entries(PAYMENT_STATUS_META).map(([val, meta]) => <option key={val} value={val}>{meta.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Du</label>
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Au</label>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
          </div>
        )}

        {activeFilters > 0 && (
          <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            <p className="text-xs font-semibold text-rouge">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p>
            <button onClick={() => { setSearchTerm(""); setFilterMethod("all"); setFilterStatus("all"); setDateFrom(""); setDateTo(""); setPage(1); }}
              className="text-xs font-bold text-rouge hover:underline">Réinitialiser</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" /><span className="text-sm">Chargement…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Wallet className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">Aucun paiement trouvé</p>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-50 text-rouge rounded-xl text-sm font-semibold hover:bg-red-100 transition">
              <Plus className="w-4 h-4" /> Nouveau paiement
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4"><ColHeader label="Date" colKey="paidAt" current={sortKey} dir={sortDir} onSort={handleSort} /></th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cible</th>
                    <th className="p-4"><ColHeader label="Montant" colKey="amount" current={sortKey} dir={sortDir} onSort={handleSort} /></th>
                    <th className="p-4"><ColHeader label="Méthode" colKey="method" current={sortKey} dir={sortDir} onSort={handleSort} /></th>
                    <th className="p-4"><ColHeader label="Statut" colKey="status" current={sortKey} dir={sortDir} onSort={handleSort} /></th>
                    <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {paginated.map((p: any) => {
                    const statusMeta = PAYMENT_STATUS_META[p.status as PaymentStatus] ?? PAYMENT_STATUS_META[PaymentStatus.PENDING];
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition">
                        <td className="p-4 font-medium text-gray-700 whitespace-nowrap">{fmtDate(p.paidAt)}</td>
                        <td className="p-4 text-gray-600">{targetLabel(p)}</td>
                        <td className="p-4 font-black text-gray-900 whitespace-nowrap">{fmtCurrency(p.amount)}</td>
                        <td className="p-4 text-gray-600 whitespace-nowrap">{PAYMENT_METHOD_LABELS[p.method as PaymentMethod] || p.method}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.cls}`}>{statusMeta.label}</span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => { setEditingItem(p); setShowForm(true); }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition" title="Modifier">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(p)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-rouge transition" title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                <span className="text-xs text-gray-500 font-medium">Page <strong>{page}</strong> sur <strong>{totalPages}</strong></span>
                <div className="flex gap-1.5">
                  <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition">
                    Précédent
                  </button>
                  <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition">
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && farmId && (
        <PaymentFormModal farmId={farmId} sales={sales} expenses={expenses} initial={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSuccess={() => { setShowForm(false); setEditingItem(null); fetchData(); }} />
      )}

      {deleteTarget && (
        <DeleteModal payment={deleteTarget} isDeleting={isDeleting} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
    </>
  );
};

export default PaymentsDashboard;