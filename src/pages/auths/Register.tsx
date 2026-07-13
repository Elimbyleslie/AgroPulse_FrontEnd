import React, { useEffect } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { register } from "../../store/auth/action";
import {
  clearAuthError,
  resetAuthStatus,
  selectAuthStatus,
  selectAuthError,
} from "../../store/auth/slice";
import Input from "../../components/UI/Input";
import PasswordInput from "../../components/UI/PasswordInput";
import PhoneInput from '../../components/UI/PhoneInput'
import Button from "../../components/UI/Button";
import { PATH_AUTH } from "../../constants/paths";
import { UserRegisterForm } from "../../models/user";
import { toast } from "react-toastify";
import { ApiError, LoadingType } from "../../models/store";
import GoogleLoginButton from "../../components/UI/GoogleLoginButton";

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  //  Utilisation des bons sélecteurs
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
    values: UserRegisterForm,
    { setSubmitting, setErrors }: FormikHelpers<UserRegisterForm>
  ) => {
    try {
      dispatch(clearAuthError());
      await dispatch(register(values)).unwrap();
      toast.success("Inscription réussie ! Vérifiez votre email.");
      navigate(PATH_AUTH.VERIFY_EMAIL_OTP, {
        replace: true,
        state: { email: values.email },
      });
    } catch (err: unknown) {
      const error = err as ApiError;

      // 🔴 EMAIL DÉJÀ UTILISÉ
      if (error.meta?.status === 409) {
        setErrors({
          email: "Cet email est déjà utilisé",
        });
        return;
      }

      // 🔴 USERNAME DÉJÀ UTILISÉ
      if (error.meta?.status === 400 && error.meta?.message?.includes("username")) {
        setErrors({
          userName: "Ce nom d'utilisateur est déjà pris",
        });
        return;
      }

      // 🔴 ERREURS DE VALIDATION
      if (error.meta?.status === 400 && error.error) {
        setErrors(error.error);
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
    name: Yup.string()
      .required("Nom requis")
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .trim(),
    userName: Yup.string()
      .required("Nom d'utilisateur requis")
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
      .matches(
        /^[a-zA-Z0-9_]+$/,
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
      )
      .trim(),
    email: Yup.string()
      .email("Email invalide")
      .required("Email requis")
      .trim(),
    phone: Yup.string()
      .required("Numéro de téléphone requis"),
    password: Yup.string()
      .required("Mot de passe requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    passwordConfirmation: Yup.string()
      .required("Confirmation du mot de passe requise")
      .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas"),
     
  });

  // ✅ Utilisation de LoadingType.PENDING
  const isLoading = authStatus === LoadingType.PENDING;

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 ">
     
      <div
        className="hidden md:flex w-1/2 bg-cover h-full bg-center relative"
        style={{
          backgroundImage:
            "url('/images/ac1f657fd8bb7ee744e678485745de63.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="relative z-10 p-10 text-center flex flex-col justify-center items-center text-white">
          <h2 className="text-4xl font-bold">Bienvenue sur AgroPulse !</h2>
          <p className="mt-4 text-lg">
            Créez votre compte pour commencer à gérer votre ferme intelligemment.
          </p>
        </div>
      </div>

      {/* FORMULAIRE */}
      <div className="flex w-full md:w-1/2 justify-center items-center pt-40 overflow-y-auto px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold text-center mb-6 text-jaune">
            Inscrivez-vous sur <span>Agro</span><span>Pulse</span>
          </h1>

          <Formik<UserRegisterForm> 
            initialValues={{
              name: "",
              userName: "",
              email: "",
              password: "",
              passwordConfirmation:"",
              phone:"",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit} enableReinitialize>
            {({ isSubmitting }) => (
              <Form className="flex flex-col gap-4 justify-center items-center">
                <Input
                  name="name"
                  type="text"
                  placeholder="Nom complet"
                  disabled={isLoading || isSubmitting}
                  autoComplete="name"
                />

                <Input
                  name="userName"
                  type="text"
                  placeholder="Nom d'utilisateur"
                  disabled={isLoading || isSubmitting}
                  autoComplete="userName"
                />

                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  disabled={isLoading || isSubmitting}
                  autoComplete="email"
                />

                <PhoneInput
                  name="phone"
                  placeholder="Numéro de téléphone"
                  disabled={isLoading || isSubmitting}
                  
                />

                <PasswordInput
                  name="password"
                  placeholder="Mot de passe"
                  disabled={isLoading || isSubmitting}
                  autoComplete="new-password"
                />

                <PasswordInput
                  name="passwordConfirmation"
                  placeholder="Confirmer le mot de passe"
                  disabled={isLoading || isSubmitting}
                  autoComplete="new-password"
                />

                {/* ✅ Affichage conditionnel de l'erreur */}
                {authError && (
                  <div className="w-full text-red-600 text-sm text-center">
                    {authError.meta?.message || "Une erreur est survenue"}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full py-3 mt-4 font-bold flex justify-center rounded-lg text-white bg-jaune hover:bg-darkJaune  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={isSubmitting || isLoading}
                >
                  {isLoading || isSubmitting
                    ? "Inscription en cours..."
                    : "S'inscrire"}
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
            Vous avez déjà un compte ?{" "}
            <Link
              to={PATH_AUTH.LOGIN}
              className="text-[#E3BA3E] hover:underline font-medium"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;