/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search, RefreshCw, ChevronRight, Filter, Download,
  TrendingUp, BarChart3, Calendar, ChevronDown, ChevronUp,
  Plus, Pencil, Trash2, X, DollarSign, ShoppingBag,
  Package, ChevronLeft, User, CreditCard,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getAllSales, createSale, updateSale, deleteSale,
  getSaleItemsBySaleId, createSaleItem, deleteSaleItem,
} from "../../../store/gestionFinanciere/action";
import {
  selectSaleList, selectSaleItemList,
} from "../../../store/gestionFinanciere/slice";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import { getAllLots } from "../../../store/lot/action";
import { getAllAnimals } from "../../../store/animal/action";
import { fetchClients } from "../../../store/Client/action";

import { Sale, SaleItem, PaymentMethod } from "../../../models/gestionFinanciere";
import { Client } from "../../../models/client";
import { LoadingType } from "../../../models/store";

// ── Helpers ───────────────────────────────────────────────────────────────────

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateInput = (d?: string) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";
const fmtCurrency = (n?: number | null) =>
  n != null ? new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n) + " FCFA" : "—";

/**
 * Calcule le total réel d'une vente :
 * - si sale.total > 0 → on l'utilise
 * - sinon → on somme les saleItems embarquées
 */
const getSaleTotal = (sale: Sale): number => {
  if (sale.total && sale.total > 0) return sale.total;
  const items = (sale as any).saleItems as SaleItem[] | undefined;
  if (items && items.length > 0) {
    return items.reduce((acc, i) => acc + (Number(i.totalPrice) || 0), 0);
  }
  return 0;
};

/**
 * Extrait les SaleItems embarquées dans un objet Sale.
 */
const getEmbeddedItems = (sale: Sale): SaleItem[] => {
  const items = (sale as any).saleItems;
  if (Array.isArray(items)) return items;
  if (items && typeof items === "object") return [items];
  return [];
};

// ── Label maps ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  COMPLETED: { label: "Complétée", cls: "bg-emerald-50 text-vert border-emerald-100" },
  PENDING:   { label: "En attente", cls: "bg-yellow-50 text-jaune border-yellow-100" },
  CANCELLED: { label: "Annulée",   cls: "bg-red-50 text-rouge border-red-100" },
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.cash]:         "Espèces",
  [PaymentMethod.card]:         "Carte bancaire",
  [PaymentMethod.mobile_money]: "Mobile Money",
  [PaymentMethod.orange_money]: "Orange Money",
  [PaymentMethod.paypal]:       "PayPal",
  [PaymentMethod.others]:       "Autre",
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: string; sub?: string;
  icon: React.ReactNode; bg: string;
}> = ({ label, value, sub, icon, bg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-lg font-black text-gray-900 leading-tight truncate">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Delete Modal ──────────────────────────────────────────────────────────────

const DeleteModal: React.FC<{
  sale: Sale; onCancel: () => void; onConfirm: () => void; isDeleting: boolean;
}> = ({ sale, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-rouge" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Supprimer cette vente ?</h3>
          <p className="text-sm text-gray-500">Vente #{sale.id} · {fmtCurrency(getSaleTotal(sale))}</p>
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

// ── Sale Items Panel ──────────────────────────────────────────────────────────

const SaleItemsPanel: React.FC<{
  sale: Sale;
  items: SaleItem[];
  lots: any[];
  animals: any[];
  loadingItems: boolean;
  onClose: () => void;
  onAddItem: (item: Partial<SaleItem>) => Promise<void>;
  onDeleteItem: (id: number) => Promise<void>;
}> = ({ sale, items, lots, animals, loadingItems, onClose, onAddItem, onDeleteItem }) => {
  const [form, setForm] = useState({
    productName: "", description: "", quantity: "", unitPrice: "", lotId: "", animalId: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const subtotal = useMemo(
    () => (parseFloat(form.quantity) || 0) * (parseFloat(form.unitPrice) || 0),
    [form.quantity, form.unitPrice]
  );
  const itemsTotal = useMemo(
    () => (Array.isArray(items) ? items : []).reduce((a, i) => a + (Number(i?.totalPrice) || 0), 0),
    [items]
  );

  const handleAdd = async () => {
    if (!form.productName || !form.quantity || !form.unitPrice) return;
    setSaving(true);
    try {
      await onAddItem({
        saleId: sale.id!,
        productName: form.productName,
        description: form.description || undefined,
        quantity: parseFloat(form.quantity),
        unitPrice: parseFloat(form.unitPrice),
        totalPrice: subtotal,
        lotId: form.lotId ? parseInt(form.lotId) : undefined,
        animalId: form.animalId ? parseInt(form.animalId) : undefined,
      });
      setForm({ productName: "", description: "", quantity: "", unitPrice: "", lotId: "", animalId: "" });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm transition";

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Articles — Vente #{sale.id}</h2>
              <p className="text-xs text-gray-400">{fmtDate(sale.date)} · {PAYMENT_LABELS[sale.paymentMethod]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">

          {/* Form ajout article */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ajouter un article</p>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Produit *</label>
              <input type="text" value={form.productName} onChange={(e) => set("productName", e.target.value)}
                className={inputClass} placeholder="Ex : Poulet de chair..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Description</label>
              <input type="text" value={form.description} onChange={(e) => set("description", e.target.value)}
                className={inputClass} placeholder="Détails optionnels..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Quantité *</label>
                <input type="number" step="0.01" min="0" value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Prix unitaire *</label>
                <div className="relative">
                  <input type="number" step="1" min="0" value={form.unitPrice}
                    onChange={(e) => set("unitPrice", e.target.value)} className={inputClass} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">FCFA</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Lot</label>
                <select value={form.lotId} onChange={(e) => set("lotId", e.target.value)} className={inputClass}>
                  <option value="">— aucun —</option>
                  {lots.map((l) => <option key={l.id} value={l.id}>{l.name ?? `Lot #${l.id}`}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Animal</label>
                <select value={form.animalId} onChange={(e) => set("animalId", e.target.value)} className={inputClass}>
                  <option value="">— aucun —</option>
                  {animals.map((a) => <option key={a.id} value={a.id}>{a.name ?? `Animal #${a.id}`}</option>)}
                </select>
              </div>
            </div>
            {subtotal > 0 && (
              <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
                <span className="text-xs font-semibold text-gray-600">Sous-total</span>
                <span className="text-sm font-black text-vert">{fmtCurrency(subtotal)}</span>
              </div>
            )}
            <button onClick={handleAdd}
              disabled={saving || !form.productName || !form.quantity || !form.unitPrice}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-vert text-white hover:bg-dark_vert disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Spinner /> Ajout…</> : <><Plus className="w-4 h-4" /> Ajouter l'article</>}
            </button>
          </div>

          {/* Liste des articles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Articles ({Array.isArray(items) ? items.length : 0})
              </p>
              {Array.isArray(items) && items.length > 0 && (
                <p className="text-xs font-black text-gray-700">
                  Total : <span className="text-vert">{fmtCurrency(itemsTotal)}</span>
                </p>
              )}
            </div>
            {loadingItems ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : !Array.isArray(items) || items.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                Aucun article pour cette vente
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={item.id ?? idx}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">
                        {item.quantity} × {fmtCurrency(item.unitPrice)}
                        {item.description && <span className="ml-2 text-gray-300">· {item.description}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span className="text-sm font-black text-gray-800">{fmtCurrency(item.totalPrice)}</span>
                      <button onClick={() => item.id && onDeleteItem(item.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-rouge transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sale Form Modal ───────────────────────────────────────────────────────────

interface DraftItem {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  lotId?: number;
  animalId?: number;
}

const SaleFormModal: React.FC<{
  farmId: number;
  initial?: Sale | null;
  clients: Client[];
  lots: any[];
  animals: any[];
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}> = ({ farmId, initial, clients, lots, animals, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date: fmtDateInput(initial?.date) || new Date().toISOString().slice(0, 10),
    status: initial?.status ?? "COMPLETED",
    paymentMethod: initial?.paymentMethod ?? PaymentMethod.cash,
    clientId: initial?.clientId ? String(initial.clientId) : "",
    notes: initial?.notes ?? "",
    totalOverride: initial?.total ? String(getSaleTotal(initial)) : "",
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  // Articles (création uniquement)
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [itemForm, setItemForm] = useState({
    productName: "", description: "", quantity: "", unitPrice: "", lotId: "", animalId: "",
  });
  const setItem = (k: string, v: any) => setItemForm((p) => ({ ...p, [k]: v }));

  const subtotal = useMemo(
    () => (parseFloat(itemForm.quantity) || 0) * (parseFloat(itemForm.unitPrice) || 0),
    [itemForm.quantity, itemForm.unitPrice]
  );
  const itemsTotal = useMemo(
    () => draftItems.reduce((a, i) => a + i.totalPrice, 0),
    [draftItems]
  );

  const [totalManual, setTotalManual] = useState(false);
  useEffect(() => {
    if (!isEdit && !totalManual && itemsTotal > 0) {
      set("totalOverride", String(itemsTotal));
    }
  }, [itemsTotal, isEdit, totalManual]);

  const addDraftItem = () => {
    if (!itemForm.productName || !itemForm.quantity || !itemForm.unitPrice) return;
    setDraftItems((p) => [...p, {
      id: crypto.randomUUID(),
      productName: itemForm.productName,
      description: itemForm.description,
      quantity: parseFloat(itemForm.quantity),
      unitPrice: parseFloat(itemForm.unitPrice),
      totalPrice: subtotal,
      lotId: itemForm.lotId ? parseInt(itemForm.lotId) : undefined,
      animalId: itemForm.animalId ? parseInt(itemForm.animalId) : undefined,
    }]);
    setItemForm({ productName: "", description: "", quantity: "", unitPrice: "", lotId: "", animalId: "" });
  };

  const removeDraftItem = (id: string) => setDraftItems((p) => p.filter((i) => i.id !== id));

  const handleSubmit = async () => {
    if (!form.date) return;
    const totalValue = parseFloat(form.totalOverride);
    if (!isEdit && (!totalValue || totalValue <= 0)) {
      toast.error("Veuillez saisir un total valide");
      return;
    }
    setSaving(true);
    try {
      const salePayload: Partial<Sale> = {
        farmId,
        date: form.date,
        status: form.status as Sale["status"],
        paymentMethod: form.paymentMethod as PaymentMethod,
        clientId: form.clientId ? parseInt(form.clientId) : undefined,
        notes: form.notes || undefined,
        total: totalValue || undefined,
      };

      let savedSale: Sale;
      if (isEdit) {
        const res = await dispatch(updateSale({ id: initial!.id!, data: salePayload })).unwrap();
        savedSale = (res as any).data ?? res;
        toast.success("Vente mise à jour");
      } else {
        const res = await dispatch(createSale(salePayload)).unwrap();
        savedSale = (res as any).data ?? res;
        if (draftItems.length > 0) {
          await Promise.all(
            draftItems.map((item) =>
              dispatch(createSaleItem({
                saleId: savedSale.id!,
                productName: item.productName,
                description: item.description || undefined,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                lotId: item.lotId,
                animalId: item.animalId,
              } as Partial<SaleItem>)).unwrap()
            )
          );
          toast.success("Vente et articles créés");
        } else {
          toast.success("Vente créée");
        }
      }
      onSuccess(savedSale);
    } catch (err: any) {
      toast.error(err?.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm transition";
  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col border border-gray-100 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {isEdit ? "Modifier la vente" : "Nouvelle vente"}
              </h2>
              <p className="text-xs text-gray-400">
                {isEdit ? `ID #${initial!.id}` : "Informations + articles"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* Infos vente */}
          <div>
            <label className={labelClass}>Date <span className="text-rouge">*</span></label>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Statut</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
                <option value="COMPLETED">Complétée</option>
                <option value="PENDING">En attente</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Paiement</span>
              </label>
              <select value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)} className={inputClass}>
                {Object.entries(PAYMENT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> Client</span>
            </label>
            <select value={form.clientId} onChange={(e) => set("clientId", e.target.value)} className={inputClass}>
              <option value="">— Aucun client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ""}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className={`${inputClass} resize-none`} placeholder="Remarques…" />
          </div>

          {/* Articles (création uniquement) */}
          {!isEdit && (
            <>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Articles</p>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">Produit</label>
                    <input type="text" value={itemForm.productName}
                      onChange={(e) => setItem("productName", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm transition"
                      placeholder="Ex : Poulet de chair..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">Description</label>
                    <input type="text" value={itemForm.description}
                      onChange={(e) => setItem("description", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm transition"
                      placeholder="Optionnel..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1">Quantité</label>
                      <input type="number" step="0.01" min="0" value={itemForm.quantity}
                        onChange={(e) => setItem("quantity", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm transition" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1">Prix unitaire</label>
                      <div className="relative">
                        <input type="number" step="1" min="0" value={itemForm.unitPrice}
                          onChange={(e) => setItem("unitPrice", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm transition" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">FCFA</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1">Lot</label>
                      <select value={itemForm.lotId} onChange={(e) => setItem("lotId", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition">
                        <option value="">— aucun —</option>
                        {lots.map((l) => <option key={l.id} value={l.id}>{l.name ?? `Lot #${l.id}`}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1">Animal</label>
                      <select value={itemForm.animalId} onChange={(e) => setItem("animalId", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition">
                        <option value="">— aucun —</option>
                        {animals.map((a) => <option key={a.id} value={a.id}>{a.name ?? `Animal #${a.id}`}</option>)}
                      </select>
                    </div>
                  </div>
                  {subtotal > 0 && (
                    <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
                      <span className="text-xs font-semibold text-gray-600">Sous-total</span>
                      <span className="text-sm font-black text-vert">{fmtCurrency(subtotal)}</span>
                    </div>
                  )}
                  <button onClick={addDraftItem}
                    disabled={!itemForm.productName || !itemForm.quantity || !itemForm.unitPrice}
                    className="w-full py-2 rounded-xl text-sm font-semibold bg-vert text-white hover:bg-dark_vert disabled:opacity-40 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>

                {draftItems.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {draftItems.map((item) => (
                      <div key={item.id}
                        className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.productName}</p>
                          <p className="text-xs text-gray-400">{item.quantity} × {fmtCurrency(item.unitPrice)}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <span className="text-sm font-black text-gray-800">{fmtCurrency(item.totalPrice)}</span>
                          <button onClick={() => removeDraftItem(item.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-rouge transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-gray-100 pt-4">
                <label className={labelClass}>Total de la vente <span className="text-rouge">*</span></label>
                <div className="relative">
                  <input type="number" step="1" min="0" value={form.totalOverride}
                    onChange={(e) => { set("totalOverride", e.target.value); setTotalManual(true); }}
                    className={`${inputClass} font-semibold`}
                    placeholder="Montant total…" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">FCFA</span>
                </div>
                {itemsTotal > 0 && parseFloat(form.totalOverride) !== itemsTotal && (
                  <p className="text-[11px] text-amber-500 mt-1 font-semibold">
                    Total articles : {fmtCurrency(itemsTotal)} — vous pouvez ajuster si nécessaire (remise, frais…)
                  </p>
                )}
              </div>
            </>
          )}

          {/* Total en édition */}
          {isEdit && (
            <div>
              <label className={labelClass}>Total</label>
              <div className="relative">
                <input type="number" step="1" min="0" value={form.totalOverride}
                  onChange={(e) => set("totalOverride", e.target.value)}
                  className={`${inputClass} font-semibold`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">FCFA</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
            Annuler
          </button>
          <button onClick={handleSubmit}
            disabled={saving || !form.date || (!isEdit && (!form.totalOverride || parseFloat(form.totalOverride) <= 0))}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200">
            {saving ? <><Spinner /> Enregistrement…</> : isEdit ? "Enregistrer" : "Créer la vente"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Sort Column ───────────────────────────────────────────────────────────────

type SortKey = "date" | "total";

const ColHeader: React.FC<{
  label: string; colKey: SortKey; current: SortKey; dir: "asc" | "desc"; onSort: (k: SortKey) => void;
}> = ({ label, colKey, current, dir, onSort }) => (
  <button onClick={() => onSort(colKey)}
    className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition">
    {label}
    {current === colKey
      ? dir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3 opacity-20" />}
  </button>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

const SalesDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const saleState = useAppSelector(selectSaleList);
  const saleItemState = useAppSelector(selectSaleItemList);
  const clientsRaw = useAppSelector((s: any) => s.client?.list?.entities ?? []);
  const farmId = currentFarm?.id;

  const sales: Sale[] = (saleState.entities as Sale[] | null) ?? [];
  const clients: Client[] = Array.isArray(clientsRaw) ? clientsRaw : [];
  const isLoading = saleState.status === LoadingType.PENDING;
  const loadingItems = saleItemState.status === LoadingType.PENDING;

  const lotsRaw = useAppSelector((s: any) => s.lot?.entities ?? []);
  const animalsRaw = useAppSelector((s: any) => s.animal?.animalist?.entities);
  const lots: any[] = Array.isArray(lotsRaw) ? lotsRaw : [];
  const animals: any[] = Array.isArray(animalsRaw) ? animalsRaw : [];

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailSale, setDetailSale] = useState<Sale | null>(null);

  const fetchData = useCallback(() => {
    if (farmId) dispatch(getAllSales({ farmId, limit: 500, page: 1 }));
  }, [dispatch, farmId]);

  useEffect(() => {
    if (!farmId) dispatch(getUserFarms());
    else {
      fetchData();
      dispatch(getAllLots({ farmId, limit: 100 }));
      dispatch(getAllAnimals({ farmId, limit: 200, page: 1 }));
      dispatch(fetchClients({ farmId }));
    }
  }, [farmId, fetchData, dispatch]);

  /**
   * Ouvre le panel articles.
   * Priorité : saleItems embarquées dans l'objet Sale (déjà dans getAllSales).
   * Fallback : appel réseau séparé si absent.
   */
  const openDetail = useCallback((sale: Sale) => {
    setDetailSale(sale);
    const embedded = getEmbeddedItems(sale);
    if (embedded.length === 0 && sale.id) {
      dispatch(getSaleItemsBySaleId(sale.id));
    }
  }, [dispatch]);

  /**
   * Items du panel courant :
   * - Si la vente a des items embarquées → on les utilise directement
   * - Sinon → on prend ce que le store a chargé via getSaleItemsBySaleId
   */
  const detailSaleItems: SaleItem[] = useMemo(() => {
    if (!detailSale) return [];
    const embedded = getEmbeddedItems(detailSale);
    if (embedded.length > 0) return embedded;
    // Fallback store (getSaleItemsBySaleId)
    const stored = saleItemState.entities as SaleItem[] | null;
    if (Array.isArray(stored)) return stored.filter((i) => i.saleId === detailSale.id);
    if (stored && typeof stored === "object" && !Array.isArray(stored)) return [(stored as any)].filter((i) => i.saleId === detailSale.id);
    return [];
  }, [detailSale, saleItemState.entities]);

  const refresh = useCallback(() => {
    fetchData();
    toast.info("Données actualisées");
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteSale(deleteTarget.id!)).unwrap();
      toast.success("Vente supprimée");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddItem = async (item: Partial<SaleItem>) => {
    await dispatch(createSaleItem(item)).unwrap();
    toast.success("Article ajouté");
    // Recharger toutes les ventes pour avoir les items embarquées à jour
    fetchData();
    // Mettre à jour le detailSale depuis le store rechargé
    if (detailSale?.id) dispatch(getSaleItemsBySaleId(detailSale.id));
  };

  const handleDeleteItem = async (id: number) => {
    await dispatch(deleteSaleItem(id)).unwrap();
    toast.success("Article supprimé");
    fetchData();
    if (detailSale?.id) dispatch(getSaleItemsBySaleId(detailSale.id));
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...sales];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((s) =>
        [String(s.id), s.notes, clients.find((c) => c.id === s.clientId)?.name]
          .some((v) => v?.toLowerCase().includes(q))
      );
    }
    if (dateFrom) list = list.filter((s) => s.date >= dateFrom);
    if (dateTo) list = list.filter((s) => s.date <= dateTo);
    if (statusFilter) list = list.filter((s) => s.status === statusFilter);
    list.sort((a, b) => {
      const aVal = sortKey === "total" ? getSaleTotal(a) : (a.date ?? "");
      const bVal = sortKey === "total" ? getSaleTotal(b) : (b.date ?? "");
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [sales, searchTerm, dateFrom, dateTo, statusFilter, sortKey, sortDir, clients]);

  const stats = useMemo(() => {
    const completedSales = sales.filter((s) => s.status === "COMPLETED");
    const total = completedSales.reduce((acc, s) => acc + getSaleTotal(s), 0);
    const thisMonth = completedSales.filter((s) => {
      const d = new Date(s.date); const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((acc, s) => acc + getSaleTotal(s), 0);
    const avg = completedSales.length > 0 ? total / completedSales.length : 0;
    const lastSale = [...sales].sort((a, b) => ((b.date ?? "") > (a.date ?? "") ? 1 : -1))[0];
    return { total, thisMonth, avg, count: sales.length, lastSale };
  }, [sales]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const activeFilters = [!!dateFrom, !!dateTo, !!searchTerm, !!statusFilter].filter(Boolean).length;

  const exportCSV = () => {
    const rows = [
      ["ID", "Date", "Statut", "Paiement", "Client", "Total", "Notes"],
      ...filtered.map((s) => [
        s.id, s.date, s.status, PAYMENT_LABELS[s.paymentMethod],
        clients.find((c) => c.id === s.clientId)?.name ?? "",
        getSaleTotal(s), s.notes ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ventes.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false}
        newestOnTop closeOnClick pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium" />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Finance & Ventes</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Ventes & Produits</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Ventes & Produits</h1>
            <p className="text-sm text-gray-400 mt-0.5">Suivi de toutes vos ventes et revenus</p>
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
              className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition shadow-sm shadow-emerald-200">
              <Plus className="w-4 h-4" /> Nouvelle vente
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Chiffre d'affaires" value={fmtCurrency(stats.total)}
            sub={`${stats.count} ventes au total`}
            icon={<TrendingUp className="w-5 h-5 text-vert" />} bg="bg-emerald-50" />
          <StatCard label="Ce mois-ci" value={fmtCurrency(stats.thisMonth)} sub="ventes complétées"
            icon={<Calendar className="w-5 h-5 text-bleu" />} bg="bg-blue-50" />
          <StatCard label="Vente moyenne" value={fmtCurrency(stats.avg)} sub="par transaction complétée"
            icon={<BarChart3 className="w-5 h-5 text-jaune" />} bg="bg-yellow-50" />
          <StatCard label="Dernière vente"
            value={stats.lastSale ? fmtDate(stats.lastSale.date) : "—"}
            sub={stats.lastSale ? fmtCurrency(getSaleTotal(stats.lastSale)) : ""}
            icon={<ShoppingBag className="w-5 h-5 text-purple-500" />} bg="bg-purple-50" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Rechercher par ID, client, notes…"
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition" />
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
          <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
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
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Statut</label>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="">Tous les statuts</option>
                <option value="COMPLETED">Complétées</option>
                <option value="PENDING">En attente</option>
                <option value="CANCELLED">Annulées</option>
              </select>
            </div>
          </div>
        )}

        {activeFilters > 0 && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
            <p className="text-xs font-semibold text-vert">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""} · Total : {fmtCurrency(filtered.reduce((s, v) => s + getSaleTotal(v), 0))}
            </p>
            <button onClick={() => { setSearchTerm(""); setDateFrom(""); setDateTo(""); setStatusFilter(""); setPage(1); }}
              className="text-xs font-bold text-vert hover:underline">Réinitialiser</button>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" /><span className="text-sm">Chargement…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <DollarSign className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">Aucune vente trouvée</p>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition">
              <Plus className="w-4 h-4" /> Nouvelle vente
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* En-têtes colonnes */}
            <div className="hidden md:grid grid-cols-[80px_110px_130px_100px_1fr_130px_100px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ID</p>
              <ColHeader label="Date" colKey="date" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Total" colKey="total" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client / Notes</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Articles</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider"></p>
            </div>

            <div className="divide-y divide-gray-50">
              {paginated.map((s) => {
                const clientName = clients.find((c) => c.id === s.clientId)?.name;
                const statusInfo = STATUS_LABELS[s.status] ?? STATUS_LABELS.COMPLETED;
                const saleTotal = getSaleTotal(s);
                const embeddedCount = getEmbeddedItems(s).length;
                return (
                  <div key={s.id}
                    className="grid grid-cols-[1fr_auto] md:grid-cols-[80px_110px_130px_100px_1fr_130px_100px] gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition items-center">
                    <p className="text-xs font-mono font-semibold text-gray-500">#{s.id}</p>
                    <p className="hidden md:block text-xs text-gray-500">{fmtDate(s.date)}</p>
                    <p className="hidden md:block text-sm font-black text-gray-800">{fmtCurrency(saleTotal)}</p>
                    <div className="hidden md:block">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="hidden md:block min-w-0">
                      {clientName && (
                        <p className="text-xs font-semibold text-gray-700 flex items-center gap-1 truncate">
                          <User className="w-3 h-3 flex-shrink-0 text-gray-400" />{clientName}
                        </p>
                      )}
                      {s.notes && <p className="text-xs text-gray-400 truncate">{s.notes}</p>}
                      {!clientName && !s.notes && <span className="text-gray-300 text-xs">—</span>}
                    </div>
                    <div className="hidden md:block">
                      <button onClick={() => openDetail(s)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-vert bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition">
                        <Package className="w-3.5 h-3.5" />
                        Voir articles{embeddedCount > 0 ? ` (${embeddedCount})` : ""}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 justify-end" onClick={(ev) => ev.stopPropagation()}>
                      <button onClick={() => { setEditingItem(s); setShowForm(true); }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(s)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition">
                  <ChevronLeft className="w-4 h-4" />
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
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && farmId && (
        <SaleFormModal
          farmId={farmId}
          initial={editingItem}
          clients={clients}
          lots={lots}
          animals={animals}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSuccess={() => {
            setShowForm(false);
            setEditingItem(null);
            fetchData();
          }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          sale={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
      {detailSale && (
        <SaleItemsPanel
          sale={detailSale}
          items={detailSaleItems}
          lots={lots}
          animals={animals}
          loadingItems={loadingItems && detailSaleItems.length === 0}
          onClose={() => setDetailSale(null)}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
        />
      )}
    </>
  );
};

export default SalesDashboard;