/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/store";
import { fetchFarmUsers, deleteFarmUser } from "../../../store/administration/action";
import { selectFarmUsers, selectFarmUsersState } from "../../../store/administration/slice";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { Trash2, UserPlus, Users } from "lucide-react";

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

const initials = (name?: string) =>
  name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

const MembersPage = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const farmId = currentFarm?.id;
  const farmUsers = useAppSelector(selectFarmUsers);
  const farmUsersState = useAppSelector(selectFarmUsersState);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (farmId) {
      dispatch(fetchFarmUsers({ farmId, limit: 50 }));
    }
  }, [dispatch, farmId]);

  const handleRemove = (id: number) => {
    dispatch(deleteFarmUser({ id }));
    setConfirmDeleteId(null);
  };

  const items = Array.isArray(farmUsers) ? farmUsers : [];

  return (
    <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-darkText tracking-tight">Membres</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {currentFarm?.name ? `Membres de ${currentFarm.name}` : "Sélectionnez une ferme"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md">
        <StatCard label="Membres actifs" value={items.length} icon={<Users className="w-5 h-5 text-vert" />} tint="bg-emerald-100" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {farmUsersState.loading && (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Chargement…</div>
        )}

        {!farmUsersState.loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <UserPlus className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500 text-sm">Aucun membre pour l'instant</p>
            <p className="text-xs text-gray-400">Générez une invitation depuis l'onglet Invitations</p>
          </div>
        )}

        {!farmUsersState.loading &&
          items.map((fu: any) => (
            <div key={fu.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-vert flex items-center justify-center text-xs font-bold flex-shrink-0">
                {initials(fu.user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{fu.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{fu.user?.email}</p>
              </div>

              {confirmDeleteId === fu.id ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">Confirmer ?</span>
                  <button
                    onClick={() => handleRemove(fu.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rouge text-white hover:bg-red-600 transition"
                  >
                    Retirer
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(fu.id)}
                  title="Retirer de la ferme"
                  className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default MembersPage;