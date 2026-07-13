import { Home, MapPin, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { createFarm } from "../../store/farm/action";
import { FarmCreateInput as FarmFormData } from "../../models/farm";
import { RootState } from "../../store";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { toast } from "react-toastify";

import { AgroPulseStorage } from "../../guards/storage"
interface FarmFormProps {
  organizationId?: number;
  onSuccess: () => void;
}

type FormValues = {
  name: string;
  location: string;
  area: number;
  areaUnit: string;
  photo: string;
};

const AREA_UNITS = [
  { value: "hectare", label: "Hectare (ha)" },
  { value: "acre", label: "Acre" },
  { value: "m2", label: "Mètre carré (m²)" },
  { value: "km2", label: "Kilomètre carré (km²)" },
];

export default function FarmForm({ organizationId, onSuccess }: FarmFormProps) {
  const dispatch = useAppDispatch();
const authUser = useAppSelector((state: RootState) => state.authentification.auth.user);
  const organizations = useAppSelector(
    (state: RootState) => state.organizations.organizationList.entities ?? []
  );


  const finalOrgId = organizationId || organizations[0]?.id;
  const organization = organizations.find(org => org.id === finalOrgId);
const managerId = authUser?.id || authUser?.id || AgroPulseStorage.getUser()?.user?.id || AgroPulseStorage.getUser()?.id;

 useEffect(() => {
  console.log("========== TEST PERSISTANCE ==========");
  console.log("1. Manager ID (Redux):",managerId);
  console.log("2. Token (Storage):", AgroPulseStorage.getAccessToken());
  console.log("3. User (Storage):", AgroPulseStorage.getUser());
  console.log("4. ID from Storage:", AgroPulseStorage.getUser()?.user?.id_user);
  console.log("5. Refresh Token:", AgroPulseStorage.getRefreshToken());
  console.log("======================================");
}, []);

  // ✅ Schéma de validation Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Le nom de la ferme est requis")
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .trim(),
    location: Yup.string()
      .required("La localisation est requise")
      .min(3, "La localisation doit contenir au moins 3 caractères")
      .trim(),
    area: Yup.number()
      .optional()
      .positive("La superficie doit être positive")
      .typeError("La superficie doit être un nombre"),
    areaUnit: Yup.string().oneOf(
      AREA_UNITS.map(u => u.value),
      "Unité invalide"
    ),
    photo: Yup.string()
      .optional()
      .url("L'URL de la photo doit être valide")
      .matches(/^https?:\/\/.+/, "L'URL doit commencer par http:// ou https://"),
  });

  const initialValues: FormValues = {
    name: "",
    location: "",
    area: 0,
    areaUnit: "hectare",
    photo: "",
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    // ✅ Vérifier que l'organisation existe
    if (!finalOrgId) {
      toast.error("Aucune organisation trouvée. Veuillez d'abord créer une organisation.");
      setSubmitting(false);
      return;
    }


    if (!managerId) {
      toast.error("Utilisateur non authentifié. Veuillez vous reconnecter.");
      setSubmitting(false);
      return;
    }
    

    try {
      // ✅ Construire les données de la ferme
      const farmData: FarmFormData = {
        organizationId: finalOrgId,
        managerId: managerId, // ✅ Ajouter l'ID du manager
        name: values.name.trim(),
        location: values.location.trim(),
        area: values.area,
        areaUnit:values.areaUnit
      };


      if (values.photo && values.photo.trim() !== "") {
        farmData.photo = values.photo.trim();
      }

      console.log("✅ Données envoyées:", farmData);

      await dispatch(createFarm(farmData)).unwrap();

      toast.success("Ferme créée avec succès !");
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Erreur lors de la création:", error);

      let errorMessage = "Une erreur est survenue lors de la création de la ferme";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <Home className="text-yellow-600" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Ajouter votre ferme
          </h2>
          <p className="text-sm text-gray-500">
            {organization?.name
              ? `Organisation: ${organization.name}`
              : "Deuxième étape pour compléter votre profil"}
          </p>
        </div>
      </div>

      {/* ✅ Avertissement si pas d'organisation */}
      {!finalOrgId && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            ⚠️ Aucune organisation trouvée. Veuillez d'abord créer une organisation.
          </p>
        </div>
      )}

      {/* ✅ Avertissement si utilisateur non authentifié */}
      {!managerId && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            ⚠️ Utilisateur non authentifié. Veuillez vous reconnecter.
          </p>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="space-y-5">
            {/* Nom de la ferme */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom de la ferme <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                type="text"
                placeholder="Ex: Ferme des Collines Vertes"
                disabled={!finalOrgId || !managerId || isSubmitting}
              />
            </div>

            {/* Localisation */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="inline mr-1" size={16} />
                Localisation <span className="text-red-500">*</span>
              </label>
              <Input
                name="location"
                type="text"
                placeholder="Ex: Douala, Région du Littoral"
                disabled={!finalOrgId || !managerId || isSubmitting}
              />
            </div>

            {/* Superficie et unité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Ruler className="inline mr-1" size={16} />
                  Superficie
                </label>
                <Input
                  name="area"
                  type="number"
                  placeholder="Ex: 25"
                  disabled={!finalOrgId || !managerId || isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="areaUnit" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Unité
                </label>
                <select
                  id="areaUnit"
                  name="areaUnit"
                  value={values.areaUnit}
                  onChange={(e) => setFieldValue("areaUnit", e.target.value)}
                  disabled={!finalOrgId || !managerId || isSubmitting}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition ${
                    !finalOrgId || !managerId || isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                >
                  {AREA_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photo URL */}
            {/* <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1.5">
                <Image className="inline mr-1" size={16} />
                URL de la photo
              </label>
              <Input
                name="photo"
                type="url"
                placeholder="https://exemple.com/photo-ferme.jpg"
                disabled={!finalOrgId || !managerId || isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optionnel : Ajoutez une URL d'image de votre ferme
              </p>
            </div> */}

            {/* Bouton de soumission */}
            <div className="flex gap-3 pt-4">
              <motion.div
                className="flex-1"
                whileHover={{ scale: (isSubmitting || !finalOrgId || !managerId) ? 1 : 1.02 }}
                whileTap={{ scale: (isSubmitting || !finalOrgId || !managerId) ? 1 : 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isSubmitting || !finalOrgId || !managerId}
                  className={`w-full py-3 rounded-lg font-medium text-white transition ${
                    isSubmitting || !finalOrgId || !managerId
                      ? "bg-yellow-400 cursor-not-allowed"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
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
                      Création en cours...
                    </span>
                  ) : (
                    "Ajouter la ferme"
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