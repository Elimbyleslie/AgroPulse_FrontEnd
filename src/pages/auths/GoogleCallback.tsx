import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../hooks/store";
import { PATH_AUTH } from "../../constants/paths";
import { setAccessToken } from "../../store/auth/slice";
import { useEffect, useRef } from "react";
import { getMe } from "../../store/auth/action";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isProcessing = useRef(false);

  useEffect(() => {
    // Empêche la double exécution en mode StrictMode
    if (isProcessing.current) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      isProcessing.current = true;

      const processLogin = async () => {
        try {
          // 1. Enregistre le token immédiatement dans le store et le storage
          dispatch(setAccessToken(token));

          // 2. Récupère le profil complet (déclenché par le jeton tout juste enregistré)
          // .unwrap() renvoie le payload (le contenu de response.data dans ton action)
          const response = await dispatch(getMe()).unwrap();
          
          console.log("🔍 Réponse déballée de getMe:", response);

          // 3. Extraction sécurisée selon ta structure : { data: { user: { ... } } }
          // On vérifie response.data.user (si l'action retourne response.data)
          // ou response.user (si l'action retourne directement l'objet métier)
          // 1. Extraction précise
// Puisque ta console montre { "user": { ... } }, on accède directement à response.user
const userData = response?.data?.user; 

console.log("👤 userData extrait avec succès:", userData);

// 2. Vérification
if (!userData || !userData.email) {
  console.error("❌ Erreur : userData est vide ou sans email", userData);
  throw new Error("Structure de données utilisateur invalide");
}

// 3. Suite de la logique (Redirect)
toast.success(`Bienvenue ${userData.name}`);

if (userData.emailVerified === false) {
  navigate(PATH_AUTH.VERIFY_EMAIL_OTP, { 
    state: { email: userData.email }, 
    replace: true 
  });
} else {
  // Puisque emailVerified est true dans ton log, il ira ici :
  navigate("/main/onboarding", { replace: true });
}
        } catch (err) {
          console.error("Erreur lors de la synchronisation Google:", err);
          toast.error("Échec de la connexion : profil introuvable");
          navigate(PATH_AUTH.LOGIN, { replace: true });
        }
      };

      processLogin();
    } else {
      // Cas où on arrive sur cette page sans token (erreur ou accès direct)
      const error = params.get("error");
      if (error) console.error("Google Auth Error:", error);
      
      toast.error("Session Google expirée ou invalide");
      navigate(PATH_AUTH.LOGIN, { replace: true });
    }
  }, [dispatch, navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner AgroPulse aux couleurs de ta charte */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0D8849] border-t-transparent"></div>
        <span className="animate-pulse text-lg font-medium text-gray-600">
          Finalisation de la connexion...
        </span>
      </div>
    </div>
  );
};

export default GoogleCallback;