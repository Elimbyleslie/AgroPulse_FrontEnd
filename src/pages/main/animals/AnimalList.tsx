/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/store";
import {
  Search, Dog, Edit, Trash2, Eye, Plus, AlertTriangle,
  ChevronLeft, ChevronRight,
} from "lucide-react";

import { env } from "../../../constants/env";
import Modal from "../../../components/UI/Modal";
import AnimalForm from "../../../components/Modal/AnimalForm";
import CustomSelect from "../../../components/UI/CustomSelect";
import { deleteAnimal, getAllAnimals } from "../../../store/animal/action";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Animal  } from "../../../models/animal";
import { Farm } from "../../../models/farm";
import { getUserFarms } from "../../../store/farm/action";

// ─── Helper : normalise n'importe quelle valeur en tableau ───────────────────
function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

const AnimalList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // ─── Store ───────────────────────────────────────────────────────────────
  const { entities: animalsRaw, status } = useAppSelector(
    (state) => state.animal.animalist
  );
  const farmsRaw = useAppSelector((state) => state.farms.farmList.entities);

  // ─── Normalisation garantie en tableau ───────────────────────────────────
  const animals: Animal[] = useMemo(() => toArray(animalsRaw), [animalsRaw]);
  const farms: Farm[]     = useMemo(() => toArray(farmsRaw),   [farmsRaw]);

  // ─── Ferme active (première ferme par défaut) ────────────────────────────
  const defaultFarmId = farms[0]?.id;

      console.log("Chargement des animaux pour la ferme ID:", defaultFarmId);


  // ─── États locaux ────────────────────────────────────────────────────────
  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedFarm,     setSelectedFarm]     = useState<string>("all");
  const [selectedSpecies,  setSelectedSpecies]  = useState<string>("all");
  const [selectedGender,   setSelectedGender]   = useState<string>("all");
  const [selectedStatus,   setSelectedStatus]   = useState<string>("all");
  const [currentPage,      setCurrentPage]      = useState(1);
  const itemsPerPage = 10;

  // ─── Modaux ──────────────────────────────────────────────────────────────
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [animalToDelete,    setAnimalToDelete]    = useState<Animal | null>(null);
  const [animalToUpdate,    setAnimalToUpdate]    = useState<Animal | null>(null);

  // ─── Hydratation fermes si le store est vide ─────────────────────────────
useEffect(() => {
  if (farms.length === 0) {
    dispatch(getUserFarms());
  }
}, [dispatch, farms.length]);

// ─── Chargement des animaux (réactif au farmId disponible) ───────────────
useEffect(() => {
  const activeFarmId =
    selectedFarm !== "all" ? Number(selectedFarm) : defaultFarmId;

  if (!activeFarmId) return;

  dispatch(getAllAnimals({ limit: 100, farmId: activeFarmId })).unwrap()
    .catch((err: any) => toast.error(err?.message || "Erreur de chargement"));
}, [dispatch, selectedFarm, defaultFarmId]);

  // ─── Utilitaire : âge ────────────────────────────────────────────────────
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "-";
    const birth  = new Date(birthDate);
    const now    = new Date();
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());

    if (months < 0)  return "Nouveau-né";
    if (months < 12) return `${months} mois`;
    const years          = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years} an(s) ${remainingMonths} m` : `${years} an(s)`;
  };

  // ─── Filtrage ─────────────────────────────────────────────────────────────
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchesSearch  = animal.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFarm    = selectedFarm    === "all" || animal.farmId === Number(selectedFarm);
      const matchesSpecies = selectedSpecies === "all" || animal.species?.name === selectedSpecies;
      const matchesGender  = selectedGender  === "all" || animal.gender === selectedGender;
      const matchesStatus  = selectedStatus  === "all" || animal.status === selectedStatus;
      return matchesSearch && matchesFarm && matchesSpecies && matchesGender && matchesStatus;
    });
  }, [animals, searchTerm, selectedFarm, selectedSpecies, selectedGender, selectedStatus]);

  // ─── Pagination ───────────────────────────────────────────────────────────
  const totalPages      = Math.ceil(filteredAnimals.length / itemsPerPage);
  const paginatedAnimals = filteredAnimals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ─── Espèces uniques ──────────────────────────────────────────────────────
  const uniqueSpecies = useMemo(() => {
    const names = [...new Set(animals.map((a) => a.species?.name).filter(Boolean) as string[])];
    return names.map((name) => ({ value: name, label: name }));
  }, [animals]);

  // ─── Refresh ──────────────────────────────────────────────────────────────
  const refreshData = () => {
    const activeFarmId =
      selectedFarm !== "all" ? Number(selectedFarm) : defaultFarmId;
    if (!activeFarmId) return;
    dispatch(getAllAnimals({ limit: 100, farmId: activeFarmId }));
  };

  // ─── Suppression ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!animalToDelete) return;
    try {
      await dispatch(deleteAnimal(animalToDelete.id)).unwrap();
      toast.success("Animal supprimé");
      setIsDeleteModalOpen(false);
      refreshData();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la suppression");
    }
  };

  // ─── Options des selects ──────────────────────────────────────────────────
  const genderOptions = [
    { value: "all",    label: "Genre (Tous)" },
    { value: "male",   label: "♂ Mâle" },
    { value: "female", label: "♀ Femelle" },
  ];
  const statusOptions = [
    { value: "all",         label: "Statut (Tous)" },
    { value: "active",      label: "Actif" },
    { value: "sold",        label: "Vendu" },
    { value: "dead",        label: "Décédé" },
    { value: "transferred", label: "Transféré" },
  ];

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen pt-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Cheptel</h1>
          <p className="text-gray-500 text-sm">
          Total : {filteredAnimals.length} animal(aux) trouvé(s)
          </p>
        </div>
        <button
          onClick={() => { setAnimalToUpdate(null); setIsUpdateModalOpen(true); }}
          disabled={!defaultFarmId}
          className="bg-green-600 max-w-52 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition shadow-lg shadow-green-100"
        >
          <Plus size={18} /> Ajouter un animal
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1 max-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par Référence..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="grid grid-cols-2 md:flex items-center gap-2">
            <CustomSelect
              options={[
                { value: "all", label: "Fermes (Toutes)" },
                ...farms.map((f) => ({ value: String(f.id), label: f.name })),
              ]}
              value={selectedFarm}
              onChange={(val) => { setSelectedFarm(val); setCurrentPage(1); }}
              placeholder="Fermes"
            />
            <CustomSelect
              options={[
                { value: "all", label: "Espèces (Toutes)" },
                ...uniqueSpecies,
              ]}
              value={selectedSpecies}
              onChange={(val) => { setSelectedSpecies(val); setCurrentPage(1); }}
              placeholder="Espèce"
            />
            <CustomSelect
              options={genderOptions}
              value={selectedGender}
              onChange={(val) => { setSelectedGender(val); setCurrentPage(1); }}
              placeholder="Genre"
            />
            <CustomSelect
              options={statusOptions}
              value={selectedStatus}
              onChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
              placeholder="Statut"
            />
          </div>
        </div>
      </div>

      {/* État vide ou chargement */}
      {status === "pending" && (
        <div className="flex justify-center items-center py-20 text-gray-400 gap-3">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          Chargement des animaux...
        </div>
      )}

      {status !== "pending" && !defaultFarmId && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
          <AlertTriangle size={36} className="text-yellow-400" />
          <p className="font-medium">Aucune ferme disponible.</p>
          <p className="text-sm">Créez d'abord une ferme pour gérer vos animaux.</p>
        </div>
      )}

      {status !== "pending" && defaultFarmId && (
        <>
          {/* Tableau */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-6 py-4">Animal</th>
                    <th className="px-6 py-4">Espèce / Race</th>
                    <th className="px-6 py-4">Âge</th>
                    <th className="px-6 py-4">Genre</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedAnimals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400">
                        <Dog size={36} className="mx-auto mb-3 opacity-30" />
                        Aucun animal trouvé
                      </td>
                    </tr>
                  ) : (
                    paginatedAnimals.map((animal) => (
                      <tr key={animal.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                              {animal.photo &&
                              animal.photo !== "undefined" &&
                              animal.photo !== "/uploads/animals/undefined" ? (
                                <img
                                  src={`${env.noreact}${animal.photo}`}
                                  alt={animal.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Dog size={20} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{animal.name}</div>
                              <div className="text-[10px] text-gray-400 uppercase tracking-tight">
                                Poids : {animal.weight} kg
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 font-medium">{animal.species?.name}</div>
                          <div className="text-xs text-gray-500">{animal.breed?.name || "Race non spécifiée"}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {calculateAge(animal.birthDate)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`capitalize ${animal.gender === "male" ? "text-bleu" : "text-pink-600"}`}>
                            {animal.gender === "male" ? "♂ Mâle" : "♀ Femelle"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            animal.status === "active"      ? "bg-green-100 text-vert"  :
                            animal.status === "sold"        ? "bg-blue-100 text-bleu"   :
                            animal.status === "transferred" ? "bg-purple-100 text-purple-600" :
                                                              "bg-red-100 text-rouge"
                          }`}>
                            {animal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            {/* Voir */}
                            <div className="relative group flex items-center justify-center">
                              <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-darkText text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                                Voir la fiche
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-darkText" />
                              </div>
                              <button
                                onClick={() => navigate(`/main/animals/${animal.id}`)}
                                className="p-2 text-bleu hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye size={18} />
                              </button>
                            </div>
                            {/* Modifier */}
                            <div className="relative group flex items-center justify-center">
                              <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-darkText text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                                Modifier
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-darkText" />
                              </div>
                              <button
                                onClick={() => { setAnimalToUpdate(animal); setIsUpdateModalOpen(true); }}
                                className="p-2 text-jaune hover:bg-amber-50 rounded-lg"
                              >
                                <Edit size={18} />
                              </button>
                            </div>
                            {/* Supprimer */}
                            <div className="relative group flex items-center justify-center">
                              <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-darkText text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                                Supprimer
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-darkText" />
                              </div>
                              <button
                                onClick={() => { setAnimalToDelete(animal); setIsDeleteModalOpen(true); }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {currentPage} sur {totalPages || 1} — {filteredAnimals.length} résultat(s)
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="p-2 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-100 transition"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="p-2 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-100 transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Suppression */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmation">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={30} />
          </div>
          <h3 className="font-bold text-lg text-gray-900">Supprimer {animalToDelete?.name} ?</h3>
          <p className="text-sm text-gray-500 mt-2">Cette action est irréversible.</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-xl font-bold">
              Annuler
            </button>
            <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold">
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Ajout / Modification */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={animalToUpdate ? "Modifier l'animal" : "Ajouter un animal"}
      >
        <AnimalForm
          onSuccess={() => { setIsUpdateModalOpen(false); refreshData(); }}
          farmId={defaultFarmId}
          initialData={animalToUpdate}
        />
      </Modal>
    </div>
  );
};

export default AnimalList;