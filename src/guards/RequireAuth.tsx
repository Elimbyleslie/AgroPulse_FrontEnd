import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/store";
import { 
  selectIsAuthenticated, 
  selectAuthStatus,
  selectAuthenticatedUser
   // Ajouté pour vérifier l'email
} from "../store/auth/slice";
import { LoadingType } from "../models/store";
import { PATH_AUTH } from "../constants/paths";
import { Loader2 } from "lucide-react";
import { AgroPulseStorage } from "./storage";

const RequireAuth = () => {
  const location = useLocation();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authStatus = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectAuthenticatedUser);
  const accessToken = AgroPulseStorage.getAccessToken(); // Vérification du token d'accès

  // 1️⃣ Chargement initial : On attend que Redux finisse ses appels API
  // (Très important pour le GoogleCallback et le rafraîchissement de page)
  if (authStatus === LoadingType.PENDING && !isAuthenticated) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600 mb-2" size={40} />
        <p className="text-gray-500 animate-pulse">Vérification de la session...</p>
      </div>
    );
  }

  if (accessToken && authStatus === LoadingType.REJECTED) {
    return <Navigate to={PATH_AUTH.LOGIN} state={{ from: location }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to={PATH_AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // 3️⃣ Authentifié mais EMAIL NON VÉRIFIÉ
  // On redirige vers l'OTP sauf si on y est déjà
  if (user && user.user?.emailVerified === false) {
    if (location.pathname !== PATH_AUTH.VERIFY_EMAIL_OTP) {
      return <Navigate to={PATH_AUTH.VERIFY_EMAIL_OTP} state={{ email: user.user.email }} replace />;
    }
  }

  // 4️⃣ Tout est OK : On affiche l'application
  return <Outlet />;
};

export default RequireAuth;