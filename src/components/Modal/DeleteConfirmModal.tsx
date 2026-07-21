import React, { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  planName: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  planName,
  onCancel,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err: any) {
      setError(
        err?.meta?.message ??
          "Impossible de supprimer ce plan pour le moment.",
      );
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-modalBg/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-btn px-5 py-4">
          <h2 className="text-base font-semibold text-darkText">
            Supprimer le plan
          </h2>
          <button
            onClick={onCancel}
            className="rounded-md p-1.5 text-text transition hover:bg-bg_dash"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="mb-4 flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-jaune" />
            <p className="text-sm text-darkText">
              Voulez-vous vraiment supprimer le plan{" "}
              <span className="font-semibold">« {planName} »</span> ? Cette
              action est irréversible et peut affecter les organisations qui
              y sont abonnées.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rouge/30 bg-rouge/10 px-3 py-2 text-sm text-rouge">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="rounded-lg border border-btn px-4 py-2 text-sm font-medium text-text transition hover:bg-bg_dash disabled:opacity-60"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex items-center gap-2 rounded-lg bg-rouge px-4 py-2 text-sm font-medium text-white transition hover:bg-darkRouge disabled:opacity-60"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;