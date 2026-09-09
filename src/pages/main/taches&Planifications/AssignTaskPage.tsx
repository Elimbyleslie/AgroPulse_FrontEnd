/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { createFarmTask } from "../../../store/farm/farmTaskAct";
import { selectFarmTaskCreateState } from "../../../store/farm/farmTaskSlice";
import { getFarmUsers } from "../../../store/farm/farmUserAct";
import { selectFarmUsers, selectFarmUsersState } from "../../../store/farm/farmUserSlice";
import { getAllFarms } from "../../../store/farm/action";
import { selectFarmEntities } from "../../../store/farm/slice";
import { TaskStatus } from "../../../models/farmTask";
import { LoadingType } from "../../../models/store";
import SelectInput from "../../../components/UI/SelectInput";
import { toast } from "react-toastify";
import { UserPlus } from "lucide-react";


const AssignTaskPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const farms = useAppSelector(selectFarmEntities);
  const farmUsers = useAppSelector(selectFarmUsers);
  const farmUsersState = useAppSelector(selectFarmUsersState);
  const createState = useAppSelector(selectFarmTaskCreateState);

  const [farmId, setFarmId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    dispatch(getAllFarms({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (farmId) {
      dispatch(getFarmUsers({ farmId: Number(farmId) }));
      setAssignedTo(""); // reset si on change de ferme
    }
  }, [dispatch, farmId]);

  const isValid = farmId && title.trim().length >= 2;
  const saving = createState.status === LoadingType.PENDING;

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Ferme et titre sont obligatoires");
      return;
    }
    try {
      await dispatch(
        createFarmTask({
          farmId: Number(farmId),
          title: title.trim(),
          description: description.trim() || undefined,
          assignedTo: assignedTo ? Number(assignedTo) : null,
          status: TaskStatus.pending,
          dueDate: dueDate || null,
        }),
      ).unwrap();
      toast.success("Tâche attribuée avec succès");
      navigate("/main/tasks");
    } catch (err: any) {
      toast.error(err?.meta?.message || "Erreur lors de l'attribution");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";

  return (
    <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash max-w-xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <UserPlus className="w-5 h-5 text-vert" />
        </div>
        <div>
          <h1 className="text-xl font-black text-darkText tracking-tight">Attribuer une tâche</h1>
          <p className="text-sm text-gray-400">Créez une tâche et assignez-la à un membre de la ferme</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Ferme <span className="text-rouge">*</span>
          </label>
          <SelectInput
            value={farmId}
            placeholder="Sélectionner une ferme"
            onChange={(val) => setFarmId(String(val))}
            options={farms.map((f: any) => ({ label: f.name, value: String(f.id) }))}
          />
        </div>

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
            className={`${inputClass} min-h-[90px] resize-none`}
            placeholder="Détails de la tâche (optionnel)"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Attribuer à
          </label>
          <SelectInput
            value={assignedTo}
            placeholder={
              !farmId
                ? "Choisissez d'abord une ferme"
                : farmUsersState.status === LoadingType.PENDING
                ? "Chargement des membres…"
                : "Non assignée"
            }
            onChange={(val) => setAssignedTo(String(val))}
            options={[
              { label: "Non assignée", value: "" },
              ...farmUsers.map((fu) => ({
                label: fu.user?.name ?? `Utilisateur #${fu.userId}`,
                value: String(fu.userId),
              })),
            ]}
          />
          {farmId && farmUsersState.status !== LoadingType.PENDING && farmUsers.length === 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              Aucun membre affilié à cette ferme pour le moment.
            </p>
          )}
        </div>

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
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/main/tasks")}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || !isValid}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 hover:bg-dark_vert transition"
        >
          {saving ? "Attribution…" : "Attribuer la tâche"}
        </button>
      </div>
    </div>
  );
};

export default AssignTaskPage;