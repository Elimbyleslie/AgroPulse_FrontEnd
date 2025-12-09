import { PATH_AUTH } from "../../constants/paths";
import logo from "../../assets/images/AgroPulse-1.png";

import React, { useState } from "react";
import { NavLink } from "react-router-dom";

interface NavItem {
  name: string;
  path: string;
}

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const navItems: NavItem[] = [
    { name: "Accueil", path: "/" },
    { name: "Fonctionnalités", path: "/" },
    { name: "Tarif", path: "/tarif" },
    { name: "Contact", path: "/contact" },
  ];

  const toggleMenu = (): void => setIsOpen((prev) => !prev);

  return (
    <div className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className=" px-14 max-sm:px-4 sm:px-8 flex items-center justify-between py-4">
        {/* Logo */}
        <img src={logo} className="h-12  max-md:h-6" alt="" />

        {/* Menu Desktop */}
        <nav className="hidden lg:flex space-x-8 ">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `font-medium transition-colors duration-300 ${
                  isActive ? "text-[#E3BA3E]" : "text-[#5A5A5A]"
                } hover:text-[#E3BA3E]`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        {/* Authentification */}
        <div className="lg:flex gap-6 hidden">
          <NavLink
            className={
              "border-[#0D8849]  border-[3px]   text-[#0D8849]  hover:bg-[#0D8849] hover:text-white px-4 py-1 rounded-full"
            }
            to={PATH_AUTH.LOGIN}
          >
            connexion
          </NavLink>
          <NavLink
            className={
              "text-white px-4 py-1 rounded-full text-center  bg-[#E3BA3E] hover:border-[3px]  hover:border-[#E3BA3E] hover:text-[#E3BA3E]  hover:bg-white "
            }
            to={PATH_AUTH.REGISTER}
          >
            Inscription
          </NavLink>
        </div>
        {/* Bouton hamburger animé */}
        <button
          className="lg:hidden flex flex-col justify-between w-6 h-5 relative"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span
            className={`h-[3px] w-full bg-[#5A5A5A] rounded transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-[8px] bg-[#E3BA3E]" : ""
            }`}
          ></span>
          <span
            className={`h-[3px] w-full bg-[#5A5A5A] rounded transition-all duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`h-[3px] w-full bg-[#5A5A5A] rounded transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-[8px] bg-[#E3BA3E]" : ""
            }`}
          ></span>
        </button>
      </div>
      {/* Menu Mobile */}
      <nav
        className={`lg:hidden bg-white border-t border-gray-200 flex flex-col space-y-4 px-6 my-3 transition-all duration-300 ease-in-out transform ${
          isOpen
            ? "max-h-80 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-3 overflow-hidden"
        }`}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setIsOpen(false)} // Ferme le menu au clic
            className={({ isActive }) =>
              `text-lg font-medium transition-colors duration-300  max-md:text-sm  ${
                isActive ? "text-[#E3BA3E]" : "text-[#5A5A5A]"
              } hover:text-[#E3BA3E]`
            }
          >
            {item.name}
          </NavLink>
        ))}

        <NavLink
          className={
            "border-[#0D8849]  max-md:text-sm  max-md:w-24 flex justify-center   border-[3px] w-32   text-[#0D8849]  hover:bg-[#0D8849] hover:text-white px-4 py-1 rounded-full"
          }
          to={PATH_AUTH.LOGIN}
        >
          connexion
        </NavLink>
        <NavLink
          className={
            "text-white  max-md:text-sm  px-4 py-1 max-md:w-24  flex justify-center  rounded-full text-center w-32  bg-[#E3BA3E] hover:border-[3px]  hover:border-[#E3BA3E] hover:text-[#E3BA3E]  hover:bg-white "
          }
          to={PATH_AUTH.REGISTER}
        >
          Inscription
        </NavLink>
      </nav>
    </div>
  );
};

export default Header;
