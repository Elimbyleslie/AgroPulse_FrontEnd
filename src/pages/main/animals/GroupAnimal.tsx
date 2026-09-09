/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { fetchWithAuthOrganizations } from "../../../store/organization/action";
import { getAllFarms } from "../../../store/farm/action";
import { LoadingType } from "../../../models/store";
import { Home, Layers, Grid3x3, Users as UsersIcon, Filter } from "lucide-react";
import BarnList from "../barnList";
import LotDashboard from "../lotList";
import PenList from "../../../components/Modal/Pen/PenList";
import HerdList from "../../../components/Modal/Herd/HerdList";

type TabType = "barns" | "lots" | "pens" | "herds";

const TABS: { key: TabType; label: string; icon: any }[] = [
  { key: "barns", label: "Bâtiments", icon: Home },
  { key: "lots", label: "Lots", icon: Layers },
  { key: "pens", label: "Enclos", icon: Grid3x3 },
  { key: "herds", label: "Troupeaux", icon: UsersIcon },
];

const StructureDashboard = () => {
  const dispatch = useAppDispatch();

  const farms = useAppSelector((state: any) => state.farms.farmList.entities) ?? [];
  const farmStatus = useAppSelector((state: any) => state.farms.farmList.status);
  const orgStatus = useAppSelector((state: any) => state.organizations.organizationList.status);

  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [tab, setTab] = useState<TabType>("barns");
  const [prefillBarnId, setPrefillBarnId] = useState<number | null>(null);
  
  const goToTabWithBarn = (target: "pens" | "herds", barnId: number) => {
    setPrefillBarnId(barnId);
    setTab(target);
  };

  useEffect(() => {
    if (orgStatus === LoadingType.IDLE) {
      dispatch(fetchWithAuthOrganizations({ limit: 10 }));
    }
    if (farmStatus === LoadingType.IDLE) {
      dispatch(getAllFarms({ limit: 10 }));
    }
  }, [dispatch, orgStatus, farmStatus]);

  useEffect(() => {
    if (!selectedFarmId && farms.length > 0) {
      setSelectedFarmId(String(farms[0].id));
    }
  }, [farms, selectedFarmId]);

  const farmId = selectedFarmId ? Number(selectedFarmId) : undefined;



  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-darkText flex items-center gap-2">
              <Home className="text-vert" /> Structure de la ferme
            </h1>
            <p className="text-gray-500 text-sm">
              Bâtiments, lots, enclos et troupeaux — gérés séparément du tableau de bord.
            </p>
          </div>

          {farms.length > 1 && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg w-fit">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="text-sm font-semibold text-text outline-none bg-transparent cursor-pointer"
              >
                {farms.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-1 mb-8 border-b border-gray-100 bg-white rounded-t-2xl px-2 pt-2 -mx-2 sm:mx-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-all ${
                tab === key
                  ? "border-vert text-vert bg-green-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

          {!farmId ? (
          <p className="text-center text-gray-400 py-20">
            Aucune ferme disponible pour l'instant.
          </p>
        ) : (
          <>
            {tab === "barns" && (
              <BarnList farmId={farmId} onGoToTab={goToTabWithBarn} />
            )}
            {tab === "lots" && <LotDashboard farmId={farmId} />}
            {tab === "pens" && (
              <PenList
                farmId={farmId}
                initialBarnId={prefillBarnId ?? undefined}
                autoOpenCreate={!!prefillBarnId}
                onConsumedPrefill={() => setPrefillBarnId(null)}
              />
            )}
            {tab === "herds" && (
              <HerdList
                farmId={farmId}
                initialBarnId={prefillBarnId ?? undefined}
                autoOpenCreate={!!prefillBarnId}
                onConsumedPrefill={() => setPrefillBarnId(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StructureDashboard;