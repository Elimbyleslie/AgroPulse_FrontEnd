/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Topbar.tsx
import { useState, useEffect, useRef, FormEvent } from "react";
import logo from "../../assets/images/AgroPulse-1.png";
import logo2 from "../../assets/images/agropulse.png";
import Button from "../../components/UI/Button";
import useLogout from "../../hooks/handleLogout";
import { getUserInitials } from "../../lib/GetUserInitiales";
import { selectAuthenticatedUser } from "../../store/auth/slice";
import { useAppSelector, useAppDispatch } from "../../hooks/store";
import { fetchWithAuthOrganizations } from "../../store/organization/action";

import { selectOrganizations } from "../../store/organization/slice";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../store/administration/action";
import {
  selectNotifications,
  selectUnreadCount,
  selectNotificationsState,
} from "../../store/administration/slice";

import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  Menu,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  User,
  Building2,
  CheckCheck,
  Loader2,
} from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

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

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const auth = useAppSelector(selectAuthenticatedUser);
  const user = auth.user;

  const organizations = useAppSelector(selectOrganizations);
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const notificationsState = useAppSelector(selectNotificationsState);

  const notifLoadedRef = useRef(false);

  useEffect(() => {
    if (organizations.length === 0) {
      dispatch(fetchWithAuthOrganizations({ limit: 10 }));
    }
  }, [dispatch, organizations.length]);

  // Charge le compteur/liste de notifications une fois au montage
  useEffect(() => {
    if (!notifLoadedRef.current) {
      dispatch(fetchNotifications({ limit: 10 }));
      notifLoadedRef.current = true;
    }
  }, [dispatch]);

  const currentOrg = organizations[0]?.name ?? null;

  const userRole =
    typeof user?.roles?.[0] === "string"
      ? user.roles[0]
      : ((user?.roles?.[0] as any)?.role?.name ??
        (user?.roles?.[0] as any)?.name ??
        "Membre");

  const initials = getUserInitials({
    name: user?.name || "",
    userName: user?.userName || "",
  });

  const { handleLogout } = useLogout();

  // ── Recherche ────────────────────────────────────────────────────────
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (!query) return;
    navigate(`/main/recherche?q=${encodeURIComponent(query)}`);
  };

  // ── Notifications ────────────────────────────────────────────────────
  const toggleNotifications = () => {
    setNotifOpen((prev) => {
      const next = !prev;
      if (next) {
        dispatch(fetchNotifications({ limit: 10 }));
      }
      return next;
    });
  };

  const handleNotificationClick = (id: number, read: boolean) => {
    if (!read) {
      dispatch(markNotificationAsRead(id));
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* --- SECTION GAUCHE : Menu & Identité --- */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-2">
            <img src={logo2} alt="Logo" className="h-10 max-lg:flex" />
            <img
              src={logo}
              alt="Logo"
              className="h-10 max-md:w-6 max-lg:hidden"
            />
          </div>

          {currentOrg && (
            <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-gray-200 text-gray-600">
              <Building2 size={18} className="text-vert" />
              <span className="text-sm font-semibold truncate max-w-[180px]">
                {currentOrg}
              </span>
            </div>
          )}
        </div>

        {/* --- SECTION CENTRE : Recherche --- */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-md:hidden flex-1 max-w-md mx-8"
        >
          <div className="border-2 border-gray-100 h-11 px-1 rounded-lg flex justify-between items-center w-full focus-within:border-vert transition-colors">
            <Search size={20} className="text-gray-400 ml-2" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Rechercher un animal, une tâche..."
              className="w-full px-3 py-2 outline-none text-sm placeholder:text-gray-400"
            />
            <Button
              type="submit"
              className="bg-vert text-xs py-1.5 h-8 text-white"
            >
              Chercher
            </Button>
          </div>
        </form>

        {/* --- SECTION DROITE : Actions & Profil --- */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full border-2 border-white text-[9px] text-white font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-bold text-darkText">
                      Notifications
                    </p>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-1 text-xs text-vert hover:underline"
                      >
                        <CheckCheck size={14} />
                        Tout marquer lu
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notificationsState.loading && (
                      <div className="flex items-center justify-center py-6 text-gray-400">
                        <Loader2 size={18} className="animate-spin" />
                      </div>
                    )}

                    {!notificationsState.loading &&
                      notifications.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6">
                          Aucune notification
                        </p>
                      )}

                    {!notificationsState.loading &&
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() =>
                            handleNotificationClick(notif.id, notif.read)
                          }
                          className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                            !notif.read ? "bg-vert/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-vert mt-1.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-darkText truncate">
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {timeAgo(notif.createdAt)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>

                  <Link
                    to="/main/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="block text-center text-xs font-semibold text-vert py-2.5 border-t border-gray-50 hover:bg-gray-50"
                  >
                    Voir toutes les notifications
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-gray-800 leading-tight">
                  {user?.name || "Utilisateur"}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  {userRole}
                </span>
              </div>

              <div className="w-9 h-9 bg-jaune text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                {initials}
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 hidden sm:block transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-2 border-b border-gray-50 lg:hidden">
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Organisation
                    </p>
                    <p className="text-sm font-semibold text-vert truncate">
                      {currentOrg || "Ma Ferme"}
                    </p>
                  </div>

                  <Link
                    to="/main/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={18} className="text-gray-400" />
                    Mon Profil
                  </Link>
                  <Link
                    to="/main/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={18} className="text-gray-400" />
                    Paramètres
                  </Link>

                  <div className="h-[1px] bg-gray-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors font-medium"
                  >
                    <LogOut size={18} />
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;