import React from "react";
import { TaskStatus } from "../../models/farmTask";

const CONFIG: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
  [TaskStatus.pending]: { label: "En attente", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
  [TaskStatus.inProgress]: { label: "En cours", bg: "bg-blue-50", text: "text-bleu", dot: "bg-bleu" },
  [TaskStatus.completed]: { label: "Terminée", bg: "bg-emerald-50", text: "text-vert", dot: "bg-vert" },
  [TaskStatus.cancelled]: { label: "Annulée", bg: "bg-red-50", text: "text-rouge", dot: "bg-rouge" },
};

const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const c = CONFIG[status] ?? CONFIG[TaskStatus.pending];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

export default TaskStatusBadge;