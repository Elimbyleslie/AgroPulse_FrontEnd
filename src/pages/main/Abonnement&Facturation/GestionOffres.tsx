import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store"; // ⚠️ adapter le chemin selon l'emplacement réel du fichier
import {
  fetchPlans,
  deletePlan,
} from "../../../store/Abonnement&Facturation/action"; // ⚠️ idem
import {
  selectPlans,
  selectPlansPagination,
  selectSubscriptionState,
} from "../../../store/Abonnement&Facturation/slice"; // ⚠️ idem
import { Plan, BillingCycle } from "../../../models/abonnementFacturation"; // ⚠️ idem
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  AlertTriangle,
  RefreshCw,
  PackageX,
  Package,
  Users,
  HardDrive,
  PawPrint,
  Clock,
  Wallet,
} from "lucide-react";
import PlanFormModal from "../../../components/Modal/PlanFormModal";
import { toast } from "react-toastify";

// ── Helpers ──────────────────────────────────────────────────────────────────
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

const formatPrice = (value: number) =>
  new Intl.NumberFormat("fr-FR").format(value) + " FCFA";

type CycleFilter = BillingCycle | "all";

const CYCLE_LABEL: Record<BillingCycle, string> = {
  [BillingCycle.MONTHLY]: "Mensuel",
  [BillingCycle.YEARLY]: "Annuel",
};

const CYCLE_ICON: Record<BillingCycle, React.ElementType> = {
  [BillingCycle.MONTHLY]: Clock,
  [BillingCycle.YEARLY]: Wallet,
};

// Palette tournante utilisant les couleurs de la charte : chaque plan reçoit
// une couleur d'accent distincte pour se repérer facilement dans la liste.
const PLAN_ACCENTS = [
  { text: "text-bleu", bg: "bg-bleu/10", bar: "bg-bleu" },
  { text: "text-vert", bg: "bg-vert/10", bar: "bg-vert" },
  { text: "text-jaune", bg: "bg-jaune/10", bar: "bg-jaune" },
  { text: "text-modalBg", bg: "bg-modalBg/10", bar: "bg-modalBg" },
  { text: "text-darkBleuVert", bg: "bg-darkBleuVert/10", bar: "bg-darkBleuVert" },
] as const;

// ── Delete Modal ───────────────────────────────────────────────────────────────
const DeleteModal: React.FC<{
  planName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ planName, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-rouge/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 bg-rouge/10 rounded-xl">
          <Trash2 className="w-5 h-5 text-rouge" />
        </div>
        <div>
          <h3 className="text-base font-black text-darkText">
            Supprimer ce plan ?
          </h3>
          <p className="text-xs text-text">{planName}</p>
        </div>
      </div>
      <p className="text-sm text-text mb-5 bg-rouge/10 rounded-xl px-3 py-2 border border-rouge/20">
        ⚠️ Cette action est <strong>irréversible</strong>. Les organisations
        abonnées ne seront pas affectées rétroactivement.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-black bg-btn/40 text-darkText hover:bg-btn/60 transition disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-black bg-rouge text-white hover:bg-darkRouge transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <>
              <Spinner />
              Suppression…
            </>
          ) : (
            "Supprimer"
          )}
        </button>
      </div>
    </div>
  </div>
);

// ── Detail Modal ───────────────────────────────────────────────────────────────
const DetailModal: React.FC<{
  plan: Plan;
  accent: (typeof PLAN_ACCENTS)[number];
  onClose: () => void;
  onEdit: () => void;
}> = ({ plan, accent, onClose, onEdit }) => {
  const CycleIcon = CYCLE_ICON[plan.billingCycle];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between px-5 pt-5 pb-3 border-b border-btn/40 border-t-4 ${accent.bar}`}
        >
          <div className="flex items-center gap-2">
            <Package className={`w-4 h-4 ${accent.text}`} />
            <span className="font-black text-darkText">{plan.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text hover:bg-bg_dash transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {plan.description && (
            <p className="text-sm text-text leading-relaxed">
              {plan.description}
            </p>
          )}

          <div className={`rounded-xl p-3 ${accent.bg}`}>
            <p className={`text-xs font-black uppercase mb-1 ${accent.text}`}>
              Cycle de facturation
            </p>
            <div className="flex items-center gap-2">
              <CycleIcon className={`w-4 h-4 ${accent.text}`} />
              <span className={`text-sm font-black ${accent.text}`}>
                {CYCLE_LABEL[plan.billingCycle]}
              </span>
            </div>
          </div>

          <div className={`rounded-xl p-3 ${accent.bg}`}>
            <p className={`text-xs font-black uppercase mb-0.5 ${accent.text}`}>
              Prix
            </p>
            <p className={`text-2xl font-black ${accent.text}`}>
              {formatPrice(plan.price)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-bg_dash rounded-xl p-3">
              <p className="text-xs font-black text-text uppercase mb-0.5">
                Durée
              </p>
              <p className="text-sm font-semibold text-darkText">
                {plan.durationDays} jours
              </p>
            </div>
            <div className="bg-bg_dash rounded-xl p-3">
              <p className="text-xs font-black text-text uppercase mb-0.5">
                Utilisateurs
              </p>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-text" />
                <p className="text-sm font-semibold text-darkText">
                  {plan.userLimit}
                </p>
              </div>
            </div>
            <div className="bg-bg_dash rounded-xl p-3">
              <p className="text-xs font-black text-text uppercase mb-0.5">
                Stockage
              </p>
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-text" />
                <p className="text-sm font-semibold text-darkText">
                  {plan.storageLimit} Mo
                </p>
              </div>
            </div>
            <div className="bg-bg_dash rounded-xl p-3">
              <p className="text-xs font-black text-text uppercase mb-0.5">
                Animaux
              </p>
              <div className="flex items-center gap-1.5">
                <PawPrint className="w-3.5 h-3.5 text-text" />
                <p className="text-sm font-semibold text-darkText">
                  {plan.animalLimit}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onEdit}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-white transition-all ${accent.bar} hover:opacity-90`}
          >
            <Pencil className="w-4 h-4" />
            Modifier ce plan
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const GestionOffres: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const plans = useSelector(selectPlans);
  const pagination = useSelector(selectPlansPagination);
  const { loading, error } = useSelector(selectSubscriptionState);
  const currentUser = useSelector(
    (state: RootState) => state.authentification.auth.user,
  ); // ⚠️ adapter selon le slice auth réel

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [cycleFilter, setCycleFilter] = useState<CycleFilter>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Plan | null>(null);
  const [detailItem, setDetailItem] = useState<Plan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSuperAdmin = currentUser?.roles?.includes("SUPER_ADMIN"); // ⚠️ adapter le nom exact du rôle si différent

  useEffect(() => {
    dispatch(fetchPlans({ page, limit }));
  }, [dispatch, page, limit]);

  const refresh = () => dispatch(fetchPlans({ page, limit }));

  const handleDelete = async () => {
    if (!deleteTarget?.id) {
      setDeleteTarget(null);
      return;
    }
    setIsDeleting(true);
    try {
      await dispatch(deletePlan({ id: deleteTarget.id })).unwrap();
      setDeleteTarget(null);
      toast.success("Plan supprimé");
      refresh();
    } catch {
      toast.error("La suppression a échoué");
    } finally {
      setIsDeleting(false);
    }
  };

  const list: Plan[] = Array.isArray(plans) ? plans : [];

  // Chaque plan garde toujours la même couleur d'accent, quel que soit le
  // filtre ou la recherche en cours (basé sur sa position dans la liste complète).
  const accentByPlanId = useMemo(() => {
    const map = new Map<number, (typeof PLAN_ACCENTS)[number]>();
    list.forEach((p, i) => map.set(p.id, PLAN_ACCENTS[i % PLAN_ACCENTS.length]));
    return map;
  }, [list]);

  const getAccent = (plan: Plan) =>
    accentByPlanId.get(plan.id) ?? PLAN_ACCENTS[0];

  const filtered = list
    .filter((p) => cycleFilter === "all" || p.billingCycle === cycleFilter)
    .filter((p) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });

  const monthlyCount = list.filter(
    (p) => p.billingCycle === BillingCycle.MONTHLY,
  ).length;
  const yearlyCount = list.filter(
    (p) => p.billingCycle === BillingCycle.YEARLY,
  ).length;

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="p-6 bg-rouge/10 rounded-2xl">
          <PackageX className="w-12 h-12 text-rouge" />
        </div>
        <h3 className="text-xl font-black text-darkText">Accès restreint</h3>
        <p className="text-text text-center max-w-md">
          Cette section est réservée aux administrateurs (SUPER_ADMIN).
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pt-20">
      {/* En-tête */}
      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-bleu/10 rounded-xl">
            <Package className="w-5 h-5 text-bleu" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-darkText">
              Gestion des offres
            </h2>
            <p className="text-sm text-text font-medium">
              {list.length} plan{list.length > 1 ? "s" : ""} · {monthlyCount}{" "}
              mensuel{monthlyCount > 1 ? "s" : ""} · {yearlyCount} annuel
              {yearlyCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl text-text hover:text-darkText hover:bg-bg_dash transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-white bg-bleu hover:bg-darkBleu rounded-xl font-black shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau plan
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rouge/30 bg-rouge/10 px-4 py-3 text-sm text-rouge font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error.meta?.message ?? "Une erreur est survenue."}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border border-btn/30">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text" />
          <input
            placeholder="Rechercher un plan…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-bg_dash border border-btn/40 rounded-xl text-sm font-medium text-darkText focus:outline-none focus:ring-2 focus:ring-bleu/40 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text hover:text-darkText"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCycleFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
              cycleFilter === "all"
                ? "bg-bleu text-white"
                : "bg-bg_dash text-text hover:bg-btn/30"
            }`}
          >
            Tous ({list.length})
          </button>
          {(Object.values(BillingCycle) as BillingCycle[]).map((c) => {
            const Icon = CYCLE_ICON[c];
            const count = list.filter((p) => p.billingCycle === c).length;
            const active = cycleFilter === c;
            return (
              <button
                key={c}
                onClick={() => setCycleFilter(c)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                  active
                    ? "bg-modalBg text-white"
                    : "bg-bg_dash text-text hover:bg-btn/30"
                }`}
              >
                <Icon className="w-3 h-3" />
                {CYCLE_LABEL[c]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12 text-text">
          <div className="w-8 h-8 border-2 border-bleu border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Chargement des plans…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="p-4 bg-bg_dash rounded-2xl">
            <PackageX className="w-8 h-8 text-btn" />
          </div>
          <p className="text-sm font-black text-text">Aucun plan trouvé</p>
          <p className="text-xs text-text">
            {searchTerm || cycleFilter !== "all"
              ? "Essayez de modifier vos filtres"
              : "Commencez par créer un plan d'abonnement"}
          </p>
          {!searchTerm && cycleFilter === "all" && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-1 flex items-center gap-2 px-4 py-2.5 bg-bleu text-white text-sm rounded-xl font-black hover:bg-darkBleu transition-all"
            >
              <Plus className="w-4 h-4" />
              Créer un plan
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Tableau responsive : colonnes secondaires masquées sous "lg"/"xl",
              scroll horizontal en secours, et bascule complète en cartes sous "md". */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-btn/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-bg_dash border-b border-btn/30">
                    <th className="text-left px-4 py-3 text-xs font-black text-text uppercase tracking-wide">
                      Plan
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-text uppercase tracking-wide">
                      Cycle
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-text uppercase tracking-wide">
                      Prix
                    </th>
                    <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-black text-text uppercase tracking-wide">
                      Durée
                    </th>
                    <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-black text-text uppercase tracking-wide">
                      Utilisateurs
                    </th>
                    <th className="hidden xl:table-cell text-left px-4 py-3 text-xs font-black text-text uppercase tracking-wide">
                      Stockage
                    </th>
                    <th className="hidden xl:table-cell text-left px-4 py-3 text-xs font-black text-text uppercase tracking-wide">
                      Animaux
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-black text-text uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((plan) => {
                    const accent = getAccent(plan);
                    const CycleIcon = CYCLE_ICON[plan.billingCycle];
                    return (
                      <tr
                        key={plan.id}
                        className="border-b border-btn/20 last:border-0 hover:bg-bg_dash/60 transition-all cursor-pointer"
                        onClick={() => setDetailItem(plan)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-8 w-1.5 rounded-full shrink-0 ${accent.bar}`}
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-darkText truncate">
                                {plan.name}
                              </div>
                              {plan.description && (
                                <div className="max-w-[220px] truncate text-xs text-text">
                                  {plan.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-black px-2 py-1 rounded-lg ${accent.bg} ${accent.text}`}
                          >
                            <CycleIcon className="w-3 h-3" />
                            {CYCLE_LABEL[plan.billingCycle]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-black ${accent.text}`}>
                            {formatPrice(plan.price)}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-4 py-3 text-sm text-text">
                          {plan.durationDays} j
                        </td>
                        <td className="hidden lg:table-cell px-4 py-3 text-sm text-text">
                          {plan.userLimit}
                        </td>
                        <td className="hidden xl:table-cell px-4 py-3 text-sm text-text">
                          {plan.storageLimit} Mo
                        </td>
                        <td className="hidden xl:table-cell px-4 py-3 text-sm text-text">
                          {plan.animalLimit}
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingItem(plan);
                                setShowForm(true);
                              }}
                              className="p-1.5 rounded-lg text-text hover:text-bleu hover:bg-bleu/10 transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(plan)}
                              className="p-1.5 rounded-lg text-text hover:text-rouge hover:bg-rouge/10 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-2">
            {filtered.map((plan) => {
              const accent = getAccent(plan);
              const CycleIcon = CYCLE_ICON[plan.billingCycle];
              return (
                <div
                  key={plan.id}
                  className="bg-white border border-btn/30 rounded-2xl p-4 shadow-sm cursor-pointer relative overflow-hidden"
                  onClick={() => setDetailItem(plan)}
                >
                  <span
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${accent.bar}`}
                  />
                  <div className="flex items-start justify-between gap-2 pl-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-lg ${accent.bg} ${accent.text}`}
                        >
                          <CycleIcon className="w-3 h-3" />
                          {CYCLE_LABEL[plan.billingCycle]}
                        </span>
                      </div>
                      <p className="text-sm font-black text-darkText">
                        {plan.name}
                      </p>
                      {plan.description && (
                        <p className="text-xs text-text mt-0.5 truncate">
                          {plan.description}
                        </p>
                      )}
                      <p className="text-xs text-text mt-0.5">
                        <span className={`font-semibold ${accent.text}`}>
                          {formatPrice(plan.price)}
                        </span>{" "}
                        · {plan.durationDays} j · {plan.userLimit} util. ·{" "}
                        {plan.storageLimit} Mo · {plan.animalLimit} animaux
                      </p>
                    </div>
                    <div
                      className="flex flex-col items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingItem(plan);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-xl text-text hover:text-bleu hover:bg-bleu/10 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(plan)}
                        className="p-2 rounded-xl text-text hover:text-rouge hover:bg-rouge/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPage > 1 && (
            <div className="flex items-center justify-between text-sm text-text bg-white rounded-2xl px-4 py-3 border border-btn/30 shadow-sm">
              <span className="font-semibold">
                Page {pagination.page} sur {pagination.totalPage}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-btn/40 px-3 py-1.5 font-semibold hover:bg-bg_dash disabled:opacity-40 transition-all"
                >
                  Précédent
                </button>
                <button
                  disabled={page >= pagination.totalPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border border-btn/40 px-3 py-1.5 font-semibold hover:bg-bg_dash disabled:opacity-40 transition-all"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      {showForm && (
        <PlanFormModal
          plan={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingItem(null);
            refresh();
          }}
        />
      )}

      {detailItem && (
        <DetailModal
          plan={detailItem}
          accent={getAccent(detailItem)}
          onClose={() => setDetailItem(null)}
          onEdit={() => {
            setEditingItem(detailItem);
            setDetailItem(null);
            setShowForm(true);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          planName={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default GestionOffres;