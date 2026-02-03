/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/store";
import {
  Search,
  Dog,
  Edit,
  Trash2,
  Eye,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { env } from "../../../constants/env";
import Modal from "../../../components/UI/Modal";
import AnimalForm from "../../../components/Modal/AnimalForm";
import { deleteAnimal, getAllAnimals } from "../../../store/animal/action";
import { getAllFarms } from "../../../store/farm/action";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../../components/UI/CustomSelect";
import SpeciesSelect from "../../../components/UI/Species";

const AnimalList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // --- Données du Store ---
  const {
    entities: animals,
    pagination,
    status,
  } = useAppSelector((state) => state.animal.pagination);
  const farms = useAppSelector((state) => state.farms.farmList.entities) ?? [];

  // --- États locaux (Filtres & Pagination) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  const [selectedSpecies, setSelectedSpecies] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- États Modaux ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<any>(null);
  const [animalToUpdate, setAnimalToUpdate] = useState<any>(null);

  useEffect(() => {
    // 1. Charger les fermes si nécessaire
    if (farms.length === 0) {
      dispatch(getAllFarms({ limit: 100 }));
      return;
    }

    // 2. Déterminer la ferme active
    const activeFarmId =
      selectedFarm !== "all" ? Number(selectedFarm) : farms[0]?.id;

    if (!activeFarmId) {
      console.log("⏳ En attente d'une ferme valide...");
      return;
    }

    dispatch(
      getAllAnimals({
        limit: 100,
        farmId: activeFarmId,
      }),
    ).unwrap();
  }, [dispatch, selectedFarm, farms.length]);

  // --- Utilitaire : Calcul de l'âge ---
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "-";
    const birth = new Date(birthDate);
    const now = new Date();
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());

    if (months < 0) return "Nouveau-né";
    if (months < 12) return `${months} mois`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0
      ? `${years} an(s) ${remainingMonths} m`
      : `${years} an(s)`;
  };

  // --- Filtrage côté client ---
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchesSearch = animal.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFarm =
        selectedFarm === "all" || animal.farmId === Number(selectedFarm);
      const matchesSpecies =
        selectedSpecies === "all" || animal.species?.name === selectedSpecies;
      const matchesGender =
        selectedGender === "all" || animal.gender === selectedGender;
      const matchesStatus =
        selectedStatus === "all" || animal.status === selectedStatus;

      return (
        matchesSearch &&
        matchesFarm &&
        matchesSpecies &&
        matchesGender &&
        matchesStatus
      );
    });
  }, [
    animals,
    searchTerm,
    selectedFarm,
    selectedSpecies,
    selectedGender,
    selectedStatus,
  ]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);
  const paginatedAnimals = filteredAnimals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Extraire les espèces uniques pour le filtre
  const uniqueSpecies = useMemo(() => {
    const speciesNames = animals
      .map((a) => a.species?.name)
      .filter((n): n is string => !!n);

    const speciesSet = new Set(speciesNames);
    return Array.from(speciesSet).map((name) => ({ value: name, label: name }));
  }, [animals]);

  // --- Actions ---
  const handleDelete = async () => {
    if (!animalToDelete) return;
    try {
      await dispatch(deleteAnimal(animalToDelete.id)).unwrap();
      toast.success("Animal supprimé");
      setIsDeleteModalOpen(false);
      refreshData();
    } catch (error: any) {
      toast.error(error?.message || "Erreur");
    }
  };

    const [selectedFarmId, setSelectedFarmId] = useState<string>("all");
  
  const refreshData = () => {
    if (farms.length > 0) {
          dispatch(getAllAnimals({ 
            limit: 10, 
            farmId: selectedFarmId === "all" ? farms[0].id : Number(selectedFarmId) 
          }));
        }
  };

  const genderOptions = [
    { value: "all", label: "Genre (Tous)" },
    { value: "male", label: "♂ Mâle" },
    { value: "female", label: "♀ Femelle" },
  ];

  const statusOptions = [
    { value: "all", label: " Status (Tous)" },
    { value: "active", label: "Actif" },
    { value: "sold", label: "Vendu" },
    { value: "dead", label: "Décédé" },
    { value: "transferred", label:"Transferré"}
  ]


  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen pt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div> 
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion du Cheptel
          </h1>
          <p className="text-gray-500 text-sm">
            Total : {filteredAnimals.length} animaux filtrés
          </p>
        </div>
        <button
          onClick={() => {
            setAnimalToUpdate(null);
            setIsUpdateModalOpen(true);
          }}
          className="bg-green-600 max-w-52 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition shadow-lg shadow-green-100"
        >
          <Plus size={18} /> Ajouter un animal
        </button>
      </div>

      {/* Barre de Filtres Avancés */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 mb-6">
        <div className="flex flex-col  gap-4">
          <div className="relative flex-1 max-w-56">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2  md:flex items-center gap-2">
            <CustomSelect
              options={[
                { value: "all", label: "Fermes (Toutes)" },
                ...farms.map((f) => ({ value: String(f.id), label: f.name })),
              ]}
              value={selectedFarm}
              onChange={setSelectedFarm}
              placeholder="fermes"
            />
            <CustomSelect
            
              value={selectedSpecies}
              onChange={setSelectedSpecies}
              placeholder="Selectionner une espece"
              options={[
                { value: "all", label: "Espèces (Toutes)" },
                ...uniqueSpecies.map((s) => ({ value: s.value, label: s.label })),
              ]}
            />
            
            <CustomSelect
              options={genderOptions}
              value={selectedGender}
              onChange={setSelectedGender}
              placeholder="Sélectionner Genre"
            />
            <CustomSelect
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Sélectionner Statut"
            />
          </div>
        </div>
      </div>

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
              {paginatedAnimals.map((animal) => (
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
                              const parent = e.currentTarget.parentElement;
                              e.currentTarget.remove();
                              const icon = document.createElement("div");
                              icon.innerHTML =
                                '<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>';
                              parent?.appendChild(icon);
                            }}
                          />
                        ) : (
                          <Dog size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {animal.name}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-tight">
                          Poids: {animal.weight}kg
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 font-medium">
                      {animal.species?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {animal.breed?.name || "Race non spécifiée"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {calculateAge(animal.birthDate)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`capitalize ${animal.gender === "male" ? "text-bleu" : "text-pink-600"}`}
                    >
                      {animal.gender === "male" ? "♂ Mâle" : "♀ Femelle"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        animal.status === "active"
                          ? "bg-green-100 text-vert"
                          : animal.status === "sold"
                            ? "bg-blue-100 text-bleu"
                            : "bg-red-100 text-rouge"
                      }`}
                    >
                      {animal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1 ">
                      <div className="flex justify-end gap-1">
                        <div className="relative group flex items-center justify-center">
                          <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-darkText text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                            Voir la fiche
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-darkText"></div>
                          </div>

                          <button
                            onClick={() =>
                              navigate(`/main/animals/${animal.id}`)
                            }
                            className="p-2 text-bleu hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="relative group flex items-center justify-center">
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-darkText text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                          Modifier
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-darkText"></div>
                        </div>

                        <button
                          onClick={() => {
                            setAnimalToUpdate(animal);
                            setIsUpdateModalOpen(true);
                            refreshData();
                          }}
                          className="p-2 text-jaune hover:bg-amber-50 rounded-lg"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                      <div className="relative group flex items-center justify-center">
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-darkText text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                          Supprimer
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-darkText"></div>
                        </div>
                        <button
                          onClick={() => {
                            setAnimalToDelete(animal);
                            setIsDeleteModalOpen(true);
                            refreshData();
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {currentPage} sur {totalPages || 1}
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmation"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={30} />
          </div>
          <h3 className="font-bold text-lg text-gray-900">
            Supprimer {animalToDelete?.name} ?
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Cette action est irréversible.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-2 bg-gray-100 rounded-xl font-bold"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                handleDelete();
                refreshData();
              }}
              className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={animalToUpdate ? "Modifier l'animal" : "Ajouter un animal"}
      >
        <AnimalForm
          onSuccess={() => {
            setIsUpdateModalOpen(false);
            refreshData();
          }}
          farmId={farms[0]?.id}
          initialData={animalToUpdate}
        />
      </Modal>
    </div>
  );
};

export default AnimalList;
