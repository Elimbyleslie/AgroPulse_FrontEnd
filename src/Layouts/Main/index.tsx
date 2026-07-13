/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getUserFarms } from "../../store/farm/action";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { selectCurrentFarm, setCurrentFarm } from "../../store/farm/slice";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(
    (state) => state.authentification.auth.user,
  );
  const currentFarm = useAppSelector(selectCurrentFarm);

  useEffect(() => {
    const loadFarm = async () => {
      if (currentFarm || !currentUser?.id) return;

      try {
        const result = await dispatch(getUserFarms()).unwrap();
        const data = (result as { data?: unknown })?.data;
        const farms = Array.isArray(data)
          ? data
          : Array.isArray(result)
            ? (result as unknown[])
            : [];
        if (farms.length > 0) {
          dispatch(setCurrentFarm(farms[0] as any));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadFarm();
  }, [currentUser?.id, currentFarm, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 ">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1  overflow-x-hidden ">
          <main className="p-4 overflow-y-auto bg-bg_dash min-h-screen overflow-x-hidden">
            <Outlet />
          </main>

          <footer className=" max-h-16 bg-white border-t shadow-inner ">
            <Footer />
          </footer>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;