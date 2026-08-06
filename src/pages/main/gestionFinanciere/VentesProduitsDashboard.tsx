/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search, RefreshCw, ChevronRight, Filter, Download,
  ShoppingCart, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp,
  CreditCard, Smartphone, Wallet, Banknote, Package2, CheckCircle2,
  Clock, XCircle, User as UserIcon, Sparkles,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingType } from "../../../models/store";

import {
  getAllSales, createSale, updateSale, deleteSale,
  getSaleItemsBySaleId, createSaleItem, updateSaleItem, deleteSaleItem,
} from "../../../store/gestionFinanciere/action";
import { selectSaleList } from "../../../store/gestionFinanciere/slice";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { PaymentMethod, SaleStatus, ProductCategory } from "../../../models/gestionFinanciere";
import SelectInput from "../../../components/UI/SelectInput";

// ── Clients ──
import { fetchClients } from "../../../store/Client/action";
import type { Client } from "../../../models/client";

// ── Productions / Lots / Animaux (pour rattacher un article de vente) ──
import { fetchProductions } from "../../../store/production/action";
import { selectProductions } from "../../../features/productions/productionSelectors";
import { getAllLots } from "../../../store/lot/action";
import { getAllAnimals } from "../../../store/animal/action";
import type { FecthLot } from "../../../models/lot";



const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtDate = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtMoney = (n?: number | null) =>
  n != null ? `${Number(n).toLocaleString("fr-FR")} FCFA` : "—";

const fmtNum = (n?: number | null, dec = 1) =>
  n != null ? Number(n).toFixed(dec).replace(".", ",") : "—";

const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  [SaleStatus.PENDING]:   { label: "En attente",  cls: "bg-amber-50 text-amber-600 border border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  [SaleStatus.COMPLETED]: { label: "Complétée",   cls: "bg-emerald-50 text-vert border border-emerald-200",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  [SaleStatus.CANCELLED]: { label: "Annulée",     cls: "bg-red-50 text-rouge border border-red-200",         icon: <XCircle className="w-3.5 h-3.5" /> },
};

const paymentConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  [PaymentMethod.card]:         { label: "Carte",         icon: <CreditCard className="w-3.5 h-3.5" /> },
  [PaymentMethod.mobile_money]: { label: "Mobile Money",  icon: <Smartphone className="w-3.5 h-3.5" /> },
  [PaymentMethod.orange_money]: { label: "Orange Money",  icon: <Smartphone className="w-3.5 h-3.5" /> },
  [PaymentMethod.paypal]:       { label: "PayPal",        icon: <Wallet className="w-3.5 h-3.5" /> },
  [PaymentMethod.cash]:         { label: "Espèces",       icon: <Banknote className="w-3.5 h-3.5" /> },
  [PaymentMethod.others]:       { label: "Autre",         icon: <Wallet className="w-3.5 h-3.5" /> },
};

// ── Stat Card ─────────────────────────────────────────────────────────────
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

// ── Delete Modal ─────────────────────────────────────────────────────────
const DeleteModal: React.FC<{ sale: any; onCancel: () => void; onConfirm: () => void; isDeleting: boolean }> =
  ({ sale, onCancel, onConfirm, isDeleting }) => (
    <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Supprimer cette vente ?</h3>
            <p className="text-sm text-gray-500">{sale.client?.name || `Vente #${sale.id}`} · {fmtMoney(sale.total)}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
          Les lignes de vente associées seront également supprimées. <strong>Irréversible</strong>.
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

// ── Sale Item Row (form) ────────────────────────────────────────────────
type Origin = "none" | "lot" | "animal";

type ItemRow = {
  rowId: string;          // clé locale stable
  id?: number;            // présent si l'item existe déjà côté serveur
  productionId?: string;  // référence vers une production existante (optionnel)
  productName: string;
  category: string;       // ProductCategory
  unit: string;
  quantity: any;
  unitPrice: any;
  discount: any;
  origin: Origin;         // un article est rattaché à un lot OU un animal, jamais les deux
  lotId?: string;
  animalId?: string;
  notes: string;
};

const emptyRow = (): ItemRow => ({
  rowId: Math.random().toString(36).slice(2),
  productionId: undefined,
  productName: "", category: ProductCategory.Product, unit: "kg", quantity: "", unitPrice: "", discount: "0",
  origin: "none", lotId: undefined, animalId: undefined, notes: "",
});

const rowTotal = (r: ItemRow) => {
  const q = Number(r.quantity) || 0;
  const p = Number(r.unitPrice) || 0;
  const d = Number(r.discount) || 0;
  return Math.max(0, q * p - d);
};

// ── Form Modal ────────────────────────────────────────────────────────────
const SaleFormModal: React.FC<{
  farmId: number;
  clients: Client[];
  productions: any[];
  lots: FecthLot[];
  animals: any[];
  initial?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, clients, productions, lots, animals, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [loadingItems, setLoadingItems] = useState(!!initial);

  const [form, setForm] = useState({
    date: initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    clientId: initial?.clientId ? String(initial.clientId) : "",
    status: initial?.status || SaleStatus.PENDING,
    paymentMethod: initial?.paymentMethod || PaymentMethod.cash,
    notes: initial?.notes || "",
  });
  const [items, setItems] = useState<ItemRow[]>([emptyRow()]);
  const [deletedItemIds, setDeletedItemIds] = useState<number[]>([]);

  const set = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));
  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";
  const smallInput = "w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed";

  const clientOptions = clients.map((c) => ({ value: String(c.id), label: c.name }));
  const productionOptions = [
    { value: "", label: "— Produit non enregistré (saisie libre) —" },
    ...productions.map((p: any) => ({
      value: String(p.id),
      label: `${p.type} · ${fmtNum(p.quantity, 1)} ${p.unit} · ${fmtDate(p.date)}`,
    })),
  ];
  const lotOptions = lots.map((l: any) => ({ value: String(l.id), label: l.name ?? `Lot #${l.id}` }));
  const animalOptions = animals.map((a: any) => ({ value: String(a.id), label: a.name ?? `Animal #${a.id}` }));

  // Charge les items existants en édition
  useEffect(() => {
    if (!initial) return;
    setLoadingItems(true);
    dispatch(getSaleItemsBySaleId(initial.id))
      .unwrap()
      .then((res: any) => {
        const data = res?.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          setItems(data.map((it: any) => ({
            rowId: Math.random().toString(36).slice(2),
            id: it.id,
            productionId: it.productionId ? String(it.productionId) : undefined,
            productName: it.productName ?? "",
            category: it.category ?? ProductCategory.Product,
            unit: it.unit ?? "",
            quantity: it.quantity ?? "",
            unitPrice: it.unitPrice ?? "",
            discount: it.discount ?? "0",
            origin: it.lotId ? "lot" : it.animalId ? "animal" : "none",
            lotId: it.lotId ? String(it.lotId) : undefined,
            animalId: it.animalId ? String(it.animalId) : undefined,
            notes: it.notes ?? "",
          })));
        }
      })
      .catch(() => toast.error("Impossible de charger les articles de cette vente"))
      .finally(() => setLoadingItems(false));
  }, [initial, dispatch]);

  const setItem = (rowId: string, key: keyof ItemRow, value: any) =>
    setItems((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, [key]: value } : r)));

  const selectProduction = (rowId: string, prodId: string | number) => {
    const prodIdStr = String(prodId);

    if (!prodIdStr) {
      setItems((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, productionId: undefined } : r)));
      return;
    }

    const prod = productions.find((p: any) => String(p.id) === prodIdStr);
    setItems((prev) => prev.map((r) => (r.rowId === rowId ? {
      ...r,
      productionId: prodIdStr,
      productName: prod?.type ?? r.productName,
      category: prod?.category ?? r.category,
      unit: prod?.unit ?? r.unit,
    } : r)));
  };

  // Origine exclusive : lot OU animal
  const setOrigin = (rowId: string, origin: Origin) =>
    setItems((prev) => prev.map((r) => (r.rowId === rowId ? {
      ...r,
      origin,
      lotId: origin === "lot" ? r.lotId : undefined,
      animalId: origin === "animal" ? r.animalId : undefined,
    } : r)));

  const addRow = () => setItems((prev) => [...prev, emptyRow()]);

  const removeRow = (rowId: string) => {
    const target = items.find((r) => r.rowId === rowId);
    if (target?.id) setDeletedItemIds((prev) => [...prev, target.id!]);
    setItems((prev) => prev.filter((r) => r.rowId !== rowId));
  };

  const totalAmount = useMemo(() => items.reduce((s, r) => s + rowTotal(r), 0), [items]);

  const validItems = items.filter((r) => r.productName && r.quantity && r.unitPrice);

  const buildItemPayload = (it: ItemRow) => ({
    productName: it.productName,
    category: it.category as any,
    unit: it.unit,
    quantity: Number(it.quantity),
    unitPrice: Number(it.unitPrice),
    discount: Number(it.discount) || 0,
    totalPrice: rowTotal(it),
    productionId: it.productionId ? Number(it.productionId) : undefined,
    lotId: it.origin === "lot" && it.lotId ? Number(it.lotId) : undefined,
    animalId: it.origin === "animal" && it.animalId ? Number(it.animalId) : undefined,
    notes: it.notes || undefined,
  });

  const handleSubmit = async () => {
    if (!form.date || validItems.length === 0) return;
    setSaving(true);
    try {
      if (initial) {
        await dispatch(updateSale({
          id: initial.id,
          data: {
            date: form.date,
            clientId: form.clientId ? Number(form.clientId) : undefined,
            status: form.status,
            paymentMethod: form.paymentMethod,
            notes: form.notes || undefined,
            total: totalAmount,
          } as any,
        })).unwrap();

        for (const it of items) {
          if (!it.productName || !it.quantity || !it.unitPrice) continue;
          const payload = buildItemPayload(it);
          if (it.id) {
            await dispatch(updateSaleItem({ id: it.id, data: payload as any })).unwrap();
          } else {
            await dispatch(createSaleItem({ ...payload, saleId: initial.id } as any)).unwrap();
          }
        }
        for (const id of deletedItemIds) {
          await dispatch(deleteSaleItem(id)).unwrap();
        }
        toast.success("Vente mise à jour avec succès");
      } else {
        const created = await dispatch(createSale({
          farmId,
          date: form.date,
          clientId: form.clientId ? Number(form.clientId) : undefined,
          status: form.status,
          paymentMethod: form.paymentMethod,
          notes: form.notes || undefined,
          total: totalAmount,
        } as any)).unwrap();

        const saleId = (created as any)?.data?.id;
        if (!saleId) throw new Error("ID de vente introuvable après création");

        for (const it of validItems) {
          await dispatch(createSaleItem({
            ...buildItemPayload(it),
            saleId,
          } as any)).unwrap();
        }
        toast.success("Vente enregistrée avec succès");
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
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[92vh] flex flex-col border border-gray-100" onClick={(e) => e.stopPropagation()}>

        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">{initial ? "Modifier la vente" : "Nouvelle vente"}</h2>
              <p className="text-xs text-gray-400">{initial ? `ID #${initial.id}` : "Client, statut, articles"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Date <span className="text-red-400">*</span>
              </label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> Client</span>
              </label>
              <SelectInput value={form.clientId} onChange={(v) => set("clientId", v)}
                options={[{ value: "", label: "— Vente sans client —" }, ...clientOptions]} />
              {clientOptions.length === 0 && (
                <p className="text-[10px] text-orange-500 font-semibold mt-1">Aucun client enregistré pour cette ferme.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Statut</label>
              <div className="flex gap-1.5">
                {Object.values(SaleStatus).map((s) => (
                  <button key={s} type="button" onClick={() => set("status", s)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold border transition ${
                      form.status === s ? "bg-vert text-white border-vert" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}>
                    {statusConfig[s]?.icon} {statusConfig[s]?.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Paiement</label>
              <SelectInput value={form.paymentMethod} onChange={(v) => set("paymentMethod", v)}
                options={Object.values(PaymentMethod).map((m) => ({ value: m, label: paymentConfig[m]?.label || m }))} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className={`${inputClass} resize-none`} placeholder="Observations..." />
          </div>

          {/* Articles vendus */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Articles vendus <span className="text-red-400">*</span>
              </label>
              <button type="button" onClick={addRow}
                className="flex items-center gap-1 text-xs font-semibold text-vert hover:underline">
                <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
              </button>
            </div>

            {loadingItems ? (
              <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
                <Spinner /> <span className="text-xs">Chargement des articles…</span>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((r) => {
                  const isLinked = !!r.productionId;
                  return (
                    <div key={r.rowId} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2.5">
                      {/* Ligne 1 : produit (enregistré ou saisie libre) */}
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase  mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Production enregistrée
                          </label>
                          <SelectInput
                            value={r.productionId ?? ""}
                            onChange={(v) => selectProduction(r.rowId, v)}
                            options={productionOptions}
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                            Nom du produit <span className="text-red-400">*</span>
                          </label>
                          <input value={r.productName} disabled={isLinked}
                            onChange={(e) => setItem(r.rowId, "productName", e.target.value)}
                            placeholder="ex: Lait, Œufs..." className={smallInput} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Catégorie</label>
                          <select value={r.category} disabled={isLinked}
                            onChange={(e) => setItem(r.rowId, "category", e.target.value)} className={smallInput}>
                            <option value={ProductCategory.Product}>Produit</option>
                            <option value={ProductCategory.byproduct}>Sous-produit</option>
                          </select>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button type="button" onClick={() => removeRow(r.rowId)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-rouge transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Ligne 2 : quantité / prix / remise / unité / total */}
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Unité</label>
                          <input value={r.unit} disabled={isLinked}
                            onChange={(e) => setItem(r.rowId, "unit", e.target.value)}
                            placeholder="kg" className={smallInput} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Qté *</label>
                          <input type="number" step="0.01" value={r.quantity}
                            onChange={(e) => setItem(r.rowId, "quantity", e.target.value)}
                            className={smallInput} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">P.U. *</label>
                          <input type="number" step="0.01" value={r.unitPrice}
                            onChange={(e) => setItem(r.rowId, "unitPrice", e.target.value)}
                            className={smallInput} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Remise</label>
                          <input type="number" step="0.01" value={r.discount}
                            onChange={(e) => setItem(r.rowId, "discount", e.target.value)}
                            className={smallInput} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Notes</label>
                          <input value={r.notes} onChange={(e) => setItem(r.rowId, "notes", e.target.value)}
                            placeholder="optionnel" className={smallInput} />
                        </div>
                        <p className="col-span-2 text-xs font-bold text-gray-700 text-right pb-2">{fmtNum(rowTotal(r), 0)} FCFA</p>
                      </div>

                      {/* Ligne 3 : origine exclusive lot / animal */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
                          {(["none", "lot", "animal"] as Origin[]).map((o) => (
                            <button key={o} type="button" onClick={() => setOrigin(r.rowId, o)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                                r.origin === o ? "bg-vert text-white" : "text-gray-500 hover:text-gray-700"
                              }`}>
                              {o === "none" ? "Aucune origine" : o === "lot" ? "Lot" : "Animal"}
                            </button>
                          ))}
                        </div>
                        {r.origin === "lot" && (
                          <div className="flex-1 min-w-[180px]">
                            <SelectInput value={r.lotId ?? ""} onChange={(v) => setItem(r.rowId, "lotId", v)}
                              options={lotOptions} placeholder="— choisir un lot —" />
                          </div>
                        )}
                        {r.origin === "animal" && (
                          <div className="flex-1 min-w-[180px]">
                            <SelectInput value={r.animalId ?? ""} onChange={(v) => setItem(r.rowId, "animalId", v)}
                              options={animalOptions} placeholder="— choisir un animal —" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-800">Total : <span className="text-vert">{fmtMoney(totalAmount)}</span></p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition">Annuler</button>
          <button onClick={handleSubmit} disabled={saving || !form.date || validItems.length === 0}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200">
            {saving ? <><Spinner /> Enregistrement…</> : initial ? "Enregistrer" : "Créer la vente"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Column Header ─────────────────────────────────────────────────────────
type SortKey = "date" | "total" | "status";

const ColHeader: React.FC<{ label: string; colKey: SortKey; current: SortKey; dir: "asc" | "desc"; onSort: (k: SortKey) => void }> =
  ({ label, colKey, current, dir, onSort }) => (
    <button onClick={() => onSort(colKey)} className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition">
      {label}
      {current === colKey ? (dir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-20" />}
    </button>
  );

// ── Main Component ─────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 20;

const VentesProduitsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const saleListState = useAppSelector(selectSaleList);
  const sales: any[] = saleListState?.entities || [];
  // FIX : c'était `LoadingType.PENDING` (une constante toujours "truthy"),
  // ce qui bloquait l'affichage sur "Chargement…" en permanence.
  const isLoading = saleListState?.status === LoadingType.PENDING;
  const farmId = currentFarm?.id;

  // ── Clients ──
  const clientState = useAppSelector((s: any) => s.client);
  const clients: Client[] = clientState?.list?.entities ?? [];

  // ── Productions / Lots / Animaux ──
  const productions: any[] = useAppSelector(selectProductions) ?? [];
  const lotsRaw = useAppSelector((s: any) => s.lot?.entities ?? s.lot ?? []);
  const animalsRaw = useAppSelector((s: any) => s.animal?.animalist?.entities);
  const lots: FecthLot[] = Array.isArray(lotsRaw) ? lotsRaw : [];
  const animals: any[] = Array.isArray(animalsRaw) ? animalsRaw : animalsRaw ? [animalsRaw] : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (farmId) {
      dispatch(getAllSales({ farmId, limit: 500 }));
      dispatch(fetchClients({ farmId, page: 1, limit: 1000 }));
      dispatch(fetchProductions({ farmId, limit: 500 }));
      dispatch(getAllLots({ farmId, limit: 100 }));
      dispatch(getAllAnimals({ farmId, limit: 200, page: 1 }));
    }
  }, [dispatch, farmId]);

  const refresh = useCallback(() => {
    if (farmId) {
      dispatch(getAllSales({ farmId, limit: 500 }));
      toast.info("Données actualisées");
    }
  }, [dispatch, farmId]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteSale(deleteTarget.id)).unwrap();
      toast.success("Vente supprimée avec succès");
      setDeleteTarget(null);
      refresh();
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
    let list = [...sales];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((s) => [s.client?.name, s.notes].some((v: string) => v?.toLowerCase().includes(q)));
    }
    if (filterStatus !== "all") list = list.filter((s) => s.status === filterStatus);
    if (filterPayment !== "all") list = list.filter((s) => s.paymentMethod === filterPayment);
    if (dateFrom) list = list.filter((s) => s.date && new Date(s.date) >= new Date(dateFrom));
    if (dateTo) list = list.filter((s) => s.date && new Date(s.date) <= new Date(dateTo));

    list.sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortKey === "date") { aVal = a.date || ""; bVal = b.date || ""; }
      else if (sortKey === "total") { aVal = a.total || 0; bVal = b.total || 0; }
      else { aVal = a.status; bVal = b.status; }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [sales, searchTerm, filterStatus, filterPayment, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalRevenue = sales.reduce((s, x) => s + (x.total || 0), 0);
  const completedCount = sales.filter((s) => s.status === SaleStatus.COMPLETED).length;
  const activeFilters = [filterStatus !== "all", filterPayment !== "all", !!dateFrom, !!dateTo, !!searchTerm].filter(Boolean).length;

  const exportCSV = () => {
    const rows = [
      ["Date", "Client", "Statut", "Paiement", "Total", "Notes"],
      ...filtered.map((s) => [
        fmtDate(s.date), s.client?.name || "", statusConfig[s.status]?.label || s.status,
        paymentConfig[s.paymentMethod]?.label || s.paymentMethod, s.total, s.notes || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ventes.csv"; a.click();
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
              <span>Finances</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Ventes & Produits</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Ventes & Produits</h1>
            <p className="text-sm text-gray-400 mt-0.5">Historique des ventes et de leurs articles</p>
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
              <Plus className="w-4 h-4" /> Nouvelle vente
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total ventes" value={sales.length} sub="enregistrements" icon={<ShoppingCart className="w-5 h-5 text-vert" />} bg="bg-emerald-50" />
          <StatCard label="Chiffre d'affaires" value={fmtMoney(totalRevenue)} sub="toutes ventes" icon={<Banknote className="w-5 h-5 text-bleu" />} bg="bg-blue-50" />
          <StatCard label="Ventes complétées" value={completedCount} sub={`sur ${sales.length}`} icon={<CheckCircle2 className="w-5 h-5 text-vert" />} bg="bg-emerald-50" />
          <StatCard label="Dernière vente" value={sales[0] ? fmtDate(sales[0].date) : "—"} sub={sales[0]?.client?.name || ""} icon={<Package2 className="w-5 h-5 text-jaune" />} bg="bg-yellow-50" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Rechercher client, notes..."
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
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Statut</label>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="all">Tous</option>
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Paiement</label>
              <select value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="all">Tous</option>
                {Object.entries(paymentConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
            <button onClick={() => { setSearchTerm(""); setFilterStatus("all"); setFilterPayment("all"); setDateFrom(""); setDateTo(""); setPage(1); }}
              className="text-xs font-bold text-vert hover:underline">Réinitialiser</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" /><span className="text-sm">Chargement…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <ShoppingCart className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">Aucune vente trouvée</p>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition">
              <Plus className="w-4 h-4" /> Nouvelle vente
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[110px_1fr_130px_140px_120px_96px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <ColHeader label="Date" colKey="date" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client</p>
              <ColHeader label="Statut" colKey="status" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Paiement</p>
              <ColHeader label="Total" colKey="total" current={sortKey} dir={sortDir} onSort={handleSort} />
              <p />
            </div>
            <div className="divide-y divide-gray-50">
              {paginated.map((s) => {
                const st = statusConfig[s.status];
                const pm = paymentConfig[s.paymentMethod];
                return (
                  <div key={s.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[110px_1fr_130px_140px_120px_96px] gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition items-center group">
                    <p className="text-xs text-gray-500">{fmtDate(s.date)}</p>
                    <p className="font-semibold text-gray-800 text-sm">{s.client?.name || `Vente #${s.id}`}</p>
                    <div className="hidden md:block">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${st?.cls}`}>
                        {st?.icon} {st?.label}
                      </span>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
                      {pm?.icon} {pm?.label}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-bold text-gray-800">{fmtMoney(s.total)}</p>
                    </div>
                    <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditingItem(s); setShowForm(true); }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700" title="Modifier">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(s)}
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
        <SaleFormModal farmId={farmId} clients={clients} productions={productions} lots={lots} animals={animals}
          initial={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSuccess={() => { setShowForm(false); setEditingItem(null); refresh(); }} />
      )}

      {deleteTarget && (
        <DeleteModal sale={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} isDeleting={isDeleting} />
      )}
    </>
  );
};

export default VentesProduitsDashboard;