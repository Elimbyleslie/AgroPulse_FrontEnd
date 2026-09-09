/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks/store";
import {
  fetchNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../store/administration/action";
import {
  selectNotifications,
  selectUnreadCount,
  selectNotificationsState,
  selectNotificationsPagination,
} from "../../store/administration/slice";
import { CheckCheck, Trash2, Bell, Circle, Loader2 } from "lucide-react";

const timeAgo = (date?: string | Date) => {
  if (!date) return "";
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
};

type FilterTab = "all" | "unread" | "read";

const NotificationsDashboard = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const notificationsState = useAppSelector(selectNotificationsState);
  const pagination = useAppSelector(selectNotificationsPagination);

  const [filter, setFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const read = filter === "all" ? undefined : filter === "unread" ? false : true;
    dispatch(fetchNotifications({ page, limit: 15, read }));
  }, [dispatch, filter, page]);

  const handleFilterChange = (next: FilterTab) => {
    setFilter(next);
    setPage(1);
  };

  const handleToggleRead = (id: number, read: boolean) => {
    if (read) {
      dispatch(markNotificationAsUnread(id));
    } else {
      dispatch(markNotificationAsRead(id));
    }
  };

  const handleDelete = (id: number) => {
    dispatch(deleteNotification({ id }));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const items = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-vert/10 flex items-center justify-center">
            <Bell size={20} className="text-vert" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-darkText">Notifications</h1>
            <p className="text-xs text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Tout est lu"}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 text-sm font-semibold text-vert hover:underline"
          >
            <CheckCheck size={16} />
            Tout marquer lu
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4 border-b border-gray-100">
        {(["all", "unread", "read"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleFilterChange(tab)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              filter === tab
                ? "border-vert text-vert"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "all" ? "Toutes" : tab === "unread" ? "Non lues" : "Lues"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {notificationsState.loading && (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}

        {!notificationsState.loading && items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">
            Aucune notification
          </p>
        )}

        {!notificationsState.loading &&
          items.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                !notif.read ? "bg-vert/5" : ""
              }`}
            >
              <button
                onClick={() => handleToggleRead(notif.id, notif.read)}
                className="mt-1 shrink-0"
                title={notif.read ? "Marquer non lue" : "Marquer lue"}
              >
                <Circle
                  size={10}
                  className={notif.read ? "text-gray-300" : "text-vert fill-vert"}
                />
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-darkText">
                  {notif.title}
                </p>
                <p className="text-sm text-gray-500">{notif.message}</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {timeAgo(notif.createdAt)}
                </p>
              </div>

              <button
                onClick={() => handleDelete(notif.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                title="Supprimer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            disabled={!pagination.previousPage}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Précédent
          </button>
          <span className="text-xs text-gray-500">
            Page {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.nextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsDashboard;