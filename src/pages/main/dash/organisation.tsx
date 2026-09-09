/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { fetchWithAuthOrganizationById } from "../../../store/organization/action";
import {
  selectCurrentOrganization,
  selectCurrentOrganizationStatus,
  selectCurrentOrganizationError,
} from "../../../store/organization/slice";
import { getAllFarms } from "../../../store/farm/action";
import { selectFarmEntities, selectFarmList } from "../../../store/farm/slice";
import FarmFormModal from "../../../components/Modal/FarmModal";
import {
  Building2,
  MapPin,
  Users,
  Plus,
  Link2,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
} from "lucide-react";

const Spinner = () => (
  <svg className="animate-spin w-6 h-6 text-vert" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

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

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; tint: string }> = ({
  icon,
  label,
  value,
  tint,
}) => (
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tint}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
    </div>
  </div>
);

const QuickLink: React.FC<{ to: string; icon: React.ReactNode; label: string; sub: string }> = ({
  to,
  icon,
  label,
  sub,
}) => (
  <Link
    to={to}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-emerald-200 hover:shadow-md transition flex items-center gap-3"
  >
    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-800">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
  </Link>
);

const OrganizationDetailPage: React.FC = () => {
  const organizationId = useOrganizationId();
  const dispatch = useAppDispatch();

  const organization = useAppSelector(selectCurrentOrganization) as any;
  const orgStatus = useAppSelector(selectCurrentOrganizationStatus);
  const orgError = useAppSelector(selectCurrentOrganizationError);
  const allFarms = useAppSelector(selectFarmEntities);
  const farmListState = useAppSelector(selectFarmList);

  const [showFarmForm, setShowFarmForm] = useState(false);

  const loadOrganization = () => {
    if (organizationId != null) {
      dispatch(fetchWithAuthOrganizationById(organizationId));
    }
  };

  useEffect(() => {
    loadOrganization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, organizationId]);

  useEffect(() => {
    dispatch(getAllFarms({ page: 1, limit: 100 }));
  }, [dispatch]);

  const orgFarms = (allFarms ?? []).filter((f: any) => f.organizationId === organizationId);

  if (organizationId == null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <Building2 className="w-8 h-8 text-gray-200" />
        <p className="text-sm font-semibold text-gray-500">Aucune organisation associée à ce compte</p>
      </div>
    );
  }

  if (orgStatus === "rejected") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertTriangle className="w-8 h-8 text-rouge" />
        <p className="text-sm font-semibold text-gray-600">Impossible de charger l'organisation</p>
        {orgError?.meta?.message && <p className="text-xs text-gray-400">{orgError.meta.message}</p>}
        <button
          onClick={loadOrganization}
          className="mt-1 flex items-center gap-2 px-4 py-2 bg-bleu text-white text-sm rounded-xl font-semibold hover:bg-darkBleu transition"
        >
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-20 min-h-screen bg-bg_dash">
      {/* Fil d'ariane */}
      <div>
        <Link
          to="/main/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Tableau de bord
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-vert" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-darkText tracking-tight">{organization.name}</h1>
              <p className="text-sm text-gray-400 mt-0.5">Propriétaire : {organization.ownerName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Infos organisation — enrichi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <InfoCard
          icon={<Building2 className="w-5 h-5 text-vert" />}
          label="Propriétaire"
          value={organization.ownerName ?? "—"}
          tint="bg-emerald-100"
        />
        <InfoCard
          icon={<MapPin className="w-5 h-5 text-bleu" />}
          label="Adresse"
          value={organization.address ?? "Non renseignée"}
          tint="bg-blue-50"
        />
        <InfoCard
          icon={<Mail className="w-5 h-5 text-amber-600" />}
          label="Email"
          value={organization.email ?? "Non renseigné"}
          tint="bg-amber-50"
        />
        <InfoCard
          icon={<Phone className="w-5 h-5 text-gray-600" />}
          label="Téléphone"
          value={organization.phone ?? "Non renseigné"}
          tint="bg-gray-100"
        />
      </div>

      {/* Accès rapides — remplace le bouton "Inviter un membre" par un lien vers la page dédiée */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <QuickLink
          to="/main/organization/invitations"
          icon={<Link2 className="w-5 h-5 text-vert" />}
          label="Invitations"
          sub="Générer et gérer les liens d'invitation"
        />
        <QuickLink
          to="/main/organization/members"
          icon={<Users className="w-5 h-5 text-vert" />}
          label="Membres"
          sub={`${orgFarms.length > 0 ? "Voir" : "Gérer"} les membres de l'organisation`}
        />
        <QuickLink
          to="/main/organization/settings"
          icon={<Building2 className="w-5 h-5 text-vert" />}
          label="Paramètres"
          sub="Modifier les informations de l'organisation"
        />
      </div>

      {/* Liste des fermes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-darkText">Fermes ({orgFarms.length})</h2>
          <button
            onClick={() => setShowFarmForm(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-vert hover:text-dark_vert transition"
          >
            <Plus className="w-4 h-4" /> Ajouter une ferme
          </button>
        </div>

        {farmListState.status === "pending" ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : orgFarms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <MapPin className="w-8 h-8 text-gray-200" />
            <p className="font-semibold text-gray-500 text-sm">Aucune ferme pour cette organisation</p>
            <button
              onClick={() => setShowFarmForm(true)}
              className="mt-1 flex items-center gap-2 px-4 py-2 bg-vert text-white text-sm rounded-xl font-semibold hover:bg-dark_vert transition"
            >
              <Plus className="w-4 h-4" /> Créer la première ferme
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {orgFarms.map((farm: any) => (
              <Link
                key={farm.id}
                to={`/farms/${farm.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-emerald-200 hover:shadow-md transition flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-bleu" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{farm.name}</p>
                  <p className="text-xs text-gray-400 truncate">{farm.location || "Localisation non renseignée"}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

   {showFarmForm && (
  <FarmFormModal
    organizationId={organizationId}
    onClose={() => setShowFarmForm(false)}
    onSuccess={() => {
      dispatch(getAllFarms({ page: 1, limit: 100 }));
      setShowFarmForm(false);
    }}
  />
)}
    </div>
  );
};

export default OrganizationDetailPage;