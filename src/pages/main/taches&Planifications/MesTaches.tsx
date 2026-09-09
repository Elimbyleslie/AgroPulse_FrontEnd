/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { getFarmTasks, updateFarmTaskStatus } from "../../../store/farm/farmTaskAct";
import { selectFarmTaskEntities, selectFarmTaskList } from "../../../store/farm/farmTaskSlice";
import { selectCurrentUser } from "../../../store/auth/slice"; 
import { FarmTask, TaskStatus } from "../../../models/farmTask";
import { LoadingType } from "../../../models/store";
import { toast } from "react-toastify";
import { ClipboardCheck, Calendar, Search, Check, X as XIcon, Loader2 } from "lucide-react";

const LOCKED_STATUSES = [TaskStatus.completed, TaskStatus.cancelled];

const FILTER_PILLS: { label: string; value: string; activeClass: string }[] = [
  { label: "Toutes", value: "", activeClass: "bg-gray-800 text-white border-gray-800" },
  { label: "En attente", value: TaskStatus.pending, activeClass: "bg-amber-400 text-white border-amber-400" },
  { label: "En cours", value: TaskStatus.inProgress, activeClass: "bg-blue-400 text-white border-blue-400" },
  { label: "Terminée", value: TaskStatus.completed, activeClass: "bg-vert text-white border-vert" },
  { label: "Annulée", value: TaskStatus.cancelled, activeClass: "bg-gray-400 text-white border-gray-400" },
];

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const isOverdue = (task: FarmTask) =>
  !!task.dueDate &&
  task.status !== TaskStatus.completed &&
  task.status !== TaskStatus.cancelled &&
  new Date(task.dueDate).getTime() < Date.now();

const MyTasksPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const tasks = useAppSelector(selectFarmTaskEntities);
  const taskListState = useAppSelector(selectFarmTaskList);

  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchData = useCallback(() => {
    if (!currentUser?.id) return;
    dispatch(
      getFarmTasks({
        assignedTo: currentUser.id,
        status: (status as TaskStatus) || undefined,
        search: search || undefined,
        limit: 100,
      }),
    );
  }, [dispatch, currentUser?.id, status, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isLoading = taskListState.status === LoadingType.PENDING;

  const handleStatusChange = async (task: FarmTask, newStatus: TaskStatus) => {
    setUpdatingId(task.id);
    try {
      await dispatch(updateFarmTaskStatus({ id: task.id, status: newStatus })).unwrap();
      toast.success(newStatus === TaskStatus.completed ? "Tâche marquée terminée" : "Tâche annulée");
      // La personne qui a assigné la tâche est notifiée automatiquement côté backend
    } catch {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
      <div>
        <h1 className="text-2xl font-black text-darkText tracking-tight">Mes tâches</h1>
        <p className="text-sm text-gray-400 mt-0.5">Les tâches qui vous sont assignées</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une tâche…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
        </div>

        {/* Filtre coloré par statut */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_PILLS.map((pill) => {
            const active = status === pill.value;
            return (
              <button
                key={pill.value}
                onClick={() => setStatus(pill.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                  active ? pill.activeClass : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Chargement…</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <ClipboardCheck className="w-10 h-10 text-gray-200" />
          <p className="font-semibold text-gray-500 text-sm">Aucune tâche assignée</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {tasks.map((task) => {
            const locked = LOCKED_STATUSES.includes(task.status);
            const busy = updatingId === task.id;
            return (
              <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition">
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${
                      task.status === TaskStatus.completed ? "text-gray-400 line-through" : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {task.farm?.name && <span className="text-xs text-gray-400">{task.farm.name}</span>}
                    {task.dueDate && (
                      <span className={`text-xs flex items-center gap-1 ${isOverdue(task) ? "text-rouge font-semibold" : "text-gray-400"}`}>
                        <Calendar className="w-3 h-3" /> {fmtDate(task.dueDate)}
                        {isOverdue(task) && " · en retard"}
                      </span>
                    )}
                  </div>
                </div>

                {locked ? (
                  // Verrouillé : le statut clos est affiché, mais plus aucune action
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                      task.status === TaskStatus.completed ? "bg-emerald-100 text-vert" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {task.status === TaskStatus.completed ? "Terminée" : "Annulée"}
                  </span>
                ) : busy ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin flex-shrink-0" />
                ) : (
                  // Seules deux actions possibles : terminer ou annuler
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleStatusChange(task, TaskStatus.completed)}
                      title="Marquer terminée"
                      className="w-8 h-8 rounded-lg bg-emerald-50 text-vert hover:bg-emerald-100 flex items-center justify-center transition"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(task, TaskStatus.cancelled)}
                      title="Annuler"
                      className="w-8 h-8 rounded-lg bg-red-50 text-rouge hover:bg-red-100 flex items-center justify-center transition"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;