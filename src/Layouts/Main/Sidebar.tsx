import React from "react";
import { Link } from "react-router";
import Account from "../../media/images/ic_account_balance_24px.png";

const Sidebar = () => {
 

  return (
        <aside className="h-screen bg-cover bg-center  text-white"
         style={{
        backgroundImage: "url('/images/sidebar_bg.jpeg')",
      }}>
   <div className="bg-dark_vert bg-opacity-75 pt-10 h-[100%]  ">
      <div className="p-2 flex flex-col gap-5 ">
        <ul className="space-y-8 p-4  ">
          {[
            { path: "/admin", img:{Account}  ,  label: "Tableau de bord" },
            { path: "/admin/Animaux", label: "Animaux" },
            { path: "/admin/Santé & Reproduction", label: "Santé & Reproduction" },
            { path: "/admin/Productions", label: "Productions" },
            { path: "/admin/Alimentations & Stocks", label: "Alimentations & Stocks " },
            { path: "/admin/Rapports & Statistiques", label: "Rapports & Statistiques" },
            { path: "/admin/Paramètres", label: "Paramètres" },

          ].map((item, index) => {
            return (
              <li key={index.toString()}>
                <Link to={item.path}>{item.label}</Link>
              </li>
            );
          })}
        </ul>

        {/* <button onClick={() => handleLogout()}>Logout</button> */}
      </div>
   </div>
    </aside>
  );
};

export default Sidebar;
