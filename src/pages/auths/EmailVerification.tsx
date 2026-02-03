import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { resendOtp, verifyEmailOTP } from "../../store/auth/action";
import { clearAuthError, resetAuthStatus, selectAuthenticatedUser,selectAuthStatus } from "../../store/auth/slice";
import { toast } from "react-toastify";
import { PATH_AUTH } from "../../constants/paths";
import { LoadingType } from "../../models/store";

const EmailVerification: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authState = useAppSelector(selectAuthenticatedUser);
  const status = useAppSelector(selectAuthStatus);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Récupérer l'email depuis le state de navigation
  const emailFromState = location.state?.email  ;
const userEmail = authState?.user?.email || emailFromState;

  // Rediriger si pas d'email disponible
  useEffect(() => {
    if (!userEmail) {
      toast.warning("Veuillez d'abord vous inscrire ou vous connecter");
      navigate(PATH_AUTH.REGISTER, { replace: true });
    }

    // 2. Si l'utilisateur est déjà vérifié dans Redux -> redirection vers dashboard
  if (authState?.user?.emailVerified === true) {
    toast.info("Votre email est déjà vérifié.");
    navigate("/", { replace: true }); // Ou ton chemin dashboard
  }
  }, [userEmail, navigate, authState?.user?.emailVerified]);
  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(resetAuthStatus());
    };
  }, [dispatch]);

  // Gestion du countdown pour le renvoi
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const initialValues = { otp: "" };

  const validationSchema = Yup.object({
    otp: Yup.string()
      .required("Code OTP requis")
      .matches(/^\d{6}$/, "Le code OTP doit contenir exactement 6 chiffres")
      .length(6, "Le code OTP doit contenir 6 chiffres"),
  });

  const handleVerify = async (
    values: typeof initialValues, 
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    if (!userEmail) {
      toast.error("Email manquant");
      setSubmitting(false);
      return;
    }

    try {
      await dispatch(verifyEmailOTP({ 
        otp: values.otp,
        email: userEmail 
      })).unwrap();
      
      toast.success("Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
      
      // Redirection vers le login après vérification
      setTimeout(() => {
        navigate(PATH_AUTH.LOGIN, { replace: true });
      }, 1500);
    } catch (error: unknown) {
      console.error("Verification error:", error);
      
      // Extraction des informations d'erreur
      const getErrorInfo = (err: unknown): { message: string; code?: number } => {
        if (err && typeof err === 'object') {
          const message = 'message' in err && typeof err.message === 'string' 
            ? err.message 
            : 'meta' in err && err.meta && typeof err.meta === 'object' && 'message' in err.meta
            ? String(err.meta.message)
            : "Erreur lors de la vérification";
          
          const code = 'code' in err && typeof err.code === 'number' 
            ? err.code 
            : 'status' in err && typeof err.status === 'number'
            ? err.status
            : undefined;
          
          return { message, code };
        }
        return { message: "Erreur lors de la vérification" };
      };

      const { message: errorMessage, code: errorCode } = getErrorInfo(error);
      
      // Gestion des erreurs spécifiques
      if (errorCode === 400) {
        toast.error("Code OTP invalide");
      } else if (errorCode === 410 || errorCode === 404) {
        toast.error("Code OTP expiré. Veuillez en demander un nouveau");
      } else if (errorMessage.toLowerCase().includes("invalide")) {
        toast.error("Code OTP invalide");
      } else if (errorMessage.toLowerCase().includes("expiré")) {
        toast.error("Code OTP expiré. Veuillez en demander un nouveau");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!userEmail) {
      toast.error("Email manquant");
      return;
    }

    if (countdown > 0) {
      toast.info(`Veuillez attendre ${countdown} secondes avant de renvoyer`);
      return;
    }

    setResendLoading(true);
    try {
      await dispatch(resendOtp({ email: userEmail })).unwrap();

      toast.success("Un nouveau code OTP a été envoyé à votre email !");
      setCountdown(60); 
    } catch (error: unknown) {      
      const getErrorInfo = (err: unknown): { message: string; code?: number } => {
        if (err && typeof err === 'object') {
          const message = 'message' in err && typeof err.message === 'string' 
            ? err.message 
            : 'meta' in err && err.meta && typeof err.meta === 'object' && 'message' in err.meta
            ? String(err.meta.message)
            : "Erreur lors de l'envoi du code";
          
          const code = 'code' in err && typeof err.code === 'number' 
            ? err.code 
            : 'status' in err && typeof err.status === 'number'
            ? err.status
            : undefined;
          
          return { message, code };
        }
        return { message: "Erreur lors de l'envoi du code" };
      };

      const { message: errorMessage, code: errorCode } = getErrorInfo(error);
      
      if (errorCode === 429) {
        toast.error("Trop de tentatives. Veuillez réessayer plus tard");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setResendLoading(false);
    }
  };

  const isLoading = status === LoadingType.PENDING;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* Icône de vérification */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <svg
              className="w-12 h-12 text-[#0D8849]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Vérification de l'email
        </h2>
        
        <p className="text-gray-600 mb-4 text-center text-sm">
          Nous avons envoyé un code de vérification à 6 chiffres à l'adresse :
        </p>

        {userEmail && (
          <p className="text-center mb-6">
            <strong className="text-[#0D8849]">{userEmail}</strong>
          </p>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleVerify}
          enableReinitialize
        >
          {({ isSubmitting, values }) => (
            <Form className="flex flex-col gap-4">
              <Input 
                name="otp" 
                label="Code de vérification"
                placeholder="000000" 
                disabled={isLoading || isSubmitting}
                maxLength={6}
                autoComplete="one-time-code"
                className="text-center text-2xl tracking-widest font-mono"
                required
              />

              <Button
                type="submit"
                disabled={isSubmitting || isLoading || values.otp.length !== 6}
                className="w-full py-3 bg-[#0D8849] hover:bg-[#0a6d3a] flex justify-center text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading || isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Vérification en cours...
                  </span>
                ) : (
                  "Vérifier le code"
                )}
              </Button>
            </Form>
          )}
        </Formik>

        {/* Bouton de renvoi */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Vous n'avez pas reçu le code ?
          </p>
          <button
            onClick={handleResend}
            disabled={resendLoading || countdown > 0 || isLoading}
            className="text-[#0D8849] hover:text-[#0a6d3a] font-medium text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline transition-colors"
          >
            {resendLoading ? (
              <span className="flex items-center justify-center gap-1">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Envoi en cours...
              </span>
            ) : countdown > 0 ? (
              `Renvoyer dans ${countdown}s`
            ) : (
              "Renvoyer le code"
            )}
          </button>
        </div>

        {/* Lien retour */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <button
            onClick={() => navigate(PATH_AUTH.LOGIN)}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center gap-1"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Retour à la connexion
          </button>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <svg 
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
            <p className="text-xs text-blue-800">
              Le code expire dans <strong>10 minutes</strong>. Vérifiez vos spams si vous ne le recevez pas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;