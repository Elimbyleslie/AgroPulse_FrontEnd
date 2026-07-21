/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  ChevronRight,
  CreditCard,
  Users,
  HardDrive,
  PawPrint,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Repeat,
  Ban,
  Sparkles,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchPlans,
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
} from "../../../store/Abonnement&Facturation/action";
import {
  selectPlans,
  selectCurrentSubscription,
  selectSubscriptionState,
} from "../../../store/Abonnement&Facturation/slice";
import {
  Plan,
  RenewalType,
  SubscriptionStatus,
} from "../../../models/abonnementFacturation";
const useOrganizationId = (): number | undefined => {
    const organizationId =useAppSelector((state)=>state.authentification.auth.user?.ownedOrganizations?.at(0)?.id);
    console.log("Current organization ID:", organizationId); // Ajoutez cette ligne pour le débogage
    return organizationId;
   
};

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

const statusConfig: Record<
  string,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  [SubscriptionStatus.ACTIVE]: {
    label: "Actif",
    cls: "bg-emerald-50 text-vert border border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  [SubscriptionStatus.CANCELLED]: {
    label: "Annulé",
    cls: "bg-gray-100 text-gray-500 border border-gray-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  [SubscriptionStatus.EXPIRED]: {
    label: "Expiré",
    cls: "bg-red-50 text-rouge border border-red-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
};

const billingCycleLabels: Record<string, string> = {
  MONTHLY: "Mensuel",
  YEARLY: "Annuel",
};

const CancelModal: React.FC<{
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}> = ({ onCancel, onConfirm, isLoading }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Ban className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Annuler l'abonnement ?
          </h3>
          <p className="text-sm text-gray-500">
            Vous garderez l'accès jusqu'à la fin de la période en cours.
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
        Cette action passera le statut de votre abonnement à "Annulé".
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
        >
          Retour
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rouge text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner /> Annulation…
            </>
          ) : (
            "Confirmer l'annulation"
          )}
        </button>
      </div>
    </div>
  </div>
);

const ChangePlanModal: React.FC<{
  plan: Plan;
  hasActiveSubscription: boolean;
  onClose: () => void;
  onConfirm: (renewalType: RenewalType) => void;
  isLoading: boolean;
}> = ({ plan, hasActiveSubscription, onClose, onConfirm, isLoading }) => {
  const [renewalType, setRenewalType] = useState<RenewalType>(
    RenewalType.AUTO,
  );
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-vert" />
          </div>
          <h2 className="font-bold text-gray-900 text-sm">
            {hasActiveSubscription
              ? `Passer au plan ${plan.name}`
              : `Souscrire au plan ${plan.name}`}
          </h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-bold text-gray-900">{plan.name}</span>
              <span className="text-lg font-black text-vert">
                {fmtNum(plan.price)} F
                <span className="text-xs text-gray-400 font-medium">
                  {" "}
                  /{" "}
                  {billingCycleLabels[plan.billingCycle]?.toLowerCase() ||
                    plan.billingCycle}
                </span>
              </span>
            </div>
            <p className="text-xs text-gray-500">{plan.description}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Renouvellement
            </label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {[RenewalType.AUTO, RenewalType.MANUAL].map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => setRenewalType(rt)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${renewalType === rt ? "bg-white text-vert shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {rt === RenewalType.AUTO ? "Automatique" : "Manuel"}
                </button>
              ))}
            </div>
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
            onClick={() => onConfirm(renewalType)}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200"
          >
            {isLoading ? (
              <>
                <Spinner /> Traitement…
              </>
            ) : (
              "Confirmer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MonAbonnementDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const organizationId = useOrganizationId();
  const plans = useAppSelector(selectPlans);
const subscriptionState = useAppSelector(selectSubscriptionState);
const currentSubscription = useAppSelector(selectCurrentSubscription);

console.log("📌 Subscription State complet :", subscriptionState);
console.log("📌 Current Subscription (selector) :", currentSubscription);
console.log("📌 Organization ID :", organizationId);
  const { loading, actionLoading } = useAppSelector(selectSubscriptionState);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [planToConfirm, setPlanToConfirm] = useState<Plan | null>(null);

  useEffect(() => {
    dispatch(fetchPlans({ page: 1, limit: 50 }));
    if (organizationId != null) {
      dispatch(fetchSubscriptions({ organizationId, page: 1, limit: 50 }));
    }
  }, [dispatch, organizationId]);

  const refresh = () => {
    if (organizationId == null) {
      toast.error("Organisation introuvable — impossible d'actualiser les abonnements");
      return;
    }
    dispatch(fetchSubscriptions({ organizationId, page: 1, limit: 50 }));
    toast.info("Données actualisées");
  };

  const currentPlan = useMemo(
    () =>
      currentSubscription?.plan ||
      plans.find((p) => p.id === currentSubscription?.planId) ||
      null,
    [plans, currentSubscription],
  );

  const daysRemaining = useMemo(() => {
    if (!currentSubscription?.endDate) return null;
    const diff =
      new Date(currentSubscription.endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [currentSubscription]);

  const isActive = currentSubscription?.status === SubscriptionStatus.ACTIVE;

  const handleConfirmPlan = async (renewalType: RenewalType) => {
    if (!planToConfirm) return;
    try {
      if (isActive && currentSubscription) {
        // Un abonnement actif existe déjà → on le met à jour (changement de plan)
        await dispatch(
          updateSubscription({
            id: currentSubscription.id,
            data: { planId: planToConfirm.id, renewalType },
          }),
        ).unwrap();
        toast.success(`Abonnement mis à jour vers ${planToConfirm.name}`);
      } else {
        if (!organizationId) {
          toast.error(
            "Organisation introuvable — impossible de créer l'abonnement",
          );
          return;
        }
        await dispatch(
          createSubscription({
            organizationId,
            planId: planToConfirm.id,
            renewalType,
          }),
        ).unwrap();
        toast.success(`Abonnement ${planToConfirm.name} activé avec succès`);
      }
      setPlanToConfirm(null);
    } catch (err) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      console.error(err);
    }
  };

  const handleCancel = async () => {
    if (!currentSubscription) return;
    try {
      await dispatch(
        cancelSubscription({ id: currentSubscription.id }),
      ).unwrap();
      toast.success("Abonnement annulé");
      setShowCancelModal(false);
    } catch (err) {
      toast.error("Erreur lors de l'annulation");
      console.error(err);
    }
  };

  const statusCfg = currentSubscription
    ? statusConfig[currentSubscription.status]
    : undefined;

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
              <span className="text-gray-600 font-medium">
                Mon abonnement
              </span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">
              Mon abonnement
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Gérez votre plan, votre facturation et votre renouvellement
            </p>
          </div>
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : (
          <>
            {/* Abonnement actuel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CreditCard className="w-4.5 h-4.5 text-vert" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      Plan actuel
                    </p>
                    <p className="text-xs text-gray-400">
                      {currentPlan?.name || "Aucun plan actif"}
                    </p>
                  </div>
                </div>
                {statusCfg && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${statusCfg.cls}`}
                  >
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                )}
              </div>

              {currentSubscription && currentPlan ? (
                <div className="p-6 space-y-5">
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <span className="text-3xl font-black text-gray-900">
                      {fmtNum(currentPlan.price)} F
                      <span className="text-sm text-gray-400 font-medium">
                        {" "}
                        /{" "}
                        {billingCycleLabels[
                          currentPlan.billingCycle
                        ]?.toLowerCase() || currentPlan.billingCycle}
                      </span>
                    </span>
                    {daysRemaining != null && isActive && (
                      <span className="text-xs text-gray-400">
                        {daysRemaining} jour(s) restant(s)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col items-center text-center gap-1">
                      <Users className="w-4 h-4 text-vert" />
                      <span className="text-sm font-bold text-gray-800">
                        {currentPlan.userLimit}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Utilisateurs
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col items-center text-center gap-1">
                      <HardDrive className="w-4 h-4 text-bleu" />
                      <span className="text-sm font-bold text-gray-800">
                        {currentPlan.storageLimit} Go
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Stockage
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col items-center text-center gap-1">
                      <PawPrint className="w-4 h-4 text-jaune" />
                      <span className="text-sm font-bold text-gray-800">
                        {currentPlan.animalLimit}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Animaux
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">
                        Date de début
                      </p>
                      <p className="font-semibold text-gray-800">
                        {fmtDate(currentSubscription.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">
                        Date d'expiration
                      </p>
                      <p className="font-semibold text-gray-800">
                        {fmtDate(currentSubscription.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-wrap gap-3">
                    <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-bleu">
                      <Repeat className="w-3.5 h-3.5" />
                      Renouvellement :{" "}
                      {currentSubscription.renewalType === RenewalType.AUTO
                        ? "Automatique"
                        : "Manuel"}
                    </span>
                    {isActive && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 text-rouge hover:bg-red-100 transition"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Annuler l'abonnement
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <CreditCard className="w-8 h-8 text-gray-200" />
                  <p className="text-sm font-semibold text-gray-500">
                    Aucun abonnement actif
                  </p>
                  <p className="text-xs text-gray-400">
                    Choisissez un plan ci-dessous pour commencer
                  </p>
                </div>
              )}
            </div>

            {/* Plans disponibles */}
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-3">
                Plans disponibles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const isCurrent = isActive && plan.id === currentPlan?.id;
                  return (
                    <div
                      key={plan.id}
                      className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col gap-4 transition ${isCurrent ? "border-vert ring-1 ring-emerald-200" : "border-gray-100 hover:border-emerald-200"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {plan.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {billingCycleLabels[plan.billingCycle] ||
                              plan.billingCycle}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-emerald-50 text-vert px-2 py-1 rounded-lg">
                            Plan actuel
                          </span>
                        )}
                      </div>

                      <p className="text-2xl font-black text-gray-900">
                        {fmtNum(plan.price)} F
                        <span className="text-xs text-gray-400 font-medium">
                          {" "}
                          /{" "}
                          {billingCycleLabels[
                            plan.billingCycle
                          ]?.toLowerCase() || plan.billingCycle}
                        </span>
                      </p>

                      <p className="text-xs text-gray-500 line-clamp-2">
                        {plan.description}
                      </p>

                      <div className="flex flex-col gap-1.5 text-xs text-gray-500 pt-2 border-t border-gray-50">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> {plan.userLimit}{" "}
                          utilisateurs
                        </span>
                        <span className="flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5" />{" "}
                          {plan.storageLimit} Go de stockage
                        </span>
                        <span className="flex items-center gap-1.5">
                          <PawPrint className="w-3.5 h-3.5" />{" "}
                          {plan.animalLimit} animaux
                        </span>
                      </div>

                      <button
                        onClick={() => setPlanToConfirm(plan)}
                        disabled={isCurrent}
                        className={`mt-1 py-2.5 rounded-xl font-semibold text-sm transition ${
                          isCurrent
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-vert text-white hover:bg-dark_vert shadow-sm shadow-emerald-200"
                        }`}
                      >
                        {isCurrent
                          ? "Plan actif"
                          : isActive
                            ? "Changer pour ce plan"
                            : "Choisir ce plan"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {planToConfirm && (
        <ChangePlanModal
          plan={planToConfirm}
          hasActiveSubscription={isActive}
          onClose={() => setPlanToConfirm(null)}
          onConfirm={handleConfirmPlan}
          isLoading={actionLoading}
        />
      )}
      {showCancelModal && (
        <CancelModal
          onCancel={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
          isLoading={actionLoading}
        />
      )}
    </>
  );
};

export default MonAbonnementDashboard;