// components/Animal/AnimalAssignmentButtons.tsx
import React, { useState } from 'react';
import { MinusCircle } from 'lucide-react';
import AssignAnimalModal from '../Modal/AssignAnimalModal';
import UnassignAnimalModal from '../Modal/UnAssignAnimal';
import Button from '../UI/Button';

interface AnimalAssignmentButtonsProps {
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

const AnimalAssignmentButtons: React.FC<AnimalAssignmentButtonsProps> = ({
  animal,
  onSuccess
}) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);

  const isAssigned = !!(animal.lotId || animal.herdId || animal.penId);

  return (
    <>
      <div className="flex gap-2 ">
        {/* Bouton Assigner/Modifier */}
        <Button
          onClick={() => setIsAssignModalOpen(true)}
          className="  bg-vert text-white hover:bg-green-700 px-4 py-2 rounded-xl  gap-2 transition"
        >
          {isAssigned ? (
            <>
          
              Modifier
            </>
          ) : (
            <>
            
              Assigner
            </>
          )}
        </Button>

        {/* Bouton Retirer (visible seulement si assigné) */}
        {isAssigned && (
          <Button
            onClick={() => setIsUnassignModalOpen(true)}
            className="bg-rouge text-white flex-row  px-4 py-2 rounded-xl flex items-center gap-2 transition"
          >
            <MinusCircle size={16} className='text-vert' />
            Retirer
          </Button>
        )}
      </div>

      {/* Modals */}
      <AssignAnimalModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        animal={animal}
        onSuccess={onSuccess}
      />

      <UnassignAnimalModal
        isOpen={isUnassignModalOpen}
        onClose={() => setIsUnassignModalOpen(false)}
        animal={animal}
        onSuccess={onSuccess}
      />
    </>
  );
};

export default AnimalAssignmentButtons;