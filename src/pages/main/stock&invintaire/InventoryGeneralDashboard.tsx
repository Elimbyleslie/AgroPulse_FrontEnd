/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search, RefreshCw, ChevronRight, Filter, Download,
  Package, Plus, Pencil, Trash2, X, AlertTriangle, Boxes, Layers,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fecthInventory, createInventory, updateInventory, deleteInventory,
} from "../../../store/alimentations/action";
import {
  selectInventory, selectInventoryState,
} from "../../../store/alimentations/slice";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { Inventory, InventoryCategory } from "../../../models/alimentation";
import SelectInput from "../../../components/UI/SelectInput";

// ── Helpers ───────────────────────────────────────────────────────────────────
const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtNum = (n?: number | null, dec = 1) =>
  n != null ? Number(n).toFixed(dec).replace(".", ",") : "—";

const categoryLabels: Record<string, string> = {
  FEED: "Aliment", MEDICINE: "Médicament", SUPPLEMENT: "Complément",
  FERTILIZER: "Engrais", SEED: "Semence", EQUIPMENT: "Équipement",
  TOOL: "Outil", CHEMICAL: "Produit chimique", PACKAGING: "Emballage",
  FUEL: "Carburant", OTHER: "Autre",
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  IN_STOCK: { label: "En stock", cls: "bg-emerald-50 text-vert border border-emerald-200" },
  LOW_STOCK: { label: "Stock bas", cls: "bg-amber-50 text-amber-600 border border-amber-200" },
  OUT_OF_STOCK: { label: "Rupture", cls: "bg-red-50 text-rouge border border-red-200" },
  EXPIRED: { label: "Expiré", cls: "bg-gray-100 text-gray-500 border border-gray-200" },
};

const deriveStatus = (item: Inventory): keyof typeof statusConfig => {
  if (item.status) return item.status as keyof typeof statusConfig;
  if (item.expiryDate && new Date(item.expiryDate) < new Date()) return "EXPIRED";
  if (item.quantity <= 0) return "OUT_OF_STOCK";
  if (item.minQuantity != null && item.quantity <= item.minQuantity) return "LOW_STOCK";
  return "IN_STOCK";
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
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

// ── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteModal: React.FC<{ item: Inventory; onCancel: () => void; onConfirm: () => void; isDeleting: boolean }> =
  ({ item, onCancel, onConfirm, isDeleting }) => (
    <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Supprimer cet article ?</h3>
            <p className="text-sm text-gray-500">{item.name} · {item.quantity} {item.unit}</p>
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
const InventoryFormModal: React.FC<{
  farmId: number; initial?: Inventory | null; onClose: () => void; onSuccess: () => void;
}> = ({ farmId, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: initial?.name || "",
    category: initial?.category || InventoryCategory.FEED,
    quantity: initial?.quantity ?? ("" as any),
    unit: initial?.unit || "kg",
    minQuantity: initial?.minQuantity ?? ("" as any),
    unitPrice: initial?.unitPrice ?? ("" as any),
    location: initial?.location || "",
    sku: initial?.sku || "",
    expiryDate: initial?.expiryDate ? new Date(initial.expiryDate).toISOString().slice(0, 10) : "",
  });

  const set = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));
  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";

  const handleSubmit = async () => {
    if (!form.name || !form.quantity || !form.unit) return;
    setSaving(true);
    try {
      const payload: any = {
        farmId,
        name: form.name,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        minQuantity: form.minQuantity ? Number(form.minQuantity) : undefined,
        unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
        location: form.location || undefined,
        sku: form.sku || undefined,
        expiryDate: form.expiryDate || undefined,
      };
      if (initial) {
        await dispatch(updateInventory({ id: initial.id, data: payload })).unwrap();
        toast.success("Article mis à jour avec succès");
      } else {
        await dispatch(createInventory(payload)).unwrap();
        toast.success("Article ajouté avec succès");
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
              <Boxes className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">{initial ? "Modifier l'article" : "Nouvel article"}</h2>
              <p className="text-xs text-gray-400">{initial ? `ID #${initial.id}` : "Remplissez les informations"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nom <span className="text-red-400">*</span>
            </label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="ex: Granulés porc, Vaccin..." className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Catégorie</label>
            <SelectInput value={form.category} onChange={(v) => set("category", v)}
              options={Object.values(InventoryCategory).map((c) => ({ value: c, label: categoryLabels[c] || c }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Quantité <span className="text-red-400">*</span>
              </label>
              <input type="number" step="0.01" value={form.quantity} onChange={(e) => set("quantity", e.target.value)}
                className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Unité</label>
              <SelectInput value={form.unit} onChange={(v) => set("unit", v)}
                options={[
                  { value: "kg", label: "Kilogrammes" },
                  { value: "L", label: "Litres" },
                  { value: "pcs", label: "Pièces" },
                  { value: "sac", label: "Sacs" },
                  { value: "g", label: "Grammes" },
                ]} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Seuil d'alerte</label>
              <input type="number" step="0.01" value={form.minQuantity} onChange={(e) => set("minQuantity", e.target.value)}
                className={inputClass} placeholder="Optionnel" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Prix unitaire</label>
              <input type="number" step="0.01" value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)}
                className={inputClass} placeholder="Optionnel" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Emplacement</label>
              <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)}
                className={inputClass} placeholder="ex: Hangar A" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">SKU</label>
              <input type="text" value={form.sku} onChange={(e) => set("sku", e.target.value)}
                className={inputClass} placeholder="Référence" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Date d'expiration</label>
            <input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving || !form.name || !form.quantity}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200">
            {saving ? <><Spinner /> Enregistrement…</> : initial ? "Enregistrer" : "Créer l'article"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Column Header ─────────────────────────────────────────────────────────────
type SortKey = "name" | "category" | "quantity" | "unitPrice";

const ColHeader: React.FC<{ label: string; colKey: SortKey; current: SortKey; dir: "asc" | "desc"; onSort: (k: SortKey) => void }> =
  ({ label, colKey, current, dir, onSort }) => (
    <button onClick={() => onSort(colKey)} className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition">
      {label}
      {current === colKey ? (dir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-20" />}
    </button>
  );

// ── Main ──────────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 20;

const InventoryGeneralDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const items = useAppSelector(selectInventory);
  const { loading } = useAppSelector(selectInventoryState);
  const farmId = currentFarm?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Inventory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (farmId) dispatch(fecthInventory(farmId));
  }, [dispatch, farmId]);

  const refresh = useCallback(() => {
    if (farmId) {
      dispatch(fecthInventory(farmId));
      toast.info("Données actualisées");
    }
  }, [dispatch, farmId]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteInventory({ id: deleteTarget.id })).unwrap();
      toast.success(`"${deleteTarget.name}" supprimé avec succès`);
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
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...items];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((i) => [i.name, i.sku, i.location].some((v) => v?.toLowerCase().includes(q)));
    }
    if (filterCategory !== "all") list = list.filter((i) => i.category === filterCategory);
    if (filterStatus !== "all") list = list.filter((i) => deriveStatus(i) === filterStatus);

    list.sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortKey === "quantity") { aVal = a.quantity; bVal = b.quantity; }
      else if (sortKey === "unitPrice") { aVal = a.unitPrice ?? 0; bVal = b.unitPrice ?? 0; }
      else { aVal = (a as any)[sortKey] || ""; bVal = (b as any)[sortKey] || ""; }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [items, searchTerm, filterCategory, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalValue = items.reduce((s, i) => s + (i.unitPrice ? i.unitPrice * i.quantity : 0), 0);
  const lowStockCount = items.filter((i) => ["LOW_STOCK", "OUT_OF_STOCK"].includes(deriveStatus(i))).length;
  const activeFilters = [filterCategory !== "all", filterStatus !== "all", !!searchTerm].filter(Boolean).length;

  const exportCSV = () => {
    const rows = [
      ["Nom", "Catégorie", "Quantité", "Unité", "Statut", "Prix unitaire", "Emplacement", "SKU"],
      ...filtered.map((i) => [
        i.name, categoryLabels[i.category] || i.category, i.quantity, i.unit,
        statusConfig[deriveStatus(i)]?.label || "", i.unitPrice ?? "", i.location || "", i.sku || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "inventaire.csv"; a.click();
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
              <span className="text-gray-600 font-medium">Inventaire Général</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Inventaire Général</h1>
            <p className="text-sm text-gray-400 mt-0.5">Vue complète de tous vos articles en stock</p>
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
              <Plus className="w-4 h-4" /> Nouvel article
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total articles" value={items.length} sub="références" icon={<Boxes className="w-5 h-5 text-vert" />} bg="bg-emerald-50" />
          <StatCard label="Valeur du stock" value={`${fmtNum(totalValue, 0)} F`} sub="estimation" icon={<Layers className="w-5 h-5 text-bleu" />} bg="bg-blue-50" />
          <StatCard label="Alertes stock" value={lowStockCount} sub="bas / rupture" icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} bg="bg-amber-50" />
          <StatCard label="Catégories" value={new Set(items.map((i) => i.category)).size} sub="types distincts" icon={<Package className="w-5 h-5 text-jaune" />} bg="bg-yellow-50" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Rechercher nom, SKU, emplacement..."
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
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Catégorie</label>
              <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="all">Toutes</option>
                {Object.values(InventoryCategory).map((c) => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Statut</label>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="all">Tous</option>
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {activeFilters > 0 && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
            <p className="text-xs font-semibold text-vert">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p>
            <button onClick={() => { setSearchTerm(""); setFilterCategory("all"); setFilterStatus("all"); setPage(1); }}
              className="text-xs font-bold text-vert hover:underline">Réinitialiser</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" /><span className="text-sm">Chargement…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Package className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">Aucun article trouvé</p>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition">
              <Plus className="w-4 h-4" /> Nouvel article
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_120px_110px_110px_110px_120px_96px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <ColHeader label="Nom" colKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Catégorie" colKey="category" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Quantité" colKey="quantity" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</p>
              <ColHeader label="Prix unit." colKey="unitPrice" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Emplacement</p>
              <p />
            </div>
            <div className="divide-y divide-gray-50">
              {paginated.map((item) => {
                const status = deriveStatus(item);
                return (
                  <div key={item.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_120px_110px_110px_110px_120px_96px] gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition items-center group">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                      {item.sku && <p className="text-xs text-gray-400">{item.sku}</p>}
                    </div>
                    <div className="hidden md:block">
                      <span className="inline-flex text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
                        {categoryLabels[item.category] || item.category}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-bold text-gray-800">{fmtNum(item.quantity)} <span className="font-normal text-gray-400">{item.unit}</span></p>
                    </div>
                    <div className="hidden md:block">
                      <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-lg ${statusConfig[status]?.cls}`}>
                        {statusConfig[status]?.label}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm text-gray-600">{item.unitPrice ? `${fmtNum(item.unitPrice, 0)} F` : "—"}</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs text-gray-500 truncate" title={item.location}>{item.location || "—"}</p>
                    </div>
                    <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditingItem(item); setShowForm(true); }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700" title="Modifier">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(item)}
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
        <InventoryFormModal farmId={farmId} initial={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSuccess={() => { setShowForm(false); setEditingItem(null); refresh(); }} />
      )}

      {deleteTarget && (
        <DeleteModal item={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} isDeleting={isDeleting} />
      )}
    </>
  );
};

export default InventoryGeneralDashboard;