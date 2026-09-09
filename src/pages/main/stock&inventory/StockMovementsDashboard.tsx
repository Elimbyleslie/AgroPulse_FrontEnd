/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search, RefreshCw, ChevronRight, Filter, Download,
  Truck, Plus, Pencil, Trash2, X, ArrowUpCircle, ArrowDownCircle,
  RotateCcw, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchStockMovements, createStockMovement, updateStockMovement, deleteStockMovement,
} from "../../../store/stockMovement/action";
import {
  selectStockMovements, selectStockMovementState,
} from "../../../store/stockMovement/slice";
import { fecthInventory } from "../../../store/alimentations/action";
import { selectInventory } from "../../../store/alimentations/slice";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { StockMovement, StockMovementType } from "../../../models/stockMovement";
import SelectInput from "../../../components/UI/SelectInput";

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtDate = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtNum = (n?: number | null, dec = 1) =>
  n != null ? Number(n).toFixed(dec).replace(".", ",") : "—";

const typeConfig: Record<string, { label: string; cls: string; sign: 1 | -1; icon: React.ReactNode }> = {
  PURCHASE: { label: "Achat", cls: "bg-emerald-50 text-vert border border-emerald-200", sign: 1, icon: <ArrowUpCircle className="w-3.5 h-3.5" /> },
  USAGE: { label: "Utilisation", cls: "bg-red-50 text-rouge border border-red-200", sign: -1, icon: <ArrowDownCircle className="w-3.5 h-3.5" /> },
  ADJUSTMENT: { label: "Ajustement", cls: "bg-blue-50 text-bleu border border-blue-200", sign: 1, icon: <RotateCcw className="w-3.5 h-3.5" /> },
  TRANSFER: { label: "Transfert", cls: "bg-purple-50 text-purple-600 border border-purple-200", sign: 1, icon: <Truck className="w-3.5 h-3.5" /> },
  RETURN: { label: "Retour", cls: "bg-amber-50 text-amber-600 border border-amber-200", sign: 1, icon: <ArrowUpCircle className="w-3.5 h-3.5" /> },
  WASTE: { label: "Perte/Déchet", cls: "bg-gray-100 text-gray-600 border border-gray-200", sign: -1, icon: <ArrowDownCircle className="w-3.5 h-3.5" /> },
};

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; icon: React.ReactNode; bg: string }> =
  ({ label, value, sub, icon, bg }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
        <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );

const DeleteModal: React.FC<{ movement: StockMovement; onCancel: () => void; onConfirm: () => void; isDeleting: boolean }> =
  ({ movement, onCancel, onConfirm, isDeleting }) => (
    <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Supprimer ce mouvement ?</h3>
            <p className="text-sm text-gray-500">{typeConfig[movement.type]?.label} · {movement.quantity}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
          Cette action ne recalcule pas automatiquement les quantités de stock antérieures. <strong>Irréversible</strong>.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50">Annuler</button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rouge text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isDeleting ? <><Spinner /> Suppression…</> : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );

const MovementFormModal: React.FC<{
  farmId: number; inventories: any[]; initial?: StockMovement | null; onClose: () => void; onSuccess: () => void;
}> = ({ farmId, inventories, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    inventoryId: initial?.inventoryId ? String(initial.inventoryId) : "",
    type: initial?.type || StockMovementType.PURCHASE,
    quantity: initial?.quantity ?? ("" as any),
    reference: initial?.reference || "",
    notes: initial?.notes || "",
  });

  const set = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));
  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";

  const inventoryOptions = inventories.map((i) => ({ value: String(i.id), label: `${i.name} (${fmtNum(i.quantity)} ${i.unit})` }));
  const selectedInventory = inventories.find((i) => String(i.id) === form.inventoryId);

  const handleSubmit = async () => {
    if (!form.inventoryId || !form.quantity || !form.type) return;
    setSaving(true);
    try {
      if (initial) {
        await dispatch(updateStockMovement({
          id: initial.id,
          data: { quantity: Number(form.quantity), reference: form.reference || undefined, notes: form.notes || undefined },
        })).unwrap();
        toast.success("Mouvement mis à jour avec succès");
      } else {
        await dispatch(createStockMovement({
          inventoryId: Number(form.inventoryId),
          type: form.type as StockMovementType,
          quantity: Number(form.quantity),
          reference: form.reference || undefined,
          notes: form.notes || undefined,
          farmId,
        } as any)).unwrap();
        toast.success("Mouvement enregistré avec succès");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">{initial ? "Modifier le mouvement" : "Nouveau mouvement"}</h2>
              <p className="text-xs text-gray-400">{initial ? `ID #${initial.id}` : "Entrée ou sortie de stock"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Article concerné <span className="text-red-400">*</span>
            </label>
            <SelectInput value={form.inventoryId} onChange={(v) => set("inventoryId", v)}
              options={inventoryOptions} placeholder="— choisir un article —" disabled={!!initial} />
            {selectedInventory && (
              <p className="text-xs text-gray-400 mt-1.5">Stock actuel : {fmtNum(selectedInventory.quantity)} {selectedInventory.unit}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Type de mouvement <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <button key={key} type="button" disabled={!!initial} onClick={() => set("type", key)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold border transition disabled:opacity-50 ${
                    form.type === key ? "bg-vert text-white border-vert" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                  }`}>
                  {cfg.icon}
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Quantité <span className="text-red-400">*</span>
            </label>
            <input type="number" step="0.01" value={form.quantity} onChange={(e) => set("quantity", e.target.value)}
              className={inputClass} placeholder="0.00" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Référence</label>
            <input type="text" value={form.reference} onChange={(e) => set("reference", e.target.value)}
              className={inputClass} placeholder="N° bon, facture..." />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className={`${inputClass} resize-none`} placeholder="Observations..." />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition">Annuler</button>
          <button onClick={handleSubmit} disabled={saving || !form.inventoryId || !form.quantity}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200">
            {saving ? <><Spinner /> Enregistrement…</> : initial ? "Enregistrer" : "Créer le mouvement"}
          </button>
        </div>
      </div>
    </div>
  );
};

type SortKey = "date" | "type" | "quantity";

const ColHeader: React.FC<{ label: string; colKey: SortKey; current: SortKey; dir: "asc" | "desc"; onSort: (k: SortKey) => void }> =
  ({ label, colKey, current, dir, onSort }) => (
    <button onClick={() => onSort(colKey)} className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition">
      {label}
      {current === colKey ? (dir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-20" />}
    </button>
  );

const ITEMS_PER_PAGE = 20;

const StockMovementsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const movements = useAppSelector(selectStockMovements);
  const inventories = useAppSelector(selectInventory);
  const { loading } = useAppSelector(selectStockMovementState);
  const farmId = currentFarm?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<StockMovement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockMovement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (farmId) {
      dispatch(fetchStockMovements({ farmId, limit: 500 }));
      dispatch(fecthInventory({farmId}));
    }
  }, [dispatch, farmId]);

  const refresh = useCallback(() => {
    if (farmId) {
      dispatch(fetchStockMovements({ farmId, limit: 500 }));
      toast.info("Données actualisées");
    }
  }, [dispatch, farmId]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteStockMovement(deleteTarget.id)).unwrap();
      toast.success("Mouvement supprimé avec succès");
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
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

  const filtered = useMemo(() => {
    let list = [...movements];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((m) => [m.inventory?.name, m.reference, m.notes].some((v) => v?.toLowerCase().includes(q)));
    }
    if (filterType !== "all") list = list.filter((m) => m.type === filterType);
    if (dateFrom) list = list.filter((m) => m.date && new Date(m.date) >= new Date(dateFrom));
    if (dateTo) list = list.filter((m) => m.date && new Date(m.date) <= new Date(dateTo));

    list.sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortKey === "date") { aVal = a.date || ""; bVal = b.date || ""; }
      else if (sortKey === "quantity") { aVal = a.quantity; bVal = b.quantity; }
      else { aVal = a.type; bVal = b.type; }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [movements, searchTerm, filterType, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const entriesQty = movements.filter((m) => typeConfig[m.type]?.sign === 1).reduce((s, m) => s + m.quantity, 0);
  const exitsQty = movements.filter((m) => typeConfig[m.type]?.sign === -1).reduce((s, m) => s + m.quantity, 0);
  const activeFilters = [filterType !== "all", !!dateFrom, !!dateTo, !!searchTerm].filter(Boolean).length;

  const exportCSV = () => {
    const rows = [
      ["Date", "Article", "Type", "Quantité", "Stock avant", "Stock après", "Référence", "Notes"],
      ...filtered.map((m) => [
        fmtDate(m.date), m.inventory?.name || "", typeConfig[m.type]?.label || m.type, m.quantity,
        m.previousQuantity, m.newQuantity, m.reference || "", m.notes || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "mouvements_stock.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium" />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Stocks & Matériel</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Mouvements de Stock</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Mouvements de Stock</h1>
            <p className="text-sm text-gray-400 mt-0.5">Historique des entrées et sorties</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={refresh} className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition shadow-sm shadow-emerald-200">
              <Plus className="w-4 h-4" /> Nouveau mouvement
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total mouvements" value={movements.length} sub="enregistrements" icon={<Truck className="w-5 h-5 text-vert" />} bg="bg-emerald-50" />
          <StatCard label="Entrées" value={fmtNum(entriesQty)} sub="achats, retours..." icon={<ArrowUpCircle className="w-5 h-5 text-vert" />} bg="bg-emerald-50" />
          <StatCard label="Sorties" value={fmtNum(exitsQty)} sub="usage, pertes..." icon={<ArrowDownCircle className="w-5 h-5 text-rouge" />} bg="bg-red-50" />
          <StatCard label="Dernier mouvement" value={movements[0] ? fmtDate(movements[0].date) : "—"} sub={movements[0]?.inventory?.name || ""} icon={<RotateCcw className="w-5 h-5 text-bleu" />} bg="bg-blue-50" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Rechercher article, référence, notes..."
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition" />
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

        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Type</label>
              <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="all">Tous</option>
                {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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

        {activeFilters > 0 && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
            <p className="text-xs font-semibold text-vert">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p>
            <button onClick={() => { setSearchTerm(""); setFilterType("all"); setDateFrom(""); setDateTo(""); setPage(1); }}
              className="text-xs font-bold text-vert hover:underline">Réinitialiser</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" /><span className="text-sm">Chargement…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Truck className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">Aucun mouvement trouvé</p>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition">
              <Plus className="w-4 h-4" /> Nouveau mouvement
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[110px_1fr_130px_100px_110px_110px_110px_96px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <ColHeader label="Date" colKey="date" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Article</p>
              <ColHeader label="Type" colKey="type" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Quantité" colKey="quantity" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avant → Après</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Référence</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notes</p>
              <p />
            </div>
            <div className="divide-y divide-gray-50">
              {paginated.map((m) => {
                const cfg = typeConfig[m.type];
                return (
                  <div key={m.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[110px_1fr_130px_100px_110px_110px_110px_96px] gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition items-center group">
                    <p className="text-xs text-gray-500">{fmtDate(m.date)}</p>
                    <p className="font-semibold text-gray-800 text-sm">{m.inventory?.name || `Article #${m.inventoryId}`}</p>
                    <div className="hidden md:block">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${cfg?.cls}`}>
                        {cfg?.icon} {cfg?.label}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <p className={`text-sm font-bold ${cfg?.sign === 1 ? "text-vert" : "text-rouge"}`}>
                        {cfg?.sign === 1 ? "+" : "−"}{fmtNum(m.quantity)}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs text-gray-500">{fmtNum(m.previousQuantity)} → {fmtNum(m.newQuantity)}</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs text-gray-500 truncate" title={m.reference}>{m.reference || "—"}</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs text-gray-400 truncate" title={m.notes}>{m.notes || "—"}</p>
                    </div>
                    <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditingItem(m); setShowForm(true); }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700" title="Modifier">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(m)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

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

      {showForm && farmId && (
        <MovementFormModal farmId={farmId} inventories={inventories} initial={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSuccess={() => { setShowForm(false); setEditingItem(null); refresh(); }} />
      )}

      {deleteTarget && (
        <DeleteModal movement={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} isDeleting={isDeleting} />
      )}
    </>
  );
};

export default StockMovementsDashboard;