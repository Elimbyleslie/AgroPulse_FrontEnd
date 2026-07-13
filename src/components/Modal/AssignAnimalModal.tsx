/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Layers, Users as UsersIcon, Grid3x3, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { assignAnimal } from '../../store/animal/action';
import { getAllLots } from '../../store/lot/action';
import { getAllHerds } from '../../store/herd/action';
import { getAllPens } from '../../store/pen/action';
import { toast } from 'react-toastify';
import Button from '../UI/Button';
import SelectInput from '../UI/SelectInput';

type AssignType = 'lot' | 'herd' | 'pen';

interface AssignAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: {
    id: number;
    name: string;
    farmId: number;
    lotId?: number;
    herdId?: number;
    penId?: number;
  };
  onSuccess?: () => void;
}

const AssignAnimalModal: React.FC<AssignAnimalModalProps> = ({
  isOpen,
  onClose,
  animal,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  
  const { entities: lots, isLoading: loadingLots } = useAppSelector((state) => state.lot);
  const { entities: herds, isLoading: loadingHerds } = useAppSelector((state) => state.herd);
  const { entities: pens, isLoading: loadingPens } = useAppSelector((state) => state.pen);
  
  const [assignType, setAssignType] = useState<AssignType>('lot');
  const [selectedId, setSelectedId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && animal.farmId) {
      // Charger les options disponibles
      dispatch(getAllLots({  farmId: animal.farmId,limit: 10 ,search: "" } ));
      dispatch(getAllHerds({ farmId: animal.farmId, limit: 100 }));
      dispatch(getAllPens({ farmId: animal.farmId, limit: 100 }));
    }
  }, [isOpen, animal.farmId, dispatch]);

  // Préremplir avec l'assignation actuelle
  useEffect(() => {
    if (animal.lotId) {
      setAssignType('lot');
      setSelectedId(animal.lotId);
    } else if (animal.herdId) {
      setAssignType('herd');
      setSelectedId(animal.herdId);
    } else if (animal.penId) {
      setAssignType('pen');
      setSelectedId(animal.penId);
    }
  }, [animal]);

  const handleSubmit = async () => {
    if (!selectedId) {
      toast.error('Veuillez sélectionner une option');
      return;
    }

    setIsSubmitting(true);

    const data: { lotId?: number; herdId?: number; penId?: number } = {};
    
    if (assignType === 'lot') data.lotId = Number(selectedId);
    if (assignType === 'herd') data.herdId = Number(selectedId);
    if (assignType === 'pen') data.penId = Number(selectedId);

    try {
      await dispatch(assignAnimal({ id: animal.id, data })).unwrap();
      toast.success('Animal assigné avec succès !');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de l\'assignation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Options pour les selects
  const lotOptions = lots.map((lot) => ({
    value: lot.id.toString(),
    label: `${lot.name} (${lot.quantity} animaux)`,
  }));

  const herdOptions = herds.map((herd) => ({
    value: herd.id!.toString(),
    label: herd.name,
  }));

  const penOptions = pens.map((pen) => ({
    value: pen.id.toString(),
    label: `${pen.name} (Capacité: ${pen.capacity || 'N/A'})`,
  }));

  const assignmentTypes = [
    { id: 'lot' as AssignType, label: 'Lot', icon: Layers, color: 'bg-green-50 text-green-600' },
    { id: 'herd' as AssignType, label: 'Troupeau', icon: UsersIcon, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'pen' as AssignType, label: 'Enclos', icon: Grid3x3, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className=" border-b bg-gradient-to-r from-vert to-vert">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white text-center">Assigner un animal</h3>
              <p className="text-green-100 text-sm mt-1">{animal.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info actuelle */}
          {(animal.lotId || animal.herdId || animal.penId) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-jaune shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Assignation actuelle :</p>
                <h3 className="text-xl font-bold text-white text-center">COUCOU TEST</h3>
                <p className="text-jaune">
                  {animal.lotId && `Lot #${animal.lotId}`}
                  {animal.herdId && `Troupeau #${animal.herdId}`}
                  {animal.penId && `Enclos #${animal.penId}`}
                </p>
              </div>
            </div>
          )}

          {/* Sélection du type d'assignation */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Type d'assignation
            </label>
            <div className="grid grid-cols-3 gap-3">
              {assignmentTypes.map((type) => {
                const Icon = type.icon;
                const isActive = assignType === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setAssignType(type.id);
                      setSelectedId(0);
                    }}
                    className={`
                      p-4 rounded-xl border-2 transition-all
                      ${isActive
                        ? 'border-vert bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon size={20} />
                    </div>
                    <p className={`text-sm font-medium ${isActive ? 'text-vert' : 'text-gray-700'}`}>
                      {type.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sélection de la destination */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Sélectionner {assignType === 'lot' ? 'un lot' : assignType === 'herd' ? 'un troupeau' : 'un enclos'}
            </label>
            
            {assignType === 'lot' && (
              <SelectInput
                value={selectedId}
                onChange={(value) => setSelectedId(Number(value))}
                options={lotOptions}
                loading={loadingLots}
                placeholder="Choisir un lot"
              />
            )}

            {assignType === 'herd' && (
              <SelectInput
                value={selectedId}
                onChange={(value) => setSelectedId(Number(value))}
                options={herdOptions}
                loading={loadingHerds}
                placeholder="Choisir un troupeau"
              />
            )}

            {assignType === 'pen' && (
              <SelectInput
                value={selectedId}
                onChange={(value) => setSelectedId(Number(value))}
                options={penOptions}
                loading={loadingPens}
                placeholder="Choisir un enclos"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <Button
            onClick={onClose}
            className=""
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedId || isSubmitting}
            className="flex-1 bg-vert text-white hover:bg-green-700 py-3 rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? 'Assignation...' : 'Assigner'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AssignAnimalModal;