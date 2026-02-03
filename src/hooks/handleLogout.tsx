import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/store";
import { logoutLocal } from "../store/auth/slice";
import { logout } from "../store/auth/action"; 
import { PATH_AUTH } from "../constants/paths";
import { toast } from "react-toastify";

 const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        // 1. Appeler l'API de déconnexion
      await dispatch(logout()).unwrap(); 
      // 2. Nettoyer Redux et LocalStorage
      dispatch(logoutLocal());
      
      // 3. Rediriger proprement
      navigate(PATH_AUTH.LOGIN, { replace: true });
      toast.info("Déconnexion réussie");
    } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
      dispatch(logoutLocal());
      navigate(PATH_AUTH.LOGIN, { replace: true });
    }
  };

  return { handleLogout };
};

export default useLogout;