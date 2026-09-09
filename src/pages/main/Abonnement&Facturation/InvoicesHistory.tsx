/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { ChevronRight, RefreshCw, FileText } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchOrganizationInvoices } from "../../../store/Abonnement&Facturation/historyAction";
import { selectInvoices, selectInvoiceState } from "../../../store/Abonnement&Facturation/sliceInvoice";
import { Spinner, fmtDate, fmtNum, invoiceStatusConfig } from "../../../lib/paymentShared";
import { selectCurrentOrganization } from "../../../store/organization/slice";

const HistoriqueFactures: React.FC = () => {
  const dispatch = useAppDispatch();

  const invoices = useAppSelector(selectInvoices);
  const organizationId = useAppSelector(selectCurrentOrganization)?.id
  const { loading: invoicesLoading } = useAppSelector(selectInvoiceState);

  useEffect(() => {
    dispatch(fetchOrganizationInvoices({organizationId}));
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchOrganizationInvoices({organizationId}));
    toast.info("Données actualisées");
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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Paramètres</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Historique des factures</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Historique des factures</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Factures générées automatiquement pour votre abonnement
            </p>
          </div>
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Liste des factures */}
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
                        <td className="px-6 py-3.5 font-semibold text-gray-800">Facture N#{inv.id}</td>
                        <td className="px-6 py-3.5 text-xs text-gray-600">{inv.method}</td>
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
      </div>
    </>
  );
};

export default HistoriqueFactures;