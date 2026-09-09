/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { getFarmTasks } from "../../../store/farm/farmTaskAct";
import { selectFarmTaskEntities, selectFarmTaskList } from "../../../store/farm/farmTaskSlice";
import { selectFarmEntities } from "../../../store/farm/slice";
import { FarmTask, TaskStatus } from "../../../models/farmTask";
import { LoadingType } from "../../../models/store";
import TaskStatusBadge from "../../../components/UI/TaskBadge";
import SelectInput from "../../../components/UI/SelectInput";
import { ChevronLeft, ChevronRight, ClipboardList, X, User, UserPlus, Calendar as CalendarIcon } from "lucide-react";

const STATUS_COLOR: Record<TaskStatus, string> = {
  [TaskStatus.pending]: "bg-amber-400",
  [TaskStatus.inProgress]: "bg-blue-400",
  [TaskStatus.completed]: "bg-vert",
  [TaskStatus.cancelled]: "bg-gray-400",
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

const buildMonthGrid = (year: number, month: number): Date[] => {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

// Détails en lecture seule — aucune action de modification ici
const TaskDetailsModal: React.FC<{ task: FarmTask; onClose: () => void }> = ({ task, onClose }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-gray-900">{task.title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="mb-4"><TaskStatusBadge status={task.status} /></div>

      {task.description && <p className="text-sm text-gray-600 mb-4">{task.description}</p>}

      <div className="space-y-3 text-sm">
        {task.farm?.name && (
          <div className="flex items-center gap-2 text-gray-600">
            <ClipboardList className="w-4 h-4 text-gray-400" /> {task.farm.name}
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <CalendarIcon className="w-4 h-4 text-gray-400" /> Échéance : {fmtDate(task.dueDate)}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <User className="w-4 h-4 text-gray-400" />
          Assignée à : {task.assignedUser?.name ?? "Non assignée"}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <UserPlus className="w-4 h-4 text-gray-400" />
          Attribuée par : {task.creator?.name ?? "—"}
        </div>
      </div>
    </div>
  </div>
);

const TaskCalendarPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectFarmTaskEntities);
  const taskListState = useAppSelector(selectFarmTaskList);
  const farms = useAppSelector(selectFarmEntities);

  const [cursor, setCursor] = useState(() => new Date());
  const [farmId, setFarmId] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<FarmTask | null>(null);

  const isLoading = taskListState.status === LoadingType.PENDING;

  useEffect(() => {
    dispatch(getFarmTasks({ farmId: farmId ? Number(farmId) : undefined, limit: 500 }));
  }, [dispatch, farmId]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, FarmTask[]>();
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = t.dueDate.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    });
    return map;
  }, [tasks]);

  const grid = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const monthLabel = cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const todayKey = dayKey(new Date());
  const selectedTasks = selectedDay ? tasksByDay.get(selectedDay) ?? [] : [];

  return (
    <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-darkText tracking-tight">Calendrier des tâches</h1>
          <p className="text-sm text-gray-400 mt-0.5">Vue mensuelle des échéances (lecture seule)</p>
        </div>
        <div className="w-full md:w-56">
          <SelectInput
            value={farmId}
            placeholder="Toutes les fermes"
            onChange={(val) => setFarmId(String(val))}
            options={[{ label: "Toutes les fermes", value: "" }, ...farms.map((f: any) => ({ label: f.name, value: String(f.id) }))]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
        <button onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-sm font-bold text-gray-800 capitalize">{monthLabel}</span>
        <button onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((date) => {
                const key = dayKey(date);
                const inMonth = date.getMonth() === cursor.getMonth();
                const dayTasks = tasksByDay.get(key) ?? [];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(key)}
                    className={`aspect-square rounded-lg p-1.5 text-left border transition flex flex-col gap-1
                      ${inMonth ? "bg-white" : "bg-gray-50"}
                      ${selectedDay === key ? "border-vert ring-2 ring-emerald-100" : "border-gray-100"}
                      ${key === todayKey ? "border-vert" : ""}
                      hover:border-vert
                    `}
                  >
                    <span className={`text-xs font-semibold ${inMonth ? "text-gray-700" : "text-gray-300"} ${key === todayKey ? "text-vert" : ""}`}>
                      {date.getDate()}
                    </span>
                    <div className="flex flex-wrap gap-0.5">
                      {dayTasks.slice(0, 4).map((t) => (
                        <span key={t.id} className={`w-1.5 h-1.5 rounded-full ${STATUS_COLOR[t.status]}`} />
                      ))}
                      {dayTasks.length > 4 && <span className="text-[9px] text-gray-400">+{dayTasks.length - 4}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 px-1 flex-wrap">
              {Object.entries(STATUS_COLOR).map(([s, color]) => (
                <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${color}`} /> {s}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-4">
              {selectedDay
                ? new Date(selectedDay).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })
                : "Sélectionnez un jour"}
            </h2>
            {selectedDay && selectedTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <ClipboardList className="w-8 h-8 text-gray-200" />
                <p className="text-sm">Aucune tâche ce jour</p>
              </div>
            )}
            <div className="space-y-2">
              {selectedTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setViewingTask(t)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-vert transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLOR[t.status]}`} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t.farm?.name} {t.assignedUser?.name ? `· ${t.assignedUser.name}` : ""}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewingTask && <TaskDetailsModal task={viewingTask} onClose={() => setViewingTask(null)} />}
    </div>
  );
};

export default TaskCalendarPage;