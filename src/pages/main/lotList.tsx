import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { getAllLots, deleteLot } from '../../store/lot/action';
import { Layers, Trash2, Plus, Search, X, Loader2, Calendar, Hash, MapPin, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LotForm from '../../components/Modal/LotForm';
import Button from '../../components/UI/Button';

const LotDashboard = ({ farmId }: { farmId: number }) => {
  const dispatch = useAppDispatch();
  const { entities, isLoading } = useAppSelector((state) => state.lot);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLots = useCallback((search: string) => {
    dispatch(getAllLots({ farmId, search, page: 1, limit: 10 }));
  }, [dispatch, farmId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLots(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchLots]);

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce lot ?")) {
      dispatch(deleteLot({ id }));
    }
  };

  // 🎨 Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // 🎨 Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Actif' },
      quarantine: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Quarantaine' },
      sold: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Vendu' },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // 🎨 Fonction pour obtenir le label du groupe d'âge
  const getAgeGroupLabel = (ageGroup: string) => {
    const labels: Record<string, string> = {
      young: 'Jeune',
      adult: 'Adulte',
      breeding: 'Reproduction',
      fattening: 'Engraissement',
      mixed: 'Mixte'
    };
    return labels[ageGroup] || ageGroup;
  };

  return (
    <div className="">
      {/* HEADER & RECHERCHE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-vert" /> Gestion des Lots
          </h2>
          <p className="text-gray-500 text-sm">Organisez vos animaux par groupes ou sections.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un lot..."
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

      {/* GRILLE DE LOTS AMÉLIORÉE */}
      {isLoading && entities.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-vert" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {(Array.isArray(entities) ? entities : []).map((lot) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-vert hover:shadow-lg transition-all group overflow-hidden"
              >
                {/* En-tête avec photo ou icône */}
                <div className="relative h-32 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  {lot.photo ? (
                    <img src={lot.photo} alt={lot.name} className="w-full h-full object-cover" />
                  ) : (
                    <Layers size={48} className="text-vert/30" />
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {getStatusBadge(lot.status)}
                  </div>
                </div>

                {/* Contenu principal */}
                <div className="p-6 space-y-4">
                  {/* Nom et ID */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{lot.name}</h3>
                    <span className="text-xs font-mono text-gray-400">#LOT-{lot.id}</span>
                  </div>

                  {/* Informations détaillées */}
                  <div className="space-y-2.5 text-sm">
                    {/* Espèce et Race */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        🐐
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {lot.species?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {lot.breed?.name || 'Race non spécifiée'}
                        </p>
                      </div>
                    </div>

                    {/* Bâtiment */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <MapPin size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Bâtiment</p>
                        <p className="font-medium text-gray-900 truncate">
                          {lot.barn?.name || `#${lot.barnId}`}
                        </p>
                      </div>
                    </div>

                    {/* Quantité et Groupe d'âge */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <Users size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Quantité</p>
                          <p className="font-bold text-gray-900">{lot.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                          <Hash size={16} className="text-pink-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Âge</p>
                          <p className="font-medium text-gray-900 text-xs">
                            {getAgeGroupLabel(lot.ageGroup)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Date d'entrée */}
                    <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-100">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-xs">
                        Entrée le {formatDate(lot.entryDate)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-50">
                    <Button className="flex-1 text-vert font-medium text-sm hover:bg-green-50 py-2 rounded-lg transition">
                      Voir détails
                    </Button>
                    <Button 
                      onClick={() => handleDelete(lot.id)}
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
            <Layers className="text-gray-300" size={30} />
          </div>
          <p className="text-gray-500 font-medium">Aucun lot ne correspond à votre recherche.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-vert font-medium hover:underline"
          >
            Créer votre premier lot
          </button>
        </div>
      )}

      {/* MODAL DE CRÉATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Nouveau Lot</h3>
              <Button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </Button>
            </div>
            <div className="p-2">
              <LotForm 
                farmId={farmId} 
                onSuccess={() => {
                  setIsModalOpen(false);
                  fetchLots('');
                }} 
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LotDashboard;