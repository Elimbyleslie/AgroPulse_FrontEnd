import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <Header toggleSidebar={() => setSidebarOpen(prev => !prev)} />

      <div className="flex flex-1">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 min-h-0">

          <main className="p-4 overflow-y-auto bg-bg_dash">
            <Outlet />
          </main>

          <footer className="h-14 bg-white border-t shadow-inner">
            <Footer />
          </footer>

        </div>
      </div>
    </div>
  );
};

export default MainLayout;
