/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Topbar.tsx
import React, { useState, useEffect } from "react";
import logo from "../../assets/images/AgroPulse-1.png";
import logo2 from "../../assets/images/agropulse.png";
import Button from "../../components/UI/Button";
import useLogout from "../../hooks/handleLogout";
import { getUserInitials } from "../../lib/GetUserInitiales";
import { selectAuthenticatedUser } from "../../store/auth/slice";
import { useAppSelector , useAppDispatch} from "../../hooks/store";
import { fetchWithAuthOrganizations } from "../../store/organization/action";
import { selectOrganizations } from "../../store/organization/slice";


import { Link } from "react-router-dom";
import {
  Settings,
  Menu,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  User,
  Building2, // Ajouté pour l'organisation
} from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuthenticatedUser);
  const user = auth.user;

  const organizations = useAppSelector(selectOrganizations);

 useEffect(() => {
    if (organizations.length === 0) {
      dispatch(fetchWithAuthOrganizations({ limit: 10 }));
    }
  }, [dispatch, organizations.length]);

  // ← Utilise le store au lieu de user.ownedOrganizations
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

          {/* ✅ Affichage du nom de l'Organisation (Visible uniquement sur Desktop) */}
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
        <div className="max-md:hidden flex-1 max-w-md mx-8">
          <div className="border-2 border-gray-100 h-11 px-1 rounded-lg flex justify-between items-center w-full focus-within:border-vert transition-colors">
            <Search size={20} className="text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="Rechercher un animal, une tâche..."
              className="w-full px-3 py-2 outline-none text-sm placeholder:text-gray-400"
            />
            <Button className="bg-vert text-xs py-1.5 h-8 text-white  ">
              Chercher
            </Button>
          </div>
        </div>

        {/* --- SECTION DROITE : Actions & Profil --- */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* ✅ Infos Utilisateur (Nom & Rôle) */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-gray-800 leading-tight">
                  {user?.name || "Utilisateur"}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  {userRole}
                </span>
              </div>

              {/* Avatar avec Initiales */}
              <div className="w-9 h-9 bg-jaune text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                {initials}
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 hidden sm:block transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
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
