/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search,
  RefreshCw,
  ChevronRight,
  Download,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
  Phone,
  Mail,
  ReceiptText,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SupplierCategory } from "../../../models/achats&fournisseur";

import {
  fetchPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "../../../store/achats&fournisseur/action";
import {
  selectPurchases,
  selectPurchaseState,
} from "../../../store/achats&fournisseur/purchaseSlice";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../../store/achats&fournisseur/action";
import {
  selectSuppliers,
  selectSupplierState,
} from "../../../store/achats&fournisseur/slice";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { Purchase, PurchaseStatus } from "../../../models/achats&fournisseur";
import { Supplier } from "../../../models/achats&fournisseur";
import SelectInput from "../../../components/UI/SelectInput";

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

const fmtDate = (d?: string | Date) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtNum = (n?: number | null, dec = 0) =>
  n != null ? Number(n).toFixed(dec).replace(".", ",") : "—";

// Statuts alignés sur l'enum backend Prisma : PENDING | RECEIVED | CANCELLED
const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: {
    label: "En attente",
    cls: "bg-[#E3BA3E]/10 text-jaune border border-[#E3BA3E]/30",
  },
  RECEIVED: {
    label: "Reçu",
    cls: "bg-emerald-50 text-vert border border-emerald-200",
  },
  CANCELLED: {
    label: "Annulé",
    cls: "bg-gray-100 text-gray-500 border border-gray-200",
  },
};

const categoryLabels: Record<string, string> = {
  FEED: "alimentation",
  MEDICAL: "medecine",
  EQUIPMENT: "equipement",
  SERVICE: "service",
  OTHER: "autre",
};

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  bg: string;
}> = ({ label, value, sub, icon, bg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const DeleteModal: React.FC<{
  title: string;
  subtitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ title, subtitle, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
        Cette action est <strong>irréversible</strong>.
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
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rouge text-white hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
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

// ── Supplier Form ─────────────────────────────────────────────────────────────
const SupplierFormModal: React.FC<{
  initial?: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: initial?.name || "",
    category: initial?.category || SupplierCategory.FEED,
    email: initial?.email || "",
    phone: initial?.phone || "",
    farmId: currentFarm?.id || undefined,
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu/40 focus:border-transparent text-sm transition";

  const handleSubmit = async () => {
    if (!form.name?.trim() || !form.category) {
      toast.error("Le nom et la catégorie sont obligatoires");
      return;
    }

    if (!currentFarm?.id) {
      toast.error("Aucune ferme active trouvée");
      return;
    }

    setSaving(true);

    try {
      // Payload explicite et propre
      const payload: Supplier & { farmId: number } = {
        name: form.name.trim(),
        category: form.category as SupplierCategory, // Cast explicite
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
        farmId: currentFarm.id,
      };

      if (initial?.id) {
        await dispatch(
          updateSupplier({ id: initial.id, data: payload }),
        ).unwrap();
        toast.success("Fournisseur mis à jour avec succès");
      } else {
        await dispatch(createSupplier(payload)).unwrap();
        toast.success("Fournisseur ajouté avec succès");
      }
      onSuccess();
    } catch (err: any) {
      console.error("Erreur complète :", err);
      toast.error(err?.message || "Erreur lors de l'enregistrement");
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
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-bleu" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">
              {initial ? "Modifier le fournisseur" : "Nouveau fournisseur"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nom <span className="text-rouge">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="ex: Agro Cameroun SARL"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Catégorie
            </label>
            <SelectInput
              value={form.category}
              onChange={(v) => set("category", v)}
              options={Object.entries(categoryLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
              placeholder="contact@fournisseur.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Téléphone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
              placeholder="+237 6XX XXX XXX"
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
            disabled={saving || !form.name?.trim() || !form.category}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-bleu text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm shadow-blue-200"
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

// ── Purchase Form ─────────────────────────────────────────────────────────────
const PurchaseFormModal: React.FC<{
  farmId: number;
  suppliers: Supplier[];
  initial?: Purchase | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, suppliers, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    supplierId: initial?.supplierId ? String(initial.supplierId) : "",
    totalAmount: initial?.totalAmount ?? "",
    taxAmount: initial?.taxAmount ?? "",
    itemName: initial?.itemName || "",
    purchaseDate: initial?.purchaseDate
      ? new Date(initial.purchaseDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    invoiceNumber: initial?.invoiceNumber || "",
    status: initial?.status || PurchaseStatus.PENDING,
    notes: initial?.notes || "",
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vert/40 focus:border-transparent text-sm transition";
  const supplierOptions = suppliers.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const handleSubmit = async () => {
    if (!form.supplierId || !form.totalAmount || !form.purchaseDate) return;
    setSaving(true);
    try {
      const payload: any = {
        farmId,
        supplierId: Number(form.supplierId),
        totalAmount: Number(form.totalAmount),
        taxAmount: form.taxAmount ? Number(form.taxAmount) : undefined,
        itemName: form.itemName?.trim(),
        purchaseDate: form.purchaseDate,
        invoiceNumber: form.invoiceNumber || undefined,
        status: form.status,
        notes: form.notes || undefined,
      };
      if (initial) {
        await dispatch(
          updatePurchase({ id: initial.id, data: payload }),
        ).unwrap();
        toast.success("Achat mis à jour avec succès");
      } else {
        await dispatch(createPurchase(payload)).unwrap();
        toast.success("Achat enregistré avec succès");
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
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ReceiptText className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {initial ? "Modifier l'achat" : "Nouvel achat"}
              </h2>
              <p className="text-xs text-gray-400">
                {initial ? `ID #${initial.id}` : "Remplissez les informations"}
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

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Fournisseur <span className="text-rouge">*</span>
            </label>
            <SelectInput
              value={form.supplierId}
              onChange={(v) => set("supplierId", v)}
              options={supplierOptions}
              placeholder="— choisir un fournisseur —"
            />
            {supplierOptions.length === 0 && (
              <p className="text-[10px] text-jaune font-semibold mt-1.5">
                Aucun fournisseur enregistré. Créez-en un dans l'onglet
                Fournisseurs.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nom de l'article <span className="text-rouge">*</span>
            </label>
            <input
              type="text"
              value={form.itemName || ""}
              onChange={(e) => set("itemName", e.target.value)}
              placeholder="Ex: Concentré de maïs 25kg"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Montant total <span className="text-rouge">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={form.totalAmount}
                onChange={(e) => set("totalAmount", e.target.value)}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Taxes
              </label>
              <input
                type="number"
                step="0.01"
                value={form.taxAmount}
                onChange={(e) => set("taxAmount", e.target.value)}
                className={inputClass}
                placeholder="Optionnel"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Date d'achat <span className="text-rouge">*</span>
              </label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => set("purchaseDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                N° de facture
              </label>
              <input
                type="text"
                value={form.invoiceNumber}
                onChange={(e) => set("invoiceNumber", e.target.value)}
                className={inputClass}
                placeholder="Optionnel"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Statut
            </label>
            <SelectInput
              value={form.status}
              onChange={(v) => set("status", v)}
              options={Object.entries(statusConfig).map(([value, cfg]) => ({
                value,
                label: cfg.label,
              }))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Observations..."
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
            disabled={saving || !form.supplierId || !form.totalAmount}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200"
          >
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : initial ? (
              "Enregistrer"
            ) : (
              "Créer l'achat"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const PurchasesSuppliersDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const purchases = useAppSelector(selectPurchases);
  const suppliers = useAppSelector(selectSuppliers);
  const { loading: purchasesLoading } = useAppSelector(selectPurchaseState);
  const { loading: suppliersLoading } = useAppSelector(selectSupplierState);
  const farmId = currentFarm?.id;

  const [activeTab, setActiveTab] = useState<"purchases" | "suppliers">(
    "purchases",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [deletePurchaseTarget, setDeletePurchaseTarget] =
    useState<Purchase | null>(null);

  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteSupplierTarget, setDeleteSupplierTarget] =
    useState<Supplier | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    if (farmId) dispatch(fetchPurchases({ farmId, limit: 500 }));
    dispatch(fetchSuppliers({ limit: 200 }));
  }, [dispatch, farmId]);

  const refresh = useCallback(() => {
    if (farmId) dispatch(fetchPurchases({ farmId, limit: 500 }));
    dispatch(fetchSuppliers({ limit: 200 }));
    toast.info("Données actualisées");
  }, [dispatch, farmId]);

  const supplierName = (id: number) =>
    suppliers.find((s) => s.id === id)?.name || `Fournisseur #${id}`;

  const handleDeletePurchase = async () => {
    if (!deletePurchaseTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deletePurchase({ id: deletePurchaseTarget.id })).unwrap();
      toast.success("Achat supprimé avec succès");
      setDeletePurchaseTarget(null);
    } catch (err) {
      toast.error("Erreur lors de la suppression");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deleteSupplierTarget?.id) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteSupplier({ id: deleteSupplierTarget.id })).unwrap();
      toast.success("Fournisseur supprimé avec succès");
      setDeleteSupplierTarget(null);
    } catch (err) {
      toast.error("Erreur lors de la suppression");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPurchases = useMemo(() => {
    let list = [...purchases];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p) =>
        [supplierName(p.supplierId), p.itemName, p.invoiceNumber, p.notes].some(
          (v) => v?.toLowerCase().includes(q),
        ),
      );
    }
    if (filterStatus !== "all")
      list = list.filter((p) => p.status === filterStatus);
    list.sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    );
    return list;
  }, [purchases, suppliers, searchTerm, filterStatus]);

 const filteredSuppliers = useMemo(() => {
  const list = Array.isArray(suppliers)
    ? suppliers.filter((s): s is Supplier => !!s && typeof s === "object")
    : [];

  if (!searchTerm.trim()) return list;

  const q = searchTerm.toLowerCase().trim();

  return list.filter((s) =>
    [s.name, s.email, s.phone].some(
      (v) => typeof v === "string" && v.toLowerCase().includes(q),
    ),
  );
}, [suppliers, searchTerm]);

  const totalSpent = purchases
    .filter((p) => p.status === "RECEIVED")
    .reduce((s, p) => s + p.totalAmount, 0);
  const pendingCount = purchases.filter((p) => p.status === "PENDING").length;

  const paginatedPurchases = filteredPurchases.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const totalPagesP = Math.max(
    1,
    Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE),
  );

  const exportCSV = () => {
    if (activeTab === "purchases") {
      const rows = [
        [
          "Date",
          "Fournisseur",
          "Article",
          "Montant",
          "Taxes",
          "Statut",
          "Facture",
          "Notes",
        ],
        ...filteredPurchases.map((p) => [
          fmtDate(p.purchaseDate),
          supplierName(p.supplierId),
          p.itemName || "",
          p.totalAmount,
          p.taxAmount ?? "",
          statusConfig[p.status]?.label,
          p.invoiceNumber || "",
          p.notes || "",
        ]),
      ];
      const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "achats.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const rows = [
        ["Nom", "Catégorie", "Email", "Téléphone"],
        ...filteredSuppliers.map((s) => [
          s.name,
          categoryLabels[s.category] || s.category,
          s.email || "",
          s.phone || "",
        ]),
      ];
      const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fournisseurs.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success("Export CSV téléchargé");
  };

  const isLoading =
    activeTab === "purchases" ? purchasesLoading : suppliersLoading;

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Stocks & Matériel</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">
                Achats & Fournisseurs
              </span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">
              Achats & Fournisseurs
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Gestion des achats et de votre réseau de fournisseurs
            </p>
          </div>
          <div className="flex items-center gap-2">
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
              onClick={() =>
                activeTab === "purchases"
                  ? (setEditingPurchase(null), setShowPurchaseForm(true))
                  : (setEditingSupplier(null), setShowSupplierForm(true))
              }
              className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-semibold text-sm transition shadow-sm ${
                activeTab === "purchases"
                  ? "bg-vert hover:bg-dark_vert shadow-emerald-200"
                  : "bg-bleu hover:opacity-90 shadow-blue-200"
              }`}
            >
              <Plus className="w-4 h-4" />{" "}
              {activeTab === "purchases"
                ? "Nouvel achat"
                : "Nouveau fournisseur"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total achats"
            value={purchases.length}
            sub="enregistrements"
            icon={<ShoppingBag className="w-5 h-5 text-vert" />}
            bg="bg-emerald-50"
          />
          <StatCard
            label="Montant dépensé"
            value={`${fmtNum(totalSpent)} F`}
            sub="achats reçus"
            icon={<ReceiptText className="w-5 h-5 text-vert" />}
            bg="bg-emerald-50"
          />
          <StatCard
            label="En attente"
            value={pendingCount}
            sub="à traiter"
            icon={<ReceiptText className="w-5 h-5 text-jaune" />}
            bg="bg-[#E3BA3E]/10"
          />
          <StatCard
            label="Fournisseurs"
            value={suppliers.length}
            sub="actifs"
            icon={<Building2 className="w-5 h-5 text-bleu" />}
            bg="bg-blue-50"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-1.5 w-full sm:w-fit shadow-sm">
          {(["purchases", "suppliers"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const activeBg = tab === "purchases" ? "bg-vert" : "bg-bleu";
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchTerm("");
                  setPage(1);
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                  isActive
                    ? `${activeBg} text-white shadow-sm`
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab === "purchases" ? (
                  <ShoppingBag className="w-4 h-4" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )}
                {tab === "purchases" ? "Achats" : "Fournisseurs"}
                {tab === "purchases" && purchases.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 rounded-full ${isActive ? "bg-white/20" : "bg-gray-100"}`}
                  >
                    {purchases.length}
                  </span>
                )}
                {tab === "suppliers" && suppliers.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 rounded-full ${isActive ? "bg-white/20" : "bg-gray-100"}`}
                  >
                    {suppliers.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={
                activeTab === "purchases"
                  ? "Rechercher fournisseur, article, facture..."
                  : "Rechercher nom, email, téléphone..."
              }
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className={`w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                activeTab === "purchases"
                  ? "focus:ring-vert/40"
                  : "focus:ring-bleu/40"
              }`}
            />
          </div>
          {activeTab === "purchases" && (
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-vert/40"
            >
              <option value="all">Tous statuts</option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : activeTab === "purchases" ? (
          filteredPurchases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <ShoppingBag className="w-10 h-10 text-gray-200" />
              <p className="font-semibold text-gray-500">Aucun achat trouvé</p>
              <button
                onClick={() => {
                  setEditingPurchase(null);
                  setShowPurchaseForm(true);
                }}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition"
              >
                <Plus className="w-4 h-4" /> Nouvel achat
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-[100px_1fr_160px_110px_110px_100px_90px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Date
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Fournisseur
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Article
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Facture
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Montant
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Statut
                </p>
                <p />
              </div>
              <div className="divide-y divide-gray-50">
                {paginatedPurchases.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[1fr_auto] md:grid-cols-[100px_1fr_160px_110px_110px_100px_90px] gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition items-center group"
                  >
                    <p className="text-xs text-gray-500 hidden md:block">
                      {fmtDate(p.purchaseDate)}
                    </p>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {supplierName(p.supplierId)}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1 md:hidden">
                        <span className="text-xs text-gray-400">
                          {fmtDate(p.purchaseDate)}
                        </span>
                        {p.itemName && (
                          <span className="text-xs text-gray-500">
                            · {p.itemName}
                          </span>
                        )}
                        <span className="text-xs font-bold text-gray-700">
                          {fmtNum(p.totalAmount)} F
                        </span>
                        <span
                          className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-lg ${statusConfig[p.status]?.cls}`}
                        >
                          {statusConfig[p.status]?.label}
                        </span>
                      </div>
                    </div>
                    <p className="hidden md:block text-xs text-gray-600 truncate">
                      {p.itemName || "—"}
                    </p>
                    <p className="hidden md:block text-xs text-gray-500">
                      {p.invoiceNumber || "—"}
                    </p>
                    <p className="hidden md:block text-sm font-bold text-gray-800">
                      {fmtNum(p.totalAmount)} F
                    </p>
                    <div className="hidden md:block">
                      <span
                        className={`inline-flex text-xs font-medium px-2 py-1 rounded-lg ${statusConfig[p.status]?.cls}`}
                      >
                        {statusConfig[p.status]?.label}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1 justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingPurchase(p);
                          setShowPurchaseForm(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700"
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletePurchaseTarget(p)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {(page - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(page * ITEMS_PER_PAGE, filteredPurchases.length)}{" "}
                  sur {filteredPurchases.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPagesP) }, (_, i) => {
                    const pg =
                      totalPagesP <= 5
                        ? i + 1
                        : Math.max(1, Math.min(page - 2, totalPagesP - 4)) + i;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${pg === page ? "bg-vert text-white" : "hover:bg-gray-200 text-gray-600"}`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPagesP, p + 1))}
                    disabled={page === totalPagesP}
                    className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        ) : filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Building2 className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">
              Aucun fournisseur trouvé
            </p>
            <button
              onClick={() => {
                setEditingSupplier(null);
                setShowSupplierForm(true);
              }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-50 text-bleu rounded-xl text-sm font-semibold hover:bg-blue-100 transition"
            >
              <Plus className="w-4 h-4" /> Nouveau fournisseur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSuppliers.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-bleu" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {s.name}
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                        {categoryLabels[s.category] || s.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setEditingSupplier(s);
                        setShowSupplierForm(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteSupplierTarget(s)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                  {s.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {s.email}
                    </span>
                  )}
                  {s.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {s.phone}
                    </span>
                  )}
                  {!s.email && !s.phone && (
                    <span className="text-gray-300">
                      Aucun contact renseigné
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPurchaseForm && farmId && (
        <PurchaseFormModal
          farmId={farmId}
          suppliers={suppliers}
          initial={editingPurchase}
          onClose={() => {
            setShowPurchaseForm(false);
            setEditingPurchase(null);
          }}
          onSuccess={() => {
            setShowPurchaseForm(false);
            setEditingPurchase(null);
            refresh();
          }}
        />
      )}
      {showSupplierForm && (
        <SupplierFormModal
          initial={editingSupplier}
          onClose={() => {
            setShowSupplierForm(false);
            setEditingSupplier(null);
          }}
          onSuccess={() => {
            setShowSupplierForm(false);
            setEditingSupplier(null);
            refresh();
          }}
        />
      )}
      {deletePurchaseTarget && (
        <DeleteModal
          title="Supprimer cet achat ?"
          subtitle={`${supplierName(deletePurchaseTarget.supplierId)} · ${fmtNum(deletePurchaseTarget.totalAmount)} F`}
          onCancel={() => setDeletePurchaseTarget(null)}
          onConfirm={handleDeletePurchase}
          isDeleting={isDeleting}
        />
      )}
      {deleteSupplierTarget && (
        <DeleteModal
          title="Supprimer ce fournisseur ?"
          subtitle={deleteSupplierTarget.name}
          onCancel={() => setDeleteSupplierTarget(null)}
          onConfirm={handleDeleteSupplier}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default PurchasesSuppliersDashboard;