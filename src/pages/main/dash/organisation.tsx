/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  fetchWithAuthOrganizationById,
} from "../../../store/organization/action";
import {
  selectCurrentOrganization,
  selectCurrentOrganizationStatus,
  selectCurrentOrganizationError,
} from "../../../store/organization/slice";
import { getAllFarms } from "../../../store/farm/action";
import { selectFarmEntities, selectFarmList } from "../../../store/farm/slice";
import { selectRoles } from "../../../store/Role&Permission/slice";
import { fetchRoles } from "../../../store/Role&Permission/action";
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
} from "lucide-react";
import InviteModal from "../../../components/Modal/InvitationModal";

const Spinner = () => (
  <svg className="animate-spin w-6 h-6 text-vert" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const useOrganizationId = (): number | undefined => {
  return useAppSelector(
    (state) => state.authentification.auth.user?.ownedOrganizations?.at(0)?.id,
  );
};

const OrganizationDetailPage: React.FC = () => {
  const organizationId = useOrganizationId();
  const dispatch = useAppDispatch();

  const organization = useAppSelector(selectCurrentOrganization) as any;
  const orgStatus = useAppSelector(selectCurrentOrganizationStatus);
  const orgError = useAppSelector(selectCurrentOrganizationError);
  const allFarms = useAppSelector(selectFarmEntities);
  const farmListState = useAppSelector(selectFarmList);
  const roles = useAppSelector(selectRoles);

  const [showInvite, setShowInvite] = useState(false);

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

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const orgFarms = (allFarms ?? []).filter(
    (f: any) => f.organizationId === organizationId,
  );

  // Pas d'organisation rattachée à ce compte — pas une erreur réseau, un état
  // légitime (ex: compte pas encore propriétaire d'org). Ne boucle pas sur le spinner.
  if (organizationId == null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <Building2 className="w-8 h-8 text-gray-200" />
        <p className="text-sm font-semibold text-gray-500">
          Aucune organisation associée à ce compte
        </p>
      </div>
    );
  }

  if (orgStatus === "rejected") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertTriangle className="w-8 h-8 text-rouge" />
        <p className="text-sm font-semibold text-gray-600">
          Impossible de charger l'organisation
        </p>
        {orgError?.meta?.message && (
          <p className="text-xs text-gray-400">{orgError.meta.message}</p>
        )}
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-vert" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-darkText tracking-tight">
                {organization.name}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {organization.email || organization.phone || "Aucun contact renseigné"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition shadow-sm shadow-emerald-200 flex-shrink-0"
          >
            <Link2 className="w-4 h-4" /> Inviter un membre
          </button>
        </div>
      </div>

      {/* Infos organisation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-400 mb-0.5">Propriétaire</p>
          <p className="text-sm font-bold text-gray-800">{organization.ownerName ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 mb-0.5">Adresse</p>
          <p className="text-sm font-bold text-gray-800">{organization.address ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 mb-0.5">Fermes</p>
          <p className="text-sm font-bold text-gray-800">{orgFarms.length}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 mb-0.5">Membres</p>
          <p className="text-sm font-bold text-gray-800">
            {organization.users?.length ?? "—"}
          </p>
        </div>
      </div>

      {/* Liste des fermes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-darkText">Fermes</h2>
          <Link
            to={`/farms/new?organizationId=${organizationId}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-vert hover:text-dark_vert transition"
          >
            <Plus className="w-4 h-4" /> Ajouter une ferme
          </Link>
        </div>

        {farmListState.status === "pending" ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : orgFarms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <MapPin className="w-8 h-8 text-gray-200" />
            <p className="font-semibold text-gray-500 text-sm">
              Aucune ferme pour cette organisation
            </p>
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
                  <p className="text-xs text-gray-400 truncate">
                    {farm.location || "Localisation non renseignée"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Membres (aperçu simple ; à enrichir plus tard avec rôles/fermes assignées) */}
      {organization.users && organization.users.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-darkText mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" /> Membres
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {organization.users.map((u: any) => (
              <div key={u.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showInvite && (
        <InviteModal
          organizationId={organizationId}
          organizationName={organization.name}
          farms={orgFarms.map((f: any) => ({ id: f.id, name: f.name }))}
          roles={roles}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
};

export default OrganizationDetailPage;