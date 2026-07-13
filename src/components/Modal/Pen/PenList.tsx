
import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { getAllPens, deletePen } from '../../../store/pen/action';
import { 
  Grid3x3, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  Loader2, 
  Users,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PenForm from './PenForm';
import Button from '../../UI/Button';
import { Pen } from '../../../models/pen';

interface PenListProps {
  farmId: number;
}

const PenList: React.FC<PenListProps> = ({ farmId }) => {
  const dispatch = useAppDispatch();
  const { entities, isLoading } = useAppSelector((state) => state.pen);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPen, setSelectedPen] = useState<Pen | null>(null);

  // Fonction de chargement des données
  const fetchPens = useCallback((search: string) => {
    dispatch(getAllPens({ farmId, search, page: 1, limit: 50 }));
  }, [dispatch, farmId]);

  // Effet pour la recherche en temps réel (Debounce de 500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPens(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchPens]);

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enclos ?")) {
      dispatch(deletePen({ id }));
    }
  };

  const handleEdit = (pen: Pen) => {
    setSelectedPen(pen);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPen(null);
  };

  return (
    <div>
      {/* HEADER & RECHERCHE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Grid3x3 className="text-vert" /> Gestion des Zones/Enclos
          </h2>
          <p className="text-gray-500 text-sm">
            Organisez vos zones d'élevage par bâtiment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un enclos..."
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

      {/* GRILLE D'ENCLOS */}
      {isLoading && entities.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-vert" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {(Array.isArray(entities) ? entities : []).map((pen) => (
              <motion.div
                key={pen.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-vert hover:shadow-lg transition-all group overflow-hidden"
              >
                {/* En-tête */}
                <div className="relative h-24 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                  <Grid3x3 size={40} className="text-vert/30" />
                </div>

                {/* Contenu principal */}
                <div className="p-5 space-y-3">
                  {/* Nom et ID */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{pen.name}</h3>
                    <span className="text-xs font-mono text-gray-400">#PEN-{pen.id}</span>
                  </div>

                  {/* Informations */}
                  <div className="space-y-2 text-sm">
                    {/* Bâtiment */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Home size={14} className="text-vert" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Bâtiment</p>
                        <p className="font-medium text-gray-900 truncate">
                          #{pen.barnId}
                        </p>
                      </div>
                    </div>

                    {/* Capacité */}
                    {pen.capacity && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <Users size={14} className="text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Capacité</p>
                          <p className="font-bold text-gray-900">
                            {pen.capacity} animaux
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <Button 
                      onClick={() => handleEdit(pen)}
                      className="flex-1 text-vert font-medium text-sm hover:bg-purple-50 py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      Modifier
                    </Button>
                    <Button 
                      onClick={() => handleDelete(pen.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* VIDE STATE */}
      {!isLoading && entities.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid3x3 className="text-purple-300" size={30} />
          </div>
          <p className="text-gray-500 font-medium">
            {searchTerm 
              ? 'Aucun enclos ne correspond à votre recherche.'
              : 'Aucun enclos enregistré pour cette ferme.'}
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-vert font-medium hover:underline"
          >
            Créer votre premier enclos
          </button>
        </div>
      )}

      {/* MODAL DE CRÉATION/MODIFICATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {selectedPen ? 'Modifier l\'enclos' : 'Nouvel enclos'}
              </h3>
              <Button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </Button>
            </div>
            <div className="p-2">
              <PenForm 
                farmId={farmId}
                pen={selectedPen}
                onSuccess={() => {
                  handleCloseModal();
                  fetchPens('');
                }} 
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PenList;