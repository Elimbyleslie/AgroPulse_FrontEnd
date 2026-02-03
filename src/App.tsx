import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks/store";
import { fetchCurrentUser } from "./store/auth/action";

import WelcomePagesLayout from "./Layouts/welcomePages/index";
import Home from "./pages/welcomepages/Home";
import ContactUs from "./pages/welcomepages/ContactUs";
import Tarif from "./pages/welcomepages/Tarif";
import NotFound from "./pages/welcomepages/Errors/NotFound";
import AuthLayout from "./Layouts/Auth";
import Login from "./pages/auths/Login";
import Register from "./pages/auths/Register";
import GoogleCallback from "./pages/auths/GoogleCallback";
import EmailVerification from "./pages/auths/EmailVerification";
import AnimalList from "./pages/main/animals/AnimalList";
import MainLayout from "./Layouts/Main/index";
import EmptyDashboard from "./pages/main/dash/EmptyDashboard";
import NotFoundMain from "./pages/main/Errors/NotFound";
import RequireAuth from "./guards/RequireAuth";
import MainDashboard from "./pages/main/dash/Dashboard";

import AnimalDetail from "./pages/main/animals/animalDetails";
import AnimalTracking from "./pages/main/animals/suivieQRcode";
import AnimalHistory from  "./pages/main/animals/animalHistory";

import LotDashboard from "./pages/main/lotList";
function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadUser = async () => {
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
      }
    };

    loadUser();
  }, [dispatch]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* ROUTES DU SITE D'ACCUEIL  */}
          <Route path="/" element={<WelcomePagesLayout />}>
            <Route path="/" index element={<Navigate to={`home`} />} />
            <Route path="/home" element={<Home />} />
            <Route path="/tarif" element={<Tarif />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ROUTES D'AUTHENTIFICATION */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="" element={<Navigate to={`/login`} />} />
            <Route path="login" index element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify-email-otp" element={<EmailVerification />} />
            <Route path="google/callback" element={<GoogleCallback />} />
          </Route>

          {/* ROUTES PRINCIPALES PROTEGEE PAR L'AUTH */}
          <Route element={<RequireAuth />}>
            <Route path="/main" element={<MainLayout />}>
              <Route index element={<Navigate to="onboarding" replace />} />
              <Route path="onboarding" element={<EmptyDashboard />} />
              <Route path="dashboard" element={<MainDashboard />} />
              <Route path="animals" element={<AnimalList />} />
              <Route path="animals/:id" element={<AnimalDetail />} />
              <Route path="animals/tracking" element={<AnimalTracking />} />
              <Route path="animals/history" element={ <AnimalHistory /> } />
              <Route path="lots" element={ <LotDashboard farmId={1} /> } />
              <Route path="*" element={<NotFoundMain />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-left" />
    </>
  );
}

export default App;

// // src/App.tsx
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import DashboardLayout from './layouts/DashboardLayout';

// // Pages principales
// import Dashboard from './pages/Dashboard';

// // Pages Animaux
// import AnimalList from './pages/animals/AnimalList';
// import AnimalAdd from './pages/animals/AnimalAdd';
// import AnimalRaces from './pages/animals/AnimalRaces';
// import AnimalGroupes from './pages/animals/AnimalGroupes';

// // Pages Santé & Reproduction
// import Soins from './pages/sante/Soins';
// import Vaccinations from './pages/sante/Vaccinations';
// import Reproduction from './pages/sante/Reproduction';
// import Gestations from './pages/sante/Gestations';
// import Naissances from './pages/sante/Naissances';

// // Pages Productions
// import ProductionLait from './pages/productions/ProductionLait';
// import ProductionViande from './pages/productions/ProductionViande';
// import ProductionOeufs from './pages/productions/ProductionOeufs';
// import ProductionHistorique from './pages/productions/ProductionHistorique';

// // Pages Alimentations & Stocks
// import Rations from './pages/alimentations/Rations';
// import Stocks from './pages/alimentations/Stocks';
// import Fournisseurs from './pages/alimentations/Fournisseurs';
// import Commandes from './pages/alimentations/Commandes';

// // Pages Rapports & Statistiques
// import RapportsDashboard from './pages/rapports/RapportsDashboard';
// import RapportsProductions from './pages/rapports/RapportsProductions';
// import RapportsSante from './pages/rapports/RapportsSante';
// import RapportsFinancier from './pages/rapports/RapportsFinancier';
// import RapportsExports from './pages/rapports/RapportsExports';

// // Pages Paramètres
// import ParametresFerme from './pages/parametres/ParametresFerme';
// import ParametresUtilisateurs from './pages/parametres/ParametresUtilisateurs';
// import ParametresNotifications from './pages/parametres/ParametresNotifications';
// import ParametresSysteme from './pages/parametres/ParametresSysteme';

// // Autres pages
// import Profile from './pages/Profile';
// import Login from './pages/Login';
// import NotFound from './pages/NotFound';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Redirection racine vers dashboard */}
//         <Route path="/" element={<Navigate to="/main" replace />} />

//         {/* Route de connexion */}
//         <Route path="/login" element={<Login />} />

//         {/* Routes protégées du dashboard */}
//         <Route path="/main" element={<DashboardLayout />}>
//           {/* Dashboard principal */}
//           <Route index element={<Dashboard />} />

//           {/* Animaux */}
//           <Route path="animal">
//             <Route path="list" element={<AnimalList />} />
//             <Route path="add" element={<AnimalAdd />} />
//             <Route path="races" element={<AnimalRaces />} />
//             <Route path="groupes" element={<AnimalGroupes />} />
//           </Route>

//           {/* Santé & Reproduction */}
//           <Route path="sante-reproduction">
//             <Route path="soins" element={<Soins />} />
//             <Route path="vaccinations" element={<Vaccinations />} />
//             <Route path="reproduction" element={<Reproduction />} />
//             <Route path="gestations" element={<Gestations />} />
//             <Route path="naissances" element={<Naissances />} />
//           </Route>

//           {/* Productions */}
//           <Route path="productions">
//             <Route path="lait" element={<ProductionLait />} />
//             <Route path="viande" element={<ProductionViande />} />
//             <Route path="oeufs" element={<ProductionOeufs />} />
//             <Route path="historique" element={<ProductionHistorique />} />
//           </Route>

//           {/* Alimentations & Stocks */}
//           <Route path="alimentations-stocks">
//             <Route path="rations" element={<Rations />} />
//             <Route path="stocks" element={<Stocks />} />
//             <Route path="fournisseurs" element={<Fournisseurs />} />
//             <Route path="commandes" element={<Commandes />} />
//           </Route>

//           {/* Rapports & Statistiques */}
//           <Route path="rapports-statistiques">
//             <Route path="dashboard" element={<RapportsDashboard />} />
//             <Route path="productions" element={<RapportsProductions />} />
//             <Route path="sante" element={<RapportsSante />} />
//             <Route path="financier" element={<RapportsFinancier />} />
//             <Route path="exports" element={<RapportsExports />} />
//           </Route>

//           {/* Paramètres */}
//           <Route path="parametres">
//             <Route path="ferme" element={<ParametresFerme />} />
//             <Route path="utilisateurs" element={<ParametresUtilisateurs />} />
//             <Route path="notifications" element={<ParametresNotifications />} />
//             <Route path="systeme" element={<ParametresSysteme />} />
//           </Route>

//           {/* Autres pages */}
//           <Route path="profile" element={<Profile />} />
//         </Route>

//         {/* Page 404 */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
