import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks/store";
import { fetchCurrentUser, refreshToken } from "./store/auth/action";
import { AgroPulseStorage } from "./guards/storage";

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
import AnimalHistory from "./pages/main/animals/animalHistory";
import GroupAnimal from "./pages/main/animals/GroupAnimal";
import ConsultationDashboard from "./pages/main/health/ConsultationDashboard";
import VaccinationDashboard from "./pages/main/health/VaccinationDashboard";
import AlertDashboard from "./pages/main/alerts";
import ReproductionDashboard from "./pages/main/reproduction/cycleGestation";
import BirthDashboard from "./pages/main/reproduction/BirthDashBoard";
import GeneticPerformanceList from "./pages/main/reproduction/performance";
import FeedingPlanDashboard from "./pages/main/Alimentation/FeedingPlanDashboard";
import FeedStockDashboard from "./pages/main/Alimentation/FeedStockDashboard";
import ProductionTableau from "./pages/main/production/ProductionDashBoard";
import DailyProduction from "./pages/main/production/DailyProduction";
import PerfomancePage from "./pages/main/production/PerfomancePage";
import LotAnalysis from "./pages/main/production/LotAnalysis";
import ProductionCurves from "./pages/main/production/ProductionCurves";
import ExpensesPage from "./pages/main/gestionFinanciere/ExpensesPages";
import VentesProduitsDashboard from "./pages/main/gestionFinanciere/VentesProduitsDashboard";
import ProfitLossPage from "./pages/main/gestionFinanciere/ProfitLossPage";
import ClientDashboard from "./pages/main/ClientDashboard";
import InventoryGeneralDashboard from "./pages/main/stock&inventory/InventoryGeneralDashboard";
import StockMovementsDashboard from "./pages/main/stock&inventory/StockMovementsDashboard";
import PurchasesSuppliersDashboard from "./pages/main/stock&inventory/PurchasesSupliersDashboard";
import EquipmentMaintenanceDashboard from "./pages/main/stock&inventory/EquipmentMaintenanceDashboard";
import MonAbonnementDashboard from "./pages/main/Abonnement&Facturation/MonAbonnement";
import HistoriquePaiements from "./pages/main/Abonnement&Facturation/HistoryPayments";
import HistoriqueFactures from "./pages/main/Abonnement&Facturation/InvoicesHistory";
import GestionOffres from "./pages/main/Abonnement&Facturation/GestionOffres";
import OrganizationDetailPage from "./pages/main/dash/organisation";
import UsersManagementDashboard from "./pages/main/Administration/gestionUtilisateur";
import RolesPermissionsDashboard from "./pages/main/Administration/Role&Permissions";
import SettingsDashboard from "./pages/main/Administration/settings";
import TasksListPage from "./pages/main/taches&Planifications/TaskListPage";
import TasksCalendarPage from "./pages/main/taches&Planifications/TaskCalendar";
import MyTasksPage from "./pages/main/taches&Planifications/MesTaches";
import NotificationsDashboard from "./pages/main/Notification";
import InvitationsPage from "./pages/main/dash/invitationsPage";
import MembersPage from "./pages/main/dash/MemberPage";
import AuditPage from "./pages/main/Administration/Audit";
import PaymentsDashboard from "./pages/main/gestionFinanciere/PaymentDash";
import ProfilePage from './pages/main/User/Profile';
import SettingsPage from './pages/main/User/settingsPage';
// import ActivityLogPage from './pages/main/Administration/JournalActivites';
import GenealogyTreePage from "./pages/main/reproduction/Pedigree";
function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadUser = async () => {
      const accessToken = AgroPulseStorage.getAccessToken();
      const refreshTok = AgroPulseStorage.getRefreshToken();

      try {
        if (!accessToken && refreshTok) {
          await dispatch(refreshToken()).unwrap();
        }
        await dispatch(fetchCurrentUser()).unwrap();
      } catch {
        // Session expirée — silencieux
      }
    };

    loadUser();
  }, [dispatch]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* ── SITE D'ACCUEIL ── */}
          <Route path="/" element={<WelcomePagesLayout />}>
            <Route index element={<Navigate to="home" />} />
            <Route path="home" element={<Home />} />
            <Route path="tarif" element={<Tarif />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ── AUTHENTIFICATION ── */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="/auth/login" />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify-email-otp" element={<EmailVerification />} />
            <Route path="google/callback" element={<GoogleCallback />} />
            <Route path="onboarding" element={<EmptyDashboard />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/main" element={<MainLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route
                path="notifications"
                element={<NotificationsDashboard />}
              />
              {/* ── Tableau de Bord ── */}
              <Route path="dashboard" element={<MainDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />


              {/* ── Tâches & Planification ── */}

              <Route path="tasks" element={<TasksListPage />} />
              <Route path="tasks/calendar" element={<TasksCalendarPage />} />
              <Route path="tasks/myTasks" element={<MyTasksPage />} />

              {/* ── Gestion du Cheptel ── */}
              <Route path="animals" element={<AnimalList />} />
              <Route path="animals/:id" element={<AnimalDetail />} />
              <Route path="animals/tracking" element={<AnimalTracking />} />
              <Route path="animals/groups" element={<GroupAnimal />} />
              <Route path="animals/:id/history" element={<AnimalHistory />} />

              {/* ── Santé Animale ── */}
              <Route
                path="health/consultations"
                element={<ConsultationDashboard />}
              />
              <Route path="health/vaccins" element={<VaccinationDashboard />} />
              <Route path="health/alerts" element={<AlertDashboard />} />

              {/* ── Reproduction ── */}
              <Route
                path="reproduction/cycles"
                element={<ReproductionDashboard />}
              />
              <Route path="reproduction/births" element={<BirthDashboard />} />
              <Route
                path="reproduction/genetic"
                element={<GeneticPerformanceList />}
              />
              <Route
                path="reproduction/pedigree"
                element={<GenealogyTreePage />}
              />

              {/* ── Alimentation ── */}
              <Route
                path="feeding/rations"
                element={<FeedingPlanDashboard />}
              />
              <Route
                path="feeding/feedstock"
                element={<FeedStockDashboard />}
              />

              {/* ── Production ── */}
              <Route
                path="production/dashboard"
                element={<ProductionTableau />}
              />
              <Route path="production/daily" element={<DailyProduction />} />
              <Route
                path="production/performances"
                element={<PerfomancePage />}
              />
              <Route path="production/lots" element={<LotAnalysis />} />
              <Route path="production/curves" element={<ProductionCurves />} />

              {/* ── Finance & Ventes ── */}
              <Route path="finance/expenses" element={<ExpensesPage />} />
              <Route
                path="finance/sales"
                element={<VentesProduitsDashboard />}
              />
              <Route path="finance/reports" element={<ProfitLossPage />} />
              <Route path="finance/clients" element={<ClientDashboard />} />
              <Route path="finance/payments" element={<PaymentsDashboard />} />

              {/* ── Stocks & Matériel ── */}
              <Route path="inventory" element={<InventoryGeneralDashboard />} />
              <Route
                path="inventory/movements"
                element={<StockMovementsDashboard />}
              />
              <Route
                path="inventory/purchases"
                element={<PurchasesSuppliersDashboard />}
              />
              <Route
                path="inventory/equipment"
                element={<EquipmentMaintenanceDashboard />}
              />

              {/* ── Abonnement ── */}
              <Route path="subscription" element={<MonAbonnementDashboard />} />
              <Route
                path="subscription/payments"
                element={<HistoriquePaiements />}
              />
              <Route
                path="subscription/invoices"
                element={<HistoriqueFactures />}
              />
              <Route path="subscription/plans" element={<GestionOffres />} />

              {/* ── Mon Organisation ── */}
              <Route path="organization" element={<OrganizationDetailPage />} />
              <Route
                path="organization/settings"
                element={<SettingsDashboard />}
              />
              <Route
                path="organization/invitations"
                element={<InvitationsPage />}
              />
              <Route path="organization/members" element={<MembersPage />} />

              {/* ── Administration ── */}
              <Route
                path="admin/users"
                element={<UsersManagementDashboard />}
              />
              <Route
                path="admin/roles"
                element={<RolesPermissionsDashboard />}
              />
              {/* <Route path="admin/activity" element={<ActivityLogPage />} /> */}
              <Route path="admin/audit" element={<AuditPage />} />
              <Route path="*" element={<NotFoundMain />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium"
      />
    </>
  );
}

export default App;
