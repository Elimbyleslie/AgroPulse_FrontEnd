// components/Modal/FarmFormModal.tsx
import React from "react";
import { createPortal } from "react-dom";
import { X, Home } from "lucide-react";
import FarmForm from "./Farm";

interface FarmFormModalProps {
  organizationId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const FarmFormModal: React.FC<FarmFormModalProps> = ({ organizationId, onClose, onSuccess }) => {
  const modal = (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-vert" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">Nouvelle ferme</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <FarmForm
            organizationId={organizationId}
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default FarmFormModal;