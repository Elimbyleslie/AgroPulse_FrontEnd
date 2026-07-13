import React, { useEffect } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { loginAction } from "../../store/auth/action";
import {
  clearAuthError,
  resetAuthStatus,
  selectAuthStatus,
  selectAuthError,
} from "../../store/auth/slice";
import Input from "../../components/UI/Input";
import PasswordInput from "../../components/UI/PasswordInput";
import Button from "../../components/UI/Button";
import { PATH_AUTH } from "../../constants/paths";
import { UserLoginForm } from "../../models/user";
import { toast } from "react-toastify";
import { ApiError, LoadingType } from "../../models/store";
import GoogleLoginButton from "../../components/UI/GoogleLoginButton";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // ✅ Utilisation des bons sélecteurs
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);

  // Nettoyage des erreurs au démontage
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(resetAuthStatus());
    };
  }, [dispatch]);

  const handleSubmit = async (
    values: UserLoginForm,
    { setSubmitting, setErrors }: FormikHelpers<UserLoginForm>
  ) => {
    try {
      dispatch(clearAuthError());
      await dispatch(loginAction(values)).unwrap();
      toast.success("Connexion réussie !");
      // verifier si l'user a fini le onboarding
      if (values.onboardingComplete === false) {
        navigate("/auth/onboarding", { replace: true });
      } else {
        navigate("/main", { replace: true });
      }
    } catch (err: unknown) {
      const error = err as ApiError<{
        emailVerified?: boolean;
        email?: string;
      }>;

      // 🔴 EMAIL NON VÉRIFIÉ → resend OTP automatique
      if (
        error.meta?.status === 403 &&
        error.error?.emailVerified === false &&
        error.error?.email
      ) {
        toast.warning(
          "Votre email n'est pas encore vérifié. Un code OTP a été renvoyé."
        );
        navigate(PATH_AUTH.VERIFY_EMAIL_OTP, {
          replace: true,
          state: { email: error.error.email },
        });
        return;
      }

      // 🔴 IDENTIFIANTS INCORRECTS
      if (error.meta?.status === 401) {
        setErrors({
          email: "",
          password: "Email ou mot de passe incorrect",
        });
        return;
      }

      // 🔴 AUTRES ERREURS
      toast.error(error.meta?.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      const googleAuthUrl = `${import.meta.env.VITE_API_URL}${PATH_AUTH.GOOGLE}`;
      
      if (!import.meta.env.VITE_API_URL) {
        toast.error("Configuration de l'authentification Google manquante");
        return;
      }
      
      window.location.href = googleAuthUrl;
    } catch (error: unknown) {
      console.error("Google login error:", error);
      toast.error("Erreur lors de la connexion Google");
    }
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email invalide")
      .required("Email requis")
      .trim(),
    password: Yup.string()
      .required("Mot de passe requis")
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  });

  // ✅ Utilisation de LoadingType.PENDING
  const isLoading = authStatus === LoadingType.PENDING;

  return (
    <div className="flex h-screen w-full bg-white text-gray-900">
      {/* IMAGE */}
      <div
        className="hidden md:flex w-1/2 bg-cover h-full bg-center relative"
        style={{
          backgroundImage:
            "url('/images/ac1f657fd8bb7ee744e678485745de63.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="relative z-10 p-10 text-center flex flex-col justify-center items-center text-white">
          <h2 className="text-4xl font-bold">Heureux de vous revoir !</h2>
          <p className="mt-4 text-lg">
            Connectez-vous pour continuer à gérer votre ferme avec AgroPulse.
          </p>
        </div>
      </div>

      {/* FORMULAIRE */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold text-center mb-6 text-vert">
            Connexion
          </h1>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col gap-4 justify-center items-center">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  disabled={isLoading || isSubmitting}
                  autoComplete="email"
                />
                <PasswordInput
                  name="password"
                  placeholder="Mot de passe"
                  disabled={isLoading || isSubmitting}
                  autoComplete="current-password"
                />

                <div className="w-full flex justify-end text-sm mb-2 text-vert">
                  <Link
                    to={PATH_AUTH.FORGOT_PASSWORD}
                    className="hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* ✅ Affichage conditionnel de l'erreur */}
                {authError && (
                  <div className="w-full text-red-600 text-sm text-center">
                    {authError.meta?.message || "Une erreur est survenue"}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full py-3 mt-4 font-bold flex justify-center rounded-lg text-white bg-[#0D8849] hover:bg-dark_vert disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={isSubmitting || isLoading}
                >
                  {isLoading || isSubmitting
                    ? "Connexion en cours..."
                    : "Se connecter"}
                </Button>
              </Form>
            )}
          </Formik>

          <div className="mt-8 flex flex-col gap-3 items-center text-sm text-gray-500">
            <div className="my-4 flex items-center w-full">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="px-3 text-sm text-gray-500">OU</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <GoogleLoginButton
              onClick={handleGoogleLogin}
              disabled={isLoading}
            />
          </div>

          <div className="mt-4 text-center">
            Vous n'avez pas de compte ?{" "}
            <Link
              to={PATH_AUTH.REGISTER}
              className="text-[#E3BA3E] hover:underline font-medium"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;