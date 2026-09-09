/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { X, ClipboardList } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { createFarmTask, updateFarmTask } from "../../store/farm/farmTaskAct";
import { selectFarmTaskCreateState, selectFarmTaskUpdateState } from "../../store/farm/farmTaskSlice";
import { selectFarmUsers } from "../../store/farm/farmUserSlice";
import { FarmTask, TaskStatus } from "../../models/farmTask";
import SelectInput from "../UI/SelectInput";
import { LoadingType } from "../../models/store";

const STATUS_OPTIONS = [
  { label: "En attente", value: TaskStatus.pending },
  { label: "En cours", value: TaskStatus.inProgress },
  { label: "Terminée", value: TaskStatus.completed },
  { label: "Annulée", value: TaskStatus.cancelled },
];

interface TaskFormModalProps {
  farmId: number;
  initial?: FarmTask | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ farmId, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const createState = useAppSelector(selectFarmTaskCreateState);
  const updateState = useAppSelector(selectFarmTaskUpdateState);
  const farmUsers = useAppSelector(selectFarmUsers); // membres de LA ferme concernée (déjà filtrés par le parent)

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [assignedTo, setAssignedTo] = useState<string>(
    initial?.assignedTo ? String(initial.assignedTo) : "",
  );
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? TaskStatus.pending);
  const [dueDate, setDueDate] = useState<string>(
    initial?.dueDate ? initial.dueDate.slice(0, 10) : "",
  );

  const saving = createState.status === LoadingType.PENDING || updateState.status === LoadingType.PENDING;
  const isValid = title.trim().length >= 2;

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Le titre est obligatoire");
      return;
    }
    try {
      if (initial) {
        await dispatch(
          updateFarmTask({
            id: initial.id,
            title: title.trim(),
            description: description.trim() || undefined,
            assignedTo: assignedTo ? Number(assignedTo) : null,
            status,
            dueDate: dueDate || null,
          }),
        ).unwrap();
        toast.success("Tâche mise à jour");
      } else {
        await dispatch(
          createFarmTask({
            farmId,
            title: title.trim(),
            description: description.trim() || undefined,
            assignedTo: assignedTo ? Number(assignedTo) : null,
            status,
            dueDate: dueDate || null,
          }),
        ).unwrap();
        toast.success("Tâche créée");
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.meta?.message || "Erreur lors de l'enregistrement");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-vert" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">
              {initial ? "Modifier la tâche" : "Nouvelle tâche"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Titre <span className="text-rouge">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Nourrir le troupeau, réparer la clôture…"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[80px] resize-none`}
              placeholder="Détails de la tâche (optionnel)"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Attribuer à
            </label>
            <SelectInput
              value={assignedTo}
              placeholder="Non assignée"
              onChange={(val) => setAssignedTo(String(val))}
              options={[
                { label: "Non assignée", value: "" },
                ...farmUsers.map((fu) => ({
                  label: fu.user?.name ?? `Utilisateur #${fu.userId}`,
                  value: String(fu.userId),
                })),
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Échéance
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Statut
              </label>
              <SelectInput
                value={status}
                onChange={(val) => setStatus(val as TaskStatus)}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !isValid}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 hover:bg-dark_vert transition"
          >
            {saving ? "Enregistrement…" : initial ? "Enregistrer" : "Créer la tâche"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;