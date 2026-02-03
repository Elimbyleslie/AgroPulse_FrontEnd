// pages/Barn/BarnDashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { getAllBarns, deleteBarn } from '../../store/barn/action';
import { 
  Home, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  Loader2, 
  Edit2,
  Users,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BarnForm from '../../components/Modal/Barn';
import Button from '../../components/UI/Button';
import { Barn } from '../../models/barn';

interface BarnDashboardProps {
  farmId: number;
}

const BarnList: React.FC<BarnDashboardProps> = ({ farmId }) => {
  const dispatch = useAppDispatch();
  const { entities, isLoading } = useAppSelector((state) => state.barn);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarn, setSelectedBarn] = useState<Barn | null>(null);

  // Fonction de chargement des données
  const fetchBarns = useCallback((search: string) => {
    dispatch(getAllBarns({ farmId, search, page: 1, limit: 10 }));
  }, [dispatch, farmId]);

  // Effet pour la recherche en temps réel (Debounce de 500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBarns(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchBarns]);

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

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="">
      {/* HEADER & RECHERCHE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="text-vert" /> Gestion des Bâtiments
          </h2>
          <p className="text-gray-500 text-sm">
            Gérez vos étables, enclos et autres infrastructures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
      {isLoading && entities.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-vert" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {(Array.isArray(entities) ? entities : []).map((barn) => (
              <motion.div
                key={barn.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-vert hover:shadow-lg transition-all group overflow-hidden"
              >
                {/* En-tête avec photo ou icône */}
                <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  {barn.photo ? (
                    <img src={barn.photo} alt={barn.name} className="w-full h-full object-cover" />
                  ) : (
                    <Home size={48} className="text-blue-600/30" />
                  )}
                </div>

                {/* Contenu principal */}
                <div className="p-6 space-y-4">
                  {/* Nom et ID */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{barn.name}</h3>
                    <span className="text-xs font-mono text-gray-400">#BARN-{barn.id}</span>
                  </div>

                  {/* Informations détaillées */}
                  <div className="space-y-2.5 text-sm">
                    {/* Capacité */}
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

                    {/* Date de création */}
                    <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-100">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-xs">
                        Créé le {formatDate(barn.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-50">
                    <Button 
                      onClick={() => handleEdit(barn)}
                      className="flex-1 text-vert font-medium text-sm hover:bg-green-50 py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </Button>
                    <Button 
                      onClick={() => handleDelete(barn.id)}
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
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="text-gray-300" size={30} />
          </div>
          <p className="text-gray-500 font-medium">
            {searchTerm 
              ? 'Aucun bâtiment ne correspond à votre recherche.'
              : 'Aucun bâtiment enregistré pour cette ferme.'}
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-vert font-medium hover:underline"
          >
            Créer votre premier bâtiment
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
                {selectedBarn ? 'Modifier le bâtiment' : 'Nouveau bâtiment'}
              </h3>
              <Button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </Button>
            </div>
            <div className="p-2">
              <BarnForm 
                farmId={farmId}
                barn={selectedBarn}
                onSuccess={() => {
                  handleCloseModal();
                  fetchBarns('');
                }} 
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BarnList;