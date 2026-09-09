/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Farm/Herd/HerdList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { getAllHerds, deleteHerd } from '../../../store/herd/action';
import {
  Users as UsersIcon,
  Trash2,
  Plus,
  Search,
  X,
  Loader2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HerdForm from './HerdForm';
import Button from '../../UI/Button';
import { Herd } from '../../../models/herd';

interface HerdListProps {
  farmId: number;
  initialBarnId?: number;
  autoOpenCreate?: boolean;
  onConsumedPrefill?: () => void;
}

const HerdList: React.FC<HerdListProps> = ({
  farmId,
  initialBarnId,
  autoOpenCreate,
  onConsumedPrefill,
}) => {
    const dispatch = useAppDispatch();
  const [presetBarnId, setPresetBarnId] = useState<number | undefined>(undefined);

  const { entities, isLoading } = useAppSelector((state) => state.herd);

  const herds = Array.isArray(entities) ? entities : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHerd, setSelectedHerd] = useState<Herd | null>(null);

    useEffect(() => {
    if (autoOpenCreate && initialBarnId) {
      setPresetBarnId(initialBarnId);
      setSelectedHerd(null);
      setIsModalOpen(true);
      onConsumedPrefill?.(); 
    }
  }, [autoOpenCreate, initialBarnId, onConsumedPrefill]);

  const fetchHerds = useCallback((search: string) => {
    dispatch(getAllHerds({ farmId, search, page: 1, limit: 50 }));
  }, [dispatch, farmId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHerds(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchHerds]);

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce troupeau ?")) {
      dispatch(deleteHerd({ id }));
    }
  };

  const handleEdit = (herd: Herd) => {
    setSelectedHerd(herd);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHerd(null);
  };

  const formatDate = (dateString?: Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UsersIcon className="text-vert" /> Gestion des Troupeaux
          </h2>
          <p className="text-gray-500 text-sm">
            Organisez vos animaux par groupes et espèces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un troupeau..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vert outline-none w-64 transition-all"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-vert text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-indigo-100 transition"
          >
            <Plus size={18} /> Nouveau
          </button>
        </div>
      </div>

      {isLoading && herds.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-vert" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {herds.map((herd) => (
              <motion.div
                key={herd.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-vert hover:shadow-lg transition-all group overflow-hidden"
              >
                <div className="relative h-32 bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                  {herd.photo ? (
                    <img src={herd.photo} alt={herd.name} className="w-full h-full object-cover" />
                  ) : (
                    <UsersIcon size={48} className="text-vert/30" />
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{herd.name}</h3>
                    <span className="text-xs font-mono text-gray-400">#HERD-{herd.id}</span>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">🐑</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Espèce</p>
                        <p className="font-medium text-gray-900 truncate">
                          {herd.speciesId ?? `ID #${herd.speciesId}`}
                        </p>
                      </div>
                    </div>

                    {herd.createdAt && (
                      <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-100">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-xs">Créé le {formatDate(herd.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-50">
                    <Button
                      onClick={() => handleEdit(herd)}
                      className="flex-1 bg-green-50 text-vert font-medium text-sm hover:bg-indigo-50 py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={() => handleDelete(herd.id!)}
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

      {!isLoading && herds.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="text-indigo-300" size={30} />
          </div>
          <p className="text-gray-500 font-medium">
            {searchTerm
              ? 'Aucun troupeau ne correspond à votre recherche.'
              : 'Aucun troupeau enregistré pour cette ferme.'}
          </p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 text-vert font-medium hover:underline">
            Créer votre premier troupeau
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {selectedHerd ? 'Modifier le troupeau' : 'Nouveau troupeau'}
              </h3>
              <Button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </Button>
            </div>
            <div className="p-2">
             
  <HerdForm
    farmId={farmId}
    herd={selectedHerd}
    initialBarnId={Number(presetBarnId)} 
    onSuccess={() => {
      handleCloseModal();
      fetchHerds('');
    }}
  />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HerdList;