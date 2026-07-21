/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  ChevronRight,
  ChevronLeft,
  Receipt,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  RotateCcw,
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  HelpCircle,
  Plus,
  X,
  FileText,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchPayments, fetchOrganizationInvoices, createPayment } from "../../../store/Abonnement&Facturation/historyAction";
import {
  selectPayments,
  selectPaymentsPagination,
  selectPaymentState,
} from "../../../store/Abonnement&Facturation/historySlice";
import { PaymentMethod, PaymentStatus } from "../../../models/historyPayment";
import {
  selectInvoices,
  selectInvoiceState,
} from "../../../store/Abonnement&Facturation/sliceInvoice";
import { InvoiceStatus } from "../../../models/historyPayment";

export interface CreatePaymentPayload {
  amount: number;
  currency?: string;
  method: PaymentMethod;
  reference: string;
  description?: string;
  organizationId: number;
  userId?: number;
  saleId?: number;
  farmId?: number;
  purchaseId?: number;
}

const useOrganizationId = (): number | undefined => {
  const organizationId = useAppSelector(
    (state) => state.authentification.auth.user?.ownedOrganizations?.[0]?.id
  );
  console.log("🔍 Organization ID récupéré :", organizationId); // Ajoute ce log
  return organizationId;
};

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtDate = (d?: string | Date) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const fmtNum = (n?: number | null, dec = 0) =>
  n != null ? Number(n).toFixed(dec).replace(".", ",") : "—";

// Palette PAIEMENTS = vert
const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  [PaymentStatus.SUCCESS]: { label: "Réussi", cls: "bg-emerald-50 text-vert border border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  [PaymentStatus.PENDING]: { label: "En attente", cls: "bg-amber-50 text-jaune border border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  [PaymentStatus.FAILED]: { label: "Échoué", cls: "bg-red-50 text-rouge border border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
  [PaymentStatus.CANCELLED]: { label: "Annulé", cls: "bg-gray-100 text-gray-500 border border-gray-200", icon: <Ban className="w-3.5 h-3.5" /> },
  [PaymentStatus.REFUNDED]: { label: "Remboursé", cls: "bg-blue-50 text-bleu border border-blue-200", icon: <RotateCcw className="w-3.5 h-3.5" /> },
};

// Palette FACTURES = indigo (lecture seule — création automatique via l'abonnement)
const invoiceStatusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  [InvoiceStatus.paid]: { label: "Payée", cls: "bg-indigo-50 text-indigo-600 border border-indigo-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  [InvoiceStatus.pending]: { label: "En attente", cls: "bg-amber-50 text-jaune border border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  [InvoiceStatus.overdue]: { label: "En retard", cls: "bg-red-50 text-rouge border border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
};

const methodConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  [PaymentMethod.card]: { label: "Carte bancaire", icon: <CreditCard className="w-3.5 h-3.5" /> },
  [PaymentMethod.mobile_money]: { label: "Mobile Money", icon: <Smartphone className="w-3.5 h-3.5" /> },
  [PaymentMethod.orange_money]: { label: "Orange Money", icon: <Smartphone className="w-3.5 h-3.5" /> },
  [PaymentMethod.paypal]: { label: "PayPal", icon: <Wallet className="w-3.5 h-3.5" /> },
  [PaymentMethod.cash]: { label: "Espèces", icon: <Banknote className="w-3.5 h-3.5" /> },
  [PaymentMethod.others]: { label: "Autre", icon: <HelpCircle className="w-3.5 h-3.5" /> },
};

const emptyPaymentForm = {
  amount: "",
  method: PaymentMethod.mobile_money as PaymentMethod,
  reference: "",
  description: "",
  currency: "XAF",
};

const HistoriquePaiements: React.FC = () => {
  const dispatch = useAppDispatch();
  const organizationId = useOrganizationId();

  const payments = useAppSelector(selectPayments);
  const pagination = useAppSelector(selectPaymentsPagination);
  const { loading } = useAppSelector(selectPaymentState);

  const invoices = useAppSelector(selectInvoices);
  const { loading: invoicesLoading } = useAppSelector(selectInvoiceState);

  const [tab, setTab] = useState<"payments" | "invoices">("payments");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    if (organizationId == null || tab !== "payments") return;
    dispatch(fetchPayments({ organizationId, page, limit, status, method, search }));
  }, [dispatch, organizationId, tab, page, limit, status, method, search]);

  useEffect(() => {
  if (tab !== "invoices") return;
  dispatch(fetchOrganizationInvoices());   // Plus de params
}, [dispatch, tab]);

  const refresh = () => {
    if (organizationId == null) {
      toast.error("Organisation introuvable — impossible d'actualiser");
      return;
    }
    if (tab === "payments") {
      dispatch(fetchPayments({ organizationId, page, limit, status, method, search }));
    } else {
      dispatch(fetchOrganizationInvoices());
    }
    toast.info("Données actualisées");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (organizationId == null) {
      toast.error("Organisation introuvable");
      return;
    }
    const amountNum = Number(paymentForm.amount);
    if (!amountNum || amountNum <= 0) {
      toast.error("Montant invalide");
      return;
    }
    if (!paymentForm.reference.trim()) {
      toast.error("La référence est requise");
      return;
    }

    const payload: CreatePaymentPayload = {
      amount: amountNum,
      currency: paymentForm.currency || undefined,
      method: paymentForm.method,
      reference: paymentForm.reference.trim(),
      description: paymentForm.description.trim() || undefined,
      organizationId,
    };

    setSubmittingPayment(true);
    dispatch(createPayment(payload))
      .unwrap()
      .then(() => {
        toast.success("Paiement enregistré et historique mis à jour");
        setPaymentForm(emptyPaymentForm);
        setShowPaymentForm(false);
        setPage(1);
        dispatch(fetchPayments({ organizationId, page: 1, limit, status, method, search }));
      })
      .catch(() => toast.error("Échec de l'enregistrement du paiement"))
      .finally(() => setSubmittingPayment(false));
  };

  const totalAmountOnPage = useMemo(
    () => payments.reduce((sum, p) => sum + (p.status === PaymentStatus.SUCCESS ? p.amount : 0), 0),
    [payments],
  );

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
              <span>Paramètres</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Historique des paiements</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Historique des paiements</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Retrouvez l'ensemble des transactions liées à votre organisation
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tab === "payments" && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-vert text-white text-xs font-semibold hover:opacity-90 transition"
              >
                <Plus className="w-4 h-4" />
                Nouveau paiement
              </button>
            )}
            <button
              onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="inline-flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => setTab("payments")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${tab === "payments" ? "bg-white text-vert shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Paiements
          </button>
          <button
            onClick={() => setTab("invoices")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${tab === "invoices" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Factures
          </button>
        </div>

        {/* Filtres (paiements uniquement) */}
        {tab === "payments" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] relative">
              <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher par référence…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </form>

            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">Tous les statuts</option>
              {Object.values(PaymentStatus).map((s) => (
                <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
              ))}
            </select>

            <select
              value={method}
              onChange={(e) => {
                setPage(1);
                setMethod(e.target.value);
              }}
              className="py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">Tous les moyens</option>
              {Object.values(PaymentMethod).map((m) => (
                <option key={m} value={m}>{methodConfig[m]?.label || m}</option>
              ))}
            </select>
          </div>
        )}

        {/* Liste des paiements */}
        {tab === "payments" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Receipt className="w-4.5 h-4.5 text-vert" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Transactions</p>
                  <p className="text-xs text-gray-400">{pagination?.totalItems ?? payments.length} paiement(s) au total</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                Total réussi (page) : <span className="font-bold text-vert">{fmtNum(totalAmountOnPage)} F</span>
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <Spinner className="w-8 h-8" />
                <span className="text-sm">Chargement…</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Receipt className="w-8 h-8 text-gray-200" />
                <p className="text-sm font-semibold text-gray-500">Aucun paiement trouvé</p>
                <p className="text-xs text-gray-400">Modifiez vos filtres ou revenez plus tard</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-3 font-semibold">Référence</th>
                      <th className="px-6 py-3 font-semibold">Moyen</th>
                      <th className="px-6 py-3 font-semibold">Montant</th>
                      <th className="px-6 py-3 font-semibold">Statut</th>
                      <th className="px-6 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const st = p.status ? statusConfig[p.status] : undefined;
                      const mt = methodConfig[p.method];
                      return (
                        <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                          <td className="px-6 py-3.5">
                            <p className="font-semibold text-gray-800">{p.reference}</p>
                            {p.description && <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
                              {mt?.icon}{mt?.label || p.method}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-gray-900">{fmtNum(p.amount)} {p.currency || "F"}</td>
                          <td className="px-6 py-3.5">
                            {st && <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${st.cls}`}>{st.icon} {st.label}</span>}
                          </td>
                          <td className="px-6 py-3.5 text-gray-500">{fmtDate(p.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.totalPage > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Page {pagination.currentPage} sur {pagination.totalPage}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => pagination.previousPage && setPage(pagination.previousPage)}
                    disabled={!pagination.previousPage}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => pagination.nextPage && setPage(pagination.nextPage)}
                    disabled={!pagination.nextPage}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Liste des factures — lecture seule, palette indigo */}
        {tab === "invoices" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Factures</p>
                <p className="text-xs text-gray-400">{invoices.length} facture(s) au total</p>
              </div>
            </div>

            {invoicesLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <Spinner className="w-8 h-8" />
                <span className="text-sm">Chargement…</span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center gap-2 text-gray-400">
                <FileText className="w-8 h-8 text-gray-200" />
                <p className="text-sm font-semibold text-gray-500">Aucune facture trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-3 font-semibold">Facture</th>
                      <th className="px-6 py-3 font-semibold">Moyen</th>
                      <th className="px-6 py-3 font-semibold">Montant</th>
                      <th className="px-6 py-3 font-semibold">Statut</th>
                      <th className="px-6 py-3 font-semibold">Émise le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => {
                      const st = invoiceStatusConfig[inv.status];
                      return (
                        <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                          <td className="px-6 py-3.5 font-semibold text-gray-800">Facture #{inv.id}</td>
                          <td className="px-6 py-3.5 text-xs text-gray-600">{methodConfig[inv.paymentMethod]?.label || inv.paymentMethod || "—"}</td>
                          <td className="px-6 py-3.5 font-bold text-gray-900">{fmtNum(inv.amount)} {inv.currency}</td>
                          <td className="px-6 py-3.5">
                            {st && <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${st.cls}`}>{st.icon} {st.label}</span>}
                          </td>
                          <td className="px-6 py-3.5 text-gray-500">{fmtDate(inv.issuedAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal — Nouveau paiement */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative border-t-4 border-vert">
            <button onClick={() => setShowPaymentForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-darkText mb-4">Nouveau paiement</h2>

            <form onSubmit={handleCreatePayment} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">Montant</label>
                <input
                  type="number" min="0" step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Moyen de paiement</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value as PaymentMethod }))}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {Object.values(PaymentMethod).map((m) => (
                    <option key={m} value={m}>{methodConfig[m]?.label || m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Référence</label>
                <input
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, reference: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Description (optionnel)</label>
                <textarea
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                disabled={submittingPayment}
                className="mt-2 w-full py-2.5 rounded-xl bg-vert text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingPayment && <Spinner className="w-4 h-4" />}
                {submittingPayment ? "Enregistrement…" : "Enregistrer le paiement"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HistoriquePaiements;