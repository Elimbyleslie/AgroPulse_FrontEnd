/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/Barn/BarnDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { getAllBarns, deleteBarn } from "../../store/barn/action";
import { getAllPens } from "../../store/pen/action";
import { getAllHerds } from "../../store/herd/action";
import BarnForm from "../../components/Modal/Barn";
import { Barn } from "../../models/barn";
import {
  Home,
  Trash2,
  Plus,
  Search,
  X,
  Loader2,
  Edit2,
  Users,
  Calendar,
  Fence,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BarnDashboardProps {
  farmId: number;
  onGoToTab: (target: "pens" | "herds", barnId: number) => void; 

}

type AddTab = "pen" | "herd";

const BarnList: React.FC<BarnDashboardProps> = ({ farmId, onGoToTab }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { entities, isLoading } = useAppSelector((state: any) => state.barn);
  const { entities: pens, isLoading: loadingPens } = useAppSelector(
    (state: any) => state.pen,
  );
  const { entities: herds, isLoading: loadingHerds } = useAppSelector(
    (state: any) => state.herd,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarn, setSelectedBarn] = useState<Barn | null>(null);
  const [expandedBarn, setExpandedBarn] = useState<Barn | null>(null);
  const [addTab, setAddTab] = useState<AddTab>("pen");

  const barns = Array.isArray(entities) ? entities : [];
  const barnPens = Array.isArray(pens) ? pens : [];
  const barnHerds = Array.isArray(herds) ? herds : [];

  

  const fetchBarns = useCallback(
    (search: string) => {
      dispatch(getAllBarns({ farmId, search, page: 1, limit: 10 }));
    },
    [dispatch, farmId],
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBarns(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchBarns]);

  // Charge les enclos/troupeaux du bâtiment ouvert (lecture seule)
  useEffect(() => {
    if (expandedBarn) {
      dispatch(getAllPens({ farmId, barnId: expandedBarn.id, limit: 50 }));
      dispatch(getAllHerds({ farmId, barnId: expandedBarn.id, limit: 50 }));
    }
  }, [dispatch, farmId, expandedBarn]);

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bâtiment ?")) {
      dispatch(deleteBarn({ id }));
    }
  };

  const handleEdit = (barn: Barn) => {
    setSelectedBarn(barn);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBarn(null);
  };

  const openBarnPanel = (barn: Barn) => {
    setExpandedBarn(barn);
    setAddTab("pen");
  };

 const goCreatePen = () => {
    if (!expandedBarn) return;
    onGoToTab("pens", expandedBarn.id);
    setExpandedBarn(null); 
  };

  const goCreateHerd = () => {
    if (!expandedBarn) return;
    onGoToTab("herds", expandedBarn.id);
    setExpandedBarn(null);
  };

  const formatDate = (dateString: Date) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div>
      {/* HEADER & RECHERCHE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="text-vert" /> Gestion des Bâtiments
          </h2>
          <p className="text-gray-500 text-sm">
            Clique sur un bâtiment pour voir ses enclos et ses troupeaux.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher un bâtiment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vert outline-none w-64 transition-all"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-vert text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 transition"
          >
            <Plus size={18} /> Nouveau
          </button>
        </div>
      </div>

      {/* GRILLE DE BÂTIMENTS */}
      {isLoading && barns.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-vert" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {barns.map((barn: Barn) => (
              <motion.div
                key={barn.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => openBarnPanel(barn)}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-vert hover:shadow-lg transition-all group overflow-hidden cursor-pointer"
              >
                <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  {barn.photo ? (
                    <img
                      src={barn.photo}
                      alt={barn.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Home size={48} className="text-blue-600/30" />
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {barn.name}
                    </h3>
                    <span className="text-xs font-mono text-gray-400">
                      #BARN-{barn.id}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    {barn.capacity && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <Users size={16} className="text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Capacité</p>
                          <p className="font-bold text-gray-900">
                            {barn.capacity} animaux
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-100">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-xs">
                        Créé le {formatDate(barn.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(barn);
                      }}
                      className="flex-1 text-vert font-medium text-sm hover:bg-green-50 py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(barn.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => openBarnPanel(barn)}
                      className="p-2 text-vert hover:bg-green-50 rounded-lg transition"
                      title="Ouvrir"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && barns.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="text-gray-300" size={30} />
          </div>
          <p className="text-gray-500 font-medium">
            {searchTerm
              ? "Aucun bâtiment ne correspond à votre recherche."
              : "Aucun bâtiment enregistré pour cette ferme."}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-vert font-medium hover:underline"
          >
            Créer votre premier bâtiment
          </button>
        </div>
      )}

      {/* MODAL CRÉATION/MODIFICATION BÂTIMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {selectedBarn ? "Modifier le bâtiment" : "Nouveau bâtiment"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-2">
              <BarnForm
                farmId={farmId}
                barn={selectedBarn}
                onSuccess={() => {
                  handleCloseModal();
                  fetchBarns("");
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* PANNEAU BÂTIMENT — vue lecture seule des enclos/troupeaux */}
      <AnimatePresence>
        {expandedBarn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b bg-vert text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-bold">{expandedBarn.name}</h3>
                  <p className="text-sm opacity-80">
                    Enclos et troupeaux enregistrés dans ce bâtiment
                  </p>
                </div>
                <button
                  onClick={() => setExpandedBarn(null)}
                  className="hover:bg-white/20 p-2 rounded-xl transition"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="flex gap-1 px-6 pt-4 border-b border-gray-100 shrink-0">
                <button
                  onClick={() => setAddTab("pen")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                    addTab === "pen"
                      ? "border-vert text-vert"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Fence size={15} /> Enclos ({barnPens.length})
                </button>
                <button
                  onClick={() => setAddTab("herd")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                    addTab === "herd"
                      ? "border-vert text-vert"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Users size={15} /> Troupeaux ({barnHerds.length})
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {addTab === "pen" ? (
                  <>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={goCreatePen}
                        className="flex items-center gap-1.5 text-sm font-medium text-vert hover:bg-green-50 px-3 py-1.5 rounded-lg transition"
                      >
                        <Plus size={16} /> Ajouter un enclos
                      </button>
                    </div>

                    <div className="space-y-2">
                      {loadingPens && (
                        <Loader2 size={18} className="animate-spin text-gray-400 mx-auto" />
                      )}
                      {!loadingPens && barnPens.length === 0 && (
                        <div className="text-center py-10">
                          <Fence className="text-gray-200 mx-auto mb-2" size={36} />
                          <p className="text-sm text-gray-400">
                            Aucun enclos dans ce bâtiment
                          </p>
                        </div>
                      )}
                      {!loadingPens &&
                        barnPens.map((pen: any) => (
                          <button
                            key={pen.id}
                            onClick={() => navigate(`/main/structure/pens/${pen.id}`)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-vert hover:bg-green-50/40 transition text-left"
                          >
                            <span className="text-sm font-semibold text-darkText">
                              {pen.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              Capacité {pen.capacity ?? "N/A"}
                            </span>
                          </button>
                        ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={goCreateHerd}
                        className="flex items-center gap-1.5 text-sm font-medium text-vert hover:bg-green-50 px-3 py-1.5 rounded-lg transition"
                      >
                        <Plus size={16} /> Ajouter un troupeau
                      </button>
                    </div>

                    <div className="space-y-2">
                      {loadingHerds && (
                        <Loader2 size={18} className="animate-spin text-gray-400 mx-auto" />
                      )}
                      {!loadingHerds && barnHerds.length === 0 && (
                        <div className="text-center py-10">
                          <Users className="text-gray-200 mx-auto mb-2" size={36} />
                          <p className="text-sm text-gray-400">
                            Aucun troupeau dans ce bâtiment
                          </p>
                        </div>
                      )}
                      {!loadingHerds &&
                        barnHerds.map((herd: any) => (
                          <button
                            key={herd.id}
                            onClick={() => navigate(`/main/structure/herds/${herd.id}`)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-vert hover:bg-green-50/40 transition text-left"
                          >
                            <span className="text-sm font-semibold text-darkText">
                              {herd.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {herd.species?.name ?? ""}
                            </span>
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BarnList;