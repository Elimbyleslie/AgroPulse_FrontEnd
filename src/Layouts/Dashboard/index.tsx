// import React, { useState } from 'react';
// import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   Building2,
//   Users,
//   Settings,
//   Menu,
//   X,
//   LogOut,
//   ChevronDown,
//   Bell,
//   Search,
//   User,
//   Home,
//   FileText,
//   BarChart3
// } from 'lucide-react';

// const DashboardLayout: React.FC = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false); // false par défaut pour mobile
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const menuItems = [
//     { icon: Home, label: 'Accueil', path: '/dashboard' },
//     { icon: Building2, label: 'Organisations', path: '/dashboard/organizations' },
//     { icon: Users, label: 'Utilisateurs', path: '/dashboard/users' },
//     { icon: BarChart3, label: 'Statistiques', path: '/dashboard/stats' },
//     { icon: FileText, label: 'Rapports', path: '/dashboard/reports' },
//     { icon: Settings, label: 'Paramètres', path: '/dashboard/settings' },
//   ];

//   const isActive = (path: string) => location.pathname === path;

//   const handleLogout = () => {
//     // Votre logique de déconnexion
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   const closeSidebar = () => {
//     if (window.innerWidth < 1024) {
//       setSidebarOpen(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Header */}
      

//       <div className="flex flex-1 pt-16">
//         {/* Sidebar */}
//         <aside
//           className={`
//             fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200
//             transform transition-transform duration-300 ease-in-out z-20
//             ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
//           `}
//         >
//           <nav className="p-4 space-y-1 overflow-y-auto h-full">
//             {menuItems.map((item) => {
//               const Icon = item.icon;
//               const active = isActive(item.path);

//               return (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   onClick={closeSidebar}
//                   className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
//                     active
//                       ? 'bg-blue-50 text-blue-600 font-medium'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <Icon size={20} className="flex-shrink-0" />
//                   <span>{item.label}</span>
//                 </Link>
//               );
//             })}
//           </nav>
//         </aside>

//         {/* Overlay for mobile */}
//         {sidebarOpen && (
//           <div
//             className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden top-16"
//             onClick={() => setSidebarOpen(false)}
//           />
//         )}

//         {/* Main Content */}
//         <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
//           {/* Page Content */}
//           <div className="flex-1 p-4 sm:p-6 lg:p-8">
//             <Outlet />
//           </div>

//           {/* Footer */}
         
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;