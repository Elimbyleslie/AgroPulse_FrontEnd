/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { useAppSelector } from "../hooks/store";
import {
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
  FileEdit,
  AlertOctagon,
} from "lucide-react";
import {
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus,
} from "../models/historyPayment";
import {
  CreateSubscriptionPaymentPayload,
  SubscriptionPaymentStatus,
} from "../models/SubcriptionPayment";
export type { CreateSubscriptionPaymentPayload };

export const useOrganizationId = (): number | undefined => {
  return useAppSelector(
    (state) => state.authentification.auth.user?.ownedOrganizations?.[0]?.id
  );
};

export const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export const fmtDate = (d?: string | Date) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const fmtNum = (n?: number | null, dec = 0) =>
  n != null ? Number(n).toFixed(dec).replace(".", ",") : "—";


export const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  [PaymentStatus.COMPLETED]: { label: "Réussi", cls: "bg-emerald-50 text-vert border border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  [PaymentStatus.PENDING]: { label: "En attente", cls: "bg-amber-50 text-jaune border border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  [PaymentStatus.FAILED]: { label: "Échoué", cls: "bg-red-50 text-rouge border border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
  [PaymentStatus.CANCELLED]: { label: "Annulé", cls: "bg-gray-100 text-gray-500 border border-gray-200", icon: <Ban className="w-3.5 h-3.5" /> },
  [PaymentStatus.REFUNDED]: { label: "Remboursé", cls: "bg-blue-50 text-bleu border border-blue-200", icon: <RotateCcw className="w-3.5 h-3.5" /> },
  [PaymentStatus.PARTIAL]: { label: "Partiellement payé", cls: "bg-amber-50 text-jaune border border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
};


export const subscriptionPaymentStatusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  [SubscriptionPaymentStatus.PENDING]: { label: "En attente", cls: "bg-amber-50 text-jaune border border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  [SubscriptionPaymentStatus.PAID]: { label: "Payé", cls: "bg-emerald-50 text-vert border border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  [SubscriptionPaymentStatus.FAILED]: { label: "Échoué", cls: "bg-red-50 text-rouge border border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
  [SubscriptionPaymentStatus.CANCELLED]: { label: "Annulé", cls: "bg-gray-100 text-gray-500 border border-gray-200", icon: <Ban className="w-3.5 h-3.5" /> },
  [SubscriptionPaymentStatus.REFUNDED]: { label: "Remboursé", cls: "bg-blue-50 text-bleu border border-blue-200", icon: <RotateCcw className="w-3.5 h-3.5" /> },
};

// Palette FACTURES = indigo
export const invoiceStatusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  [InvoiceStatus.DRAFT]: { label: "Brouillon", cls: "bg-gray-100 text-gray-500 border border-gray-200", icon: <FileEdit className="w-3.5 h-3.5" /> },
  [InvoiceStatus.OPEN]: { label: "En attente de paiement", cls: "bg-amber-50 text-jaune border border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  [InvoiceStatus.PAID]: { label: "Payée", cls: "bg-indigo-50 text-indigo-600 border border-indigo-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  [InvoiceStatus.VOID]: { label: "Annulée", cls: "bg-gray-100 text-gray-500 border border-gray-200", icon: <XCircle className="w-3.5 h-3.5" /> },
  [InvoiceStatus.UNCOLLECTIBLE]: { label: "Irrécouvrable", cls: "bg-red-50 text-rouge border border-red-200", icon: <AlertOctagon className="w-3.5 h-3.5" /> },
};

export const methodConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  [PaymentMethod.card]: { label: "Carte bancaire", icon: <CreditCard className="w-3.5 h-3.5" /> },
  [PaymentMethod.mobile_money]: { label: "Mobile Money", icon: <Smartphone className="w-3.5 h-3.5" /> },
  [PaymentMethod.orange_money]: { label: "Orange Money", icon: <Smartphone className="w-3.5 h-3.5" /> },
  [PaymentMethod.bank_transfer]: { label: "Virement bancaire", icon: <Wallet className="w-3.5 h-3.5" /> },
  [PaymentMethod.check]: { label: "Chèque", icon: <FileEdit className="w-3.5 h-3.5" /> },
  [PaymentMethod.cash]: { label: "Espèces", icon: <Banknote className="w-3.5 h-3.5" /> },
  [PaymentMethod.other]: { label: "Autre", icon: <HelpCircle className="w-3.5 h-3.5" /> },
};