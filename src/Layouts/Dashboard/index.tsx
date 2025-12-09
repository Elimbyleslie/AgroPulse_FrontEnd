import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
const DashboardLayout = () => {
  return (
    <>
    <div>
        
    </div>
      <Header />
      <div>
        <Sidebar/>
      </div>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
export default DashboardLayout;
