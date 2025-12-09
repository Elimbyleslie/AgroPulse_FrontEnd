// components/Authenticated.tsx
import React, { PropsWithChildren, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { PATH_AUTH } from "../constants/paths";
import { toast } from "react-toastify";
import { selectAuthenticatedUser } from "../store/auth/slice";
import { useAppDispatch, useAppSelector } from "../hooks/store";
import { resendOtp } from "../store/auth/action";

const Authenticated: React.FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuthenticatedUser);
  const location = useLocation();

  // Fonction pour renvoyer le code OTP
  const handleResendOtpCode = async () => {
    if (!auth.user?.user.email) return;

    try {
      const resultAction = await dispatch(
        resendOtp({ email: auth.user.user.email })
      );

      if (resultAction.meta.requestStatus === "fulfilled") {
        toast.success("Code OTP renvoyé avec succès !", { autoClose: 5000 });
      } else {
        toast.error("Échec du renvoi du code OTP.", { autoClose: 5000 });
      }
    } catch(error) {
     console.error("Erreur lors de la vérification :", error);
      toast.error("Une erreur est survenue.", { autoClose: 5000 });
        
    }
  };

  // 🔹 Hooks au top level
  useEffect(() => {
    if (auth?.user && !auth.user.user.emailVerified) {
      handleResendOtpCode();
    }
  }, [auth?.user?.user.emailVerified]);

  // 🔹 Retour conditionnel
  if (!auth || !auth.token) {
    return <Navigate to={PATH_AUTH.LOGIN} state={{ from: location }} replace />;
  }

  if (!auth.user?.user.emailVerified) {
    toast.dismiss();
    return (
      <Navigate
        to={PATH_AUTH.VERIFY_OTP}
        state={{ email: auth.user?.user.email }}
        replace
      />
    );
  }

  // Tout est OK, on affiche les enfants
  return <>{children}</>;
};

export default Authenticated;
