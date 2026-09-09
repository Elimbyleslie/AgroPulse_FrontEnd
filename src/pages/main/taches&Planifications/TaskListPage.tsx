/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { getFarmTasks, deleteFarmTask } from "../../../store/farm/farmTaskAct";
import { getFarmUsers } from "../../../store/farm/farmUserAct";
import { selectFarmTaskEntities, selectFarmTaskList } from "../../../store/farm/farmTaskSlice";
import { selectFarmEntities } from "../../../store/farm/slice";
import { FarmTask, TaskStatus } from "../../../models/farmTask";
import { LoadingType } from "../../../models/store";
import TaskFormModal from "../../../components/Modal/TaskModal";
import TaskStatusBadge from "../../../components/UI/TaskBadge";
import SelectInput from "../../../components/UI/SelectInput";
import { toast } from "react-toastify";
import {
  ClipboardList, Clock, Loader, CheckCircle2, XCircle, AlertTriangle,
  Plus, Pencil, Trash2, Calendar, Search,
} from "lucide-react";

const STATUS_FILTER_OPTIONS = [
  { label: "Tous les statuts", value: "" },
  { label: "En attente", value: TaskStatus.pending },
  { label: "En cours", value: TaskStatus.inProgress },
  { label: "Terminée", value: TaskStatus.completed },
  { label: "Annulée", value: TaskStatus.cancelled },
];

const isOverdue = (task: FarmTask) =>
  !!task.dueDate &&
  task.status !== TaskStatus.completed &&
  task.status !== TaskStatus.cancelled &&
  new Date(task.dueDate).getTime() < Date.now();

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; tint: string }> = ({
  label, value, icon, tint,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
    <div>
      <p className="text-xl font-black text-darkText leading-none">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  </div>
);

const TaskDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectFarmTaskEntities);
  const taskListState = useAppSelector(selectFarmTaskList);
  const farms = useAppSelector(selectFarmEntities);

  const [farmId, setFarmId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [creationFarmId, setCreationFarmId] = useState("");
  const [editingTask, setEditingTask] = useState<FarmTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FarmTask | null>(null);

  // La table doit tout montrer, y compris le passé → pas de filtre de date ici,
  // seulement farm/status/search comme sur TasksListPage.
  const fetchData = useCallback(() => {
    dispatch(
      getFarmTasks({
        farmId: farmId ? Number(farmId) : undefined,
        status: (status as TaskStatus) || undefined,
        search: search || undefined,
        limit: 500,
      }),
    );
  }, [dispatch, farmId, status, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Charge les membres de la ferme dès qu'on en choisit une pour créer OU éditer,
  // pour que TaskFormModal puisse peupler "Attribuer à" via selectFarmUsers
  useEffect(() => {
    if (creationFarmId) dispatch(getFarmUsers({ farmId: Number(creationFarmId) }));
  }, [dispatch, creationFarmId]);

  useEffect(() => {
    if (editingTask) dispatch(getFarmUsers({ farmId: editingTask.farmId }));
  }, [dispatch, editingTask]);

  const isLoading = taskListState.status === LoadingType.PENDING;

  const stats = useMemo(() => {
    const byStatus: Record<TaskStatus, number> = {
      [TaskStatus.pending]: 0,
      [TaskStatus.inProgress]: 0,
      [TaskStatus.completed]: 0,
      [TaskStatus.cancelled]: 0,
    };
    let overdue = 0;
    tasks.forEach((t) => {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
      if (isOverdue(t)) overdue += 1;
    });
    return { byStatus, overdue, total: tasks.length };
  }, [tasks]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteFarmTask(deleteTarget.id)).unwrap();
      toast.success("Tâche supprimée");
      setDeleteTarget(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-darkText tracking-tight">Tableau de bord des tâches</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Vue d'ensemble {farms.length > 0 ? `sur ${farms.length} ferme(s)` : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={farms.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition shadow-sm shadow-emerald-200 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Nouvelle tâche
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total" value={stats.total} icon={<ClipboardList className="w-5 h-5 text-gray-600" />} tint="bg-gray-100" />
        <StatCard label="En attente" value={stats.byStatus[TaskStatus.pending]} icon={<Clock className="w-5 h-5 text-amber-600" />} tint="bg-amber-100" />
        <StatCard label="En cours" value={stats.byStatus[TaskStatus.inProgress]} icon={<Loader className="w-5 h-5 text-blue-600" />} tint="bg-blue-100" />
        <StatCard label="Terminées" value={stats.byStatus[TaskStatus.completed]} icon={<CheckCircle2 className="w-5 h-5 text-vert" />} tint="bg-emerald-100" />
        <StatCard label="Annulées" value={stats.byStatus[TaskStatus.cancelled]} icon={<XCircle className="w-5 h-5 text-gray-500" />} tint="bg-gray-100" />
        <StatCard label="En retard" value={stats.overdue} icon={<AlertTriangle className="w-5 h-5 text-rouge" />} tint="bg-red-100" />
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une tâche…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
        </div>
        <div className="w-full md:w-56">
          <SelectInput
            value={farmId}
            placeholder="Toutes les fermes"
            onChange={(val) => setFarmId(String(val))}
            options={[{ label: "Toutes les fermes", value: "" }, ...farms.map((f: any) => ({ label: f.name, value: String(f.id) }))]}
          />
        </div>
        <div className="w-full md:w-48">
          <SelectInput value={status} onChange={(val) => setStatus(String(val))} options={STATUS_FILTER_OPTIONS} />
        </div>
      </div>

      {/* Table complète — toutes les tâches, y compris passées */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Chargement…</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <ClipboardList className="w-10 h-10 text-gray-200" />
          <p className="font-semibold text-gray-500 text-sm">Aucune tâche trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold truncate ${
                    task.status === TaskStatus.completed ? "text-gray-400 line-through" : "text-gray-800"
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {task.farm?.name && <span className="text-xs text-gray-400">{task.farm.name}</span>}
                  {task.dueDate && (
                    <span
                      className={`text-xs flex items-center gap-1 ${
                        isOverdue(task) ? "text-rouge font-semibold" : "text-gray-400"
                      }`}
                    >
                      <Calendar className="w-3 h-3" /> {fmtDate(task.dueDate)}
                      {isOverdue(task) && " · en retard"}
                    </span>
                  )}
                  {task.assignedUser?.name && (
                    <span className="text-xs text-gray-400">→ {task.assignedUser.name}</span>
                  )}
                </div>
              </div>
              <TaskStatusBadge status={task.status} />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(task)}
                  className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Création — demande la ferme d'abord (nécessaire pour farmUsers) */}
      {showForm && !creationFarmId && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-3">Pour quelle ferme ?</h3>
            <SelectInput
              value={creationFarmId}
              placeholder="Choisir une ferme"
              onChange={(val) => setCreationFarmId(String(val))}
              options={farms.map((f: any) => ({ label: f.name, value: String(f.id) }))}
            />
            <button
              onClick={() => setShowForm(false)}
              className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
      {showForm && creationFarmId && (
        <TaskFormModal
          farmId={Number(creationFarmId)}
          onClose={() => {
            setShowForm(false);
            setCreationFarmId("");
          }}
          onSuccess={fetchData}
        />
      )}

      {/* Édition */}
      {editingTask && (
        <TaskFormModal
          farmId={editingTask.farmId}
          initial={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={fetchData}
        />
      )}

      {/* Suppression */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-1">Supprimer cette tâche ?</h3>
            <p className="text-sm text-gray-500 mb-5">{deleteTarget.title}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rouge text-white hover:bg-red-600 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboardPage;