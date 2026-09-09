/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { ChevronRight, ChevronLeft, Receipt, RefreshCw, Search, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchSubscriptionPayments, createSubscriptionPayment } from "../../../store/Abonnement&Facturation/subscriptionPaymentAction";
import {
  selectSubscriptionPayments,
  selectSubscriptionPaymentsPagination,
  selectSubscriptionPaymentState,
} from "../../../store/Abonnement&Facturation/subscriptionPaymentSlice";
import {  SubscriptionPaymentStatus } from "../../../models/SubcriptionPayment";
import { PaymentMethod } from "../../../models/historyPayment";


import {
  useOrganizationId,
  Spinner,
  fmtDate,
  fmtNum,
  subscriptionPaymentStatusConfig,
  methodConfig,
  CreateSubscriptionPaymentPayload,
} from "../../../lib/paymentShared";

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

  const payments = useAppSelector(selectSubscriptionPayments);
  const pagination = useAppSelector(selectSubscriptionPaymentsPagination);
  const { loading } = useAppSelector(selectSubscriptionPaymentState);

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
    if (organizationId == null) return;
    dispatch(fetchSubscriptionPayments({ organizationId, page, limit, status, method, search }));
  }, [dispatch, organizationId, page, limit, status, method, search]);

  const refresh = () => {
    if (organizationId == null) {
      toast.error("Organisation introuvable — impossible d'actualiser");
      return;
    }
    dispatch(fetchSubscriptionPayments({ organizationId, page, limit, status, method, search }));
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

    const payload: CreateSubscriptionPaymentPayload = {
      amount: amountNum,
      currency: paymentForm.currency,
      method: paymentForm.method,
      notes: paymentForm.description.trim() || undefined,
      organizationId,
    };

    setSubmittingPayment(true);
    dispatch(createSubscriptionPayment(payload))
      .unwrap()
      .then(() => {
        toast.success("Paiement enregistré et historique mis à jour");
        setPaymentForm(emptyPaymentForm);
        setShowPaymentForm(false);
        setPage(1);
        dispatch(fetchSubscriptionPayments({ organizationId, page: 1, limit, status, method, search }));
      })
      .catch(() => toast.error("Échec de l'enregistrement du paiement"))
      .finally(() => setSubmittingPayment(false));
  };

  const totalAmountOnPage = useMemo(
    () => payments.reduce((sum, p) => sum + (p.status === SubscriptionPaymentStatus.PAID ? p.amount : 0), 0),
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
              <span>Abonnement</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Historique des paiements</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Historique des paiements</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Retrouvez l'ensemble des transactions liées à votre organisation
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => setShowPaymentForm(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-vert text-white text-xs font-semibold hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Nouveau paiement
            </button> */}
            <button
              onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filtres */}
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
            {Object.values(SubscriptionPaymentStatus).map((s) => (
              <option key={s} value={s}>{subscriptionPaymentStatusConfig[s]?.label || s}</option>
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

        {/* Liste des paiements */}
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
                    const st = p.status ? subscriptionPaymentStatusConfig[p.status] : undefined;
                    const mt = methodConfig[p.method];
                    return (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-gray-800">{p.subscription?.plan?.code}</p>
                          {p.notes && <p className="text-xs text-gray-400 line-clamp-1">{p.notes}</p>}
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