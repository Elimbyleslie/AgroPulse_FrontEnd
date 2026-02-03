/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";

import Input from "../UI/Input";
import Button from "../UI/Button";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { createOrganization, fetchWithAuthOrganizations } from "../../store/organization/action";
import { 
  selectOrganizations,
  selectCreateOrganizationStatus,
  selectOrganizationsStatus
} from "../../store/organization/slice";
import { LoadingType } from "../../models/store";
import { AgroPulseStorage } from "../../guards/storage";
import { fetchCurrentUser } from "../../store/auth/action";

interface OrganizationFormProps {
  onSuccess: () => void;
}

interface FormValues {
  name: string;
  address: string;
  ownerName: string;
  email: string;
  phone: string;
}

const validationSchema = Yup.object({
  name: Yup.string().trim().min(2, "Minimum 2 caractères").required("Requis"),
  address: Yup.string().trim().min(5, "Minimum 5 caractères").required("Requis"),
  ownerName: Yup.string().trim().required("Requis"),
  email: Yup.string().email("Email invalide").required("Requis"),
  phone: Yup.string().required("Requis"),
});

const initialValues: FormValues = {
  name: "",
  address: "",
  ownerName: "",
  email: "",
  phone: "",
};

function OrganizationForm({ onSuccess }: OrganizationFormProps) {
  const dispatch = useAppDispatch();

  const authState = useAppSelector((state) => state.authentification);
  const userFromStore = authState.auth.user;
  const userFromStorage = AgroPulseStorage.getUser();
  
  const finalUserId = useMemo(() => {
    const id = userFromStore?.id || userFromStore?.id || userFromStorage?.id_user || userFromStorage?.id;
    return id ? Number(id) : null;
  }, [userFromStore, userFromStorage]);

  const organizations = useAppSelector(selectOrganizations);
  const orgStatus = useAppSelector(selectOrganizationsStatus);
  const createStatus = useAppSelector(selectCreateOrganizationStatus);

  useEffect(() => {
    dispatch(fetchWithAuthOrganizations({ page: 1, limit: 10 }));
  }, [dispatch]);

  const hasExistingOrg = useMemo(() => {
    if (!finalUserId || !organizations || !Array.isArray(organizations)) return false;
    return organizations.some((org) => Number(org.ownerId) === finalUserId);
  }, [organizations, finalUserId]);

  if (orgStatus === LoadingType.PENDING && organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="animate-spin text-green-600 mb-4" size={40} />
        <p className="text-gray-600 font-medium">Analyse de votre compte...</p>
      </div>
    );
  }

  // Dans ton composant de création d'organisation (Frontend)
  


  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setErrors }: FormikHelpers<FormValues>
  ) => {
    if (hasExistingOrg) {
      onSuccess();
      return;
    }

    if (!finalUserId) {
      toast.error("Utilisateur non identifié. Reconnectez-vous.");
      return;
    }

    try {
      await dispatch(
        createOrganization({
          ...values,
          ownerId: finalUserId,
        })
      ).unwrap();
      await dispatch(fetchCurrentUser()).unwrap(); 
      toast.success("Organisation configurée avec succès !");
      setTimeout(() => {
        onSuccess();
      }, 800);

    } catch (error: any) {
      console.error("Erreur formulaire:", error);

      // Grâce au nouveau fetchWithAuth, l'objet contient forcément meta
      const message = error?.meta?.message || error?.message || "Erreur de création";
      const status = error?.meta?.status || error?.status;

      toast.error(message);

      if (status === 409) {
        setErrors({ name: "Ce nom d'organisation est déjà utilisé." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasExistingOrg ? 'bg-blue-100' : 'bg-green-100'}`}>
          <Building2 className={hasExistingOrg ? 'text-blue-700' : 'text-green-700'} size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {hasExistingOrg ? "Organisation prête" : "Votre organisation"}
          </h2>
          <p className="text-sm text-gray-500">
            {hasExistingOrg 
              ? "Nous avons détecté votre configuration." 
              : "Remplissez ces informations pour commencer."}
          </p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize // Important pour rafraîchir le formulaire si besoin
      >
        {({ isSubmitting, isValid }) => (
          <Form className="space-y-5 px-4">
            <div className={hasExistingOrg ? "opacity-40 pointer-events-none" : ""}>
              <Input label="Nom de l'organisation" name="name" disabled={hasExistingOrg} />
              <Input label="Adresse" name="address" disabled={hasExistingOrg} />
              <Input label="Nom du propriétaire" name="ownerName" disabled={hasExistingOrg} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Email" name="email" type="email" disabled={hasExistingOrg} />
                <Input label="Téléphone" name="phone" type="tel" disabled={hasExistingOrg} />
              </div>
            </div>

            <div className="pt-4">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting || (!hasExistingOrg && !isValid)}
                  className={`w-full py-3 flex items-center justify-center gap-2 transition-all ${
                    hasExistingOrg 
                      ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100" 
                      : "bg-green-600 hover:bg-green-700 shadow-green-100"
                  } text-white rounded-xl shadow-lg`}
                >
                  {createStatus === LoadingType.PENDING ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : hasExistingOrg ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Complété (Continuer)</span>
                    </>
                  ) : (
                    "Créer l'organisation"
                  )}
                </Button>
              </motion.div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default OrganizationForm;