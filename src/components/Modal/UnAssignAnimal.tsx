/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Modal/UnassignAnimalModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { useAppDispatch } from '../../hooks/store';
import { unassignAnimal } from '../../store/animal/action';
import { toast } from 'react-toastify';
import Button from '../UI/Button';

interface UnassignAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: {
    id: number;
    name: string;
    lotId?: number;
    herdId?: number;
    penId?: number;
  };
  onSuccess?: () => void;
}

const UnassignAnimalModal: React.FC<UnassignAnimalModalProps> = ({
  isOpen,
  onClose,
  animal,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentAssignment = () => {
    if (animal.lotId) return `Lot #${animal.lotId}`;
    if (animal.herdId) return `Troupeau #${animal.herdId}`;
    if (animal.penId) return `Enclos #${animal.penId}`;
    return 'Aucune assignation';
  };

  const handleUnassign = async () => {
    setIsSubmitting(true);

    try {
      await dispatch(unassignAnimal(animal.id)).unwrap();
      toast.success('Animal retiré avec succès !');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors du retrait');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-red-500 to-red-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Retirer l'assignation</h3>
                <p className="text-red-100 text-sm">{animal.name}</p>
              </div>
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
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-900">
              <span className="font-medium">Assignation actuelle :</span>{' '}
              <span className="font-bold">{getCurrentAssignment()}</span>
            </p>
          </div>

          <p className="text-gray-600 text-sm">
            Êtes-vous sûr de vouloir retirer cet animal de son assignation actuelle ?
            L'animal ne sera plus associé à aucun lot, troupeau ou enclos.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <Button
            onClick={onClose}
            className=" bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl"
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleUnassign}
            disabled={isSubmitting}
            className=" bg-red-500 text-white hover:bg-red-600 py-3 rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? 'Retrait...' : 'Confirmer le retrait'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default UnassignAnimalModal;