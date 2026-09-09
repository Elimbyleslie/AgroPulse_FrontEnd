/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  createInvitation,
  getOrganizationInvitations,
  deleteInvitation,
} from "../../../store/administration/inviteAction";
import { PATH_AUTH } from "../../../constants/paths";
import { getAllFarms } from "../../../store/farm/action";
import { fetchRoles } from "../../../store/Role&Permission/action";
import { selectRoles } from "../../../store/Role&Permission/slice";
import {
  selectInvitations,
  selectInvitationListState,
  selectInvitationCreateState,
  resetInvitationCreateState,
} from "../../../store/administration/inviteSlice";
import { selectFarmEntities } from "../../../store/farm/slice";
import {
  fetchWithAuthOrganizationById,
} from "../../../store/organization/action";
import { selectCurrentOrganization } from "../../../store/organization/slice";
import { Invitation } from "../../../models/invitations";
import SelectInput from "../../../components/UI/SelectInput";
import { toast } from "react-toastify";
import {
  Link2,
  Plus,
  Copy,
  Trash2,
  Users,
  Clock,
  Infinity as InfinityIcon,
  X,
  Check,
} from "lucide-react";

// ⚠️ Dupliqué depuis OrganizationDetailPage. À terme, extrayez ce hook dans
// un fichier partagé (ex: hooks/useOrganizationId.ts) pour éviter la divergence.
const useOrganizationId = (): number | undefined => {
  return useAppSelector((state: any) => {
    const user = state.authentification.auth.user;
    return (
      user?.ownedOrganizations?.at(0)?.id ??
      user?.defaultOrganizationId ??
      user?.memberOrganizations?.at(0)?.id
    );
  });
};

const buildInviteLink = (token: string) =>
  `${window.location.origin}${PATH_AUTH.REGISTER}?token=${token}`;

type InvitationStatus = "active" | "expired" | "exhausted";

const getInvitationStatus = (inv: Invitation): InvitationStatus => {
  if (inv.expiresAt && new Date(inv.expiresAt).getTime() < Date.now()) return "expired";
  if (inv.maxUses !== null && inv.usedCount >= inv.maxUses) return "exhausted";
  return "active";
};

const STATUS_STYLE: Record<InvitationStatus, { label: string; tint: string }> = {
  active: { label: "Active", tint: "bg-emerald-100 text-vert" },
  expired: { label: "Expirée", tint: "bg-gray-100 text-gray-500" },
  exhausted: { label: "Épuisée", tint: "bg-amber-100 text-amber-700" },
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; tint: string }> = ({
  label,
  value,
  icon,
  tint,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
    <div>
      <p className="text-xl font-black text-darkText leading-none">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  </div>
);

// ── Modal de création ────────────────────────────────────────────────────
const CreateInvitationModal: React.FC<{
  organizationId: number;
  onClose: () => void;
}> = ({ organizationId, onClose }) => {
  const dispatch = useAppDispatch();
  const createState = useAppSelector(selectInvitationCreateState);
  const farms = useAppSelector(selectFarmEntities);
  const roles = useAppSelector(selectRoles);

  const [farmId, setFarmId] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState("");
  const [unlimited, setUnlimited] = useState(false);
  const [maxUses, setMaxUses] = useState("1");

  // Données du formulaire — pas de refetch de l'organisation ici,
  // la page parente s'en charge déjà (évite la dépendance circulaire).
  useEffect(() => {
    dispatch(getAllFarms({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  // Initialise le rôle par défaut dès que la liste est chargée
  useEffect(() => {
    if (!roleId && roles?.length > 0) {
      setRoleId(String(roles[0].id));
    }
  }, [roles, roleId]);

  const orgFarms = useMemo(
    () => farms.filter((f: any) => f.organizationId === organizationId),
    [farms, organizationId],
  );

  const handleSubmit = async () => {
    if (!roleId) {
      toast.error("Le rôle est obligatoire");
      return;
    }
    try {
      await dispatch(
        createInvitation({
          organizationId,
          data: {
            farmId: farmId ? Number(farmId) : undefined,
            roleId: Number(roleId),
            expiresAt: expiresAt || undefined,
            maxUses: unlimited ? null : Number(maxUses) || 1,
          },
        }),
      ).unwrap();
      toast.success("Invitation créée");
      dispatch(resetInvitationCreateState());
      onClose();
    } catch (err: any) {
      toast.error(err?.meta?.message || "Erreur lors de la création");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Link2 className="w-4 h-4 text-vert" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">Nouvelle invitation</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Rôle <span className="text-rouge">*</span>
            </label>
            <SelectInput
              value={roleId}
              onChange={(val) => setRoleId(String(val))}
              options={(roles ?? []).map((r: any) => ({ label: r.name, value: String(r.id) }))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Ferme concernée
            </label>
            <SelectInput
              value={farmId}
              placeholder="Toute l'organisation"
              onChange={(val) => setFarmId(String(val))}
              options={[
                { label: "Toute l'organisation", value: "" },
                ...orgFarms.map((f: any) => ({ label: f.name, value: String(f.id) })),
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Expiration
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nombre d'utilisations
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                disabled={unlimited}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className={`${inputClass} ${unlimited ? "opacity-40" : ""}`}
              />
              <button
                type="button"
                onClick={() => setUnlimited((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  unlimited
                    ? "bg-vert text-white border-vert"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                <InfinityIcon className="w-3.5 h-3.5" /> Illimité
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={createState.loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 hover:bg-dark_vert transition"
          >
            {createState.loading ? "Génération..." : "Générer le lien"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page principale ──────────────────────────────────────────────────────
const InvitationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const organizationId = useOrganizationId(); // ← source indépendante du slice organization
  const currentOrganization = useAppSelector(selectCurrentOrganization);

  const invitations = useAppSelector(selectInvitations);
  const listState = useAppSelector(selectInvitationListState);

  const [showForm, setShowForm] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Charge l'organisation pour affichage (nom dans l'en-tête), sans bloquer le bouton
  useEffect(() => {
    if (organizationId != null) {
      dispatch(fetchWithAuthOrganizationById(organizationId));
    }
  }, [dispatch, organizationId]);

  useEffect(() => {
    if (organizationId) dispatch(getOrganizationInvitations(organizationId));
  }, [dispatch, organizationId]);

  const stats = useMemo(() => {
    const counts = { active: 0, expired: 0, exhausted: 0 };
    invitations.forEach((inv) => {
      counts[getInvitationStatus(inv)] += 1;
    });
    return { ...counts, total: invitations.length };
  }, [invitations]);

  const handleCopy = async (inv: Invitation) => {
    try {
      await navigator.clipboard.writeText(buildInviteLink(inv.token));
      setCopiedId(inv.id);
      toast.success("Lien copié");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await dispatch(deleteInvitation(revokeTarget.id)).unwrap();
      toast.success("Invitation révoquée");
      setRevokeTarget(null);
    } catch {
      toast.error("Erreur lors de la révocation");
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-darkText tracking-tight">Invitations</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {currentOrganization?.name
              ? `Liens d'invitation pour ${currentOrganization.name}`
              : "Générez des liens pour inviter de nouveaux membres"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={!organizationId}
          className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition shadow-sm shadow-emerald-200 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Nouveau lien
        </button>
      </div>

      {organizationId == null ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Link2 className="w-10 h-10 text-gray-200" />
          <p className="font-semibold text-gray-500 text-sm">Aucune organisation associée à ce compte</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total" value={stats.total} icon={<Link2 className="w-5 h-5 text-gray-600" />} tint="bg-gray-100" />
            <StatCard label="Actives" value={stats.active} icon={<Check className="w-5 h-5 text-vert" />} tint="bg-emerald-100" />
            <StatCard label="Épuisées" value={stats.exhausted} icon={<Users className="w-5 h-5 text-amber-600" />} tint="bg-amber-100" />
            <StatCard label="Expirées" value={stats.expired} icon={<Clock className="w-5 h-5 text-gray-500" />} tint="bg-gray-100" />
          </div>

          {/* Liste */}
          {listState.loading ? (
            <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Chargement...</div>
          ) : invitations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Link2 className="w-10 h-10 text-gray-200" />
              <p className="font-semibold text-gray-500 text-sm">Aucune invitation générée</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {invitations.map((inv) => {
                const status = getInvitationStatus(inv);
                const style = STATUS_STYLE[status];
                return (
                  <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-4 h-4 text-vert" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {inv.farm?.name ?? "Toute l'organisation"}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-gray-400">
                        <span>Créée par {inv.creator?.name ?? "—"}</span>
                        <span>· Expire le {fmtDate(inv.expiresAt)}</span>
                        <span>
                          · {inv.usedCount}/{inv.maxUses ?? "∞"} utilisation(s)
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${style.tint}`}>
                      {style.label}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleCopy(inv)}
                        disabled={status !== "active"}
                        title="Copier le lien"
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        {copiedId === inv.id ? <Check className="w-3.5 h-3.5 text-vert" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setRevokeTarget(inv)}
                        title="Révoquer"
                        className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showForm && organizationId != null && (
        <CreateInvitationModal organizationId={organizationId} onClose={() => setShowForm(false)} />
      )}

      {revokeTarget && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setRevokeTarget(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 mb-1">Révoquer cette invitation ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              {revokeTarget.farm?.name ?? "Toute l'organisation"} — le lien ne sera plus utilisable.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRevokeTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleRevoke}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rouge text-white hover:bg-red-600 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationsPage;