// components/Animal/AnimalAssignmentBadge.tsx
import React from 'react';
import { Layers, Users as UsersIcon, Grid3x3 } from 'lucide-react';

interface AnimalAssignmentBadgeProps {
  lotId?: number;
  lotName?: string;
  herdId?: number;
  herdName?: string;
  penId?: number;
  penName?: string;
}

const AnimalAssignmentBadge: React.FC<AnimalAssignmentBadgeProps> = ({
  lotId,
  lotName,
  herdId,
  herdName,
  penId,
  penName
}) => {
  if (lotId) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
        <Layers size={12} />
        <span>{lotName || `Lot #${lotId}`}</span>
      </div>
    );
  }

  if (herdId) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
        <UsersIcon size={12} />
        <span>{herdName || `Troupeau #${herdId}`}</span>
      </div>
    );
  }

  if (penId) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
        <Grid3x3 size={12} />
        <span>{penName || `Enclos #${penId}`}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-medium">
      Non assigné
    </div>
  );
};

export default AnimalAssignmentBadge;