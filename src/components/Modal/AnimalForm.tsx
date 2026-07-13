/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

// UI Components
import Input from "../UI/Input";
import Button from "../UI/Button";
import SelectInput from "../UI/SelectInput";
import { Camera, Upload, X } from "lucide-react";

// Hooks & Store
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { createAnimal, updateAnimal } from "../../store/animal/action";
import { selectFarmList } from "../../store/farm/slice";
import { useSpecies } from "../../hooks/useSpecies";
import { useBreeds } from "../../hooks/useBreed";

// Models
import { Species } from "../../models/species";
import { Breed } from "../../models/breed";

interface AnimalFormProps {
  farmId?: number;
  onSuccess: () => void;
  initialData?: any;
}

interface FormValues {
  name: string;
  speciesId: number;
  breedId: number;
  gender: string;
  birthDate: string;
  weight: number;
  status: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .required("Le nom est requis"),
  speciesId: Yup.number()
    .required("L'espèce est requise")
    .typeError("Veuillez sélectionner une espèce"),
  breedId: Yup.number().optional().nullable().typeError("Race invalide"),
  gender: Yup.string()
    .oneOf(["male", "female", "unknown"], "Genre invalide")
    .required("Le genre est requis"),
  birthDate: Yup.date()
    .required("La date de naissance est requise")
    .max(new Date(), "La date ne peut pas être dans le futur"),
  weight: Yup.number()
    .min(0, "Le poids doit être positif")
    .required("Le poids est requis")
    .typeError("Le poids doit être un nombre"),
  status: Yup.string().required("Le statut est requis"),
});

const AnimalForm: React.FC<AnimalFormProps> = ({
  farmId,
  onSuccess,
  initialData,
}) => {
  const dispatch = useAppDispatch();

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<
    number | undefined
  >(initialData?.speciesId ? Number(initialData.speciesId) : undefined);

  const farmList = useAppSelector(selectFarmList);
  const farms = farmList.entities;
  const finalFarmId = farmId || farms?.[0]?.id;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.photoUrl || null,
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Remplacez votre initialFormValues par ceci
  const initialFormValues: FormValues = useMemo(() => {
    if (initialData) {
      return {
        name: initialData.name || "",
        speciesId: Number(initialData.speciesId),
        breedId: initialData.breedId ? Number(initialData.breedId) : 0,
        gender: initialData.gender || "male",
        birthDate: initialData.birthDate
          ? new Date(initialData.birthDate).toISOString().split("T")[0]
          : "",
        weight: Number(initialData.weight),
        status: initialData.status || "active",
      };
    }
    return {
      name: "",
      speciesId: 0,
      breedId: 0,
      gender: "male",
      birthDate: "",
      weight: 0,
      status: "active",
    };
  }, [initialData]);

  const { species: rawSpecies, isLoading: loadingSpecies } = useSpecies();
  const { breeds: rawBreeds, isLoading: loadingBreeds } = useBreeds({
    speciesId: selectedSpeciesId,
  });

  const speciesOptions = useMemo(() => {
    const list = Array.isArray(rawSpecies)
      ? rawSpecies
      : (rawSpecies as any)?.data || [];
    return list.map((sp: Species) => ({
      value: sp.id.toString(),
      label: sp.name,
    }));
  }, [rawSpecies]);

  const breedsOptions = useMemo(() => {
    const list = Array.isArray(rawBreeds)
      ? rawBreeds
      : (rawBreeds as any)?.data || [];
    return list.map((b: Breed) => ({ value: b.id.toString(), label: b.name }));
  }, [rawBreeds]);

  // --- Soumission avec FormData ---
  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    if (!finalFarmId) {
      toast.error("Erreur : Aucune ferme associée.");
      return;
    }

    const formData = new FormData();

    formData.append("name", values.name.trim());
    formData.append("farmId", String(finalFarmId));
    formData.append("speciesId", String(values.speciesId));

    if (values.breedId && values.breedId !== 0) {
      formData.append("breedId", String(values.breedId));
    }

    formData.append("gender", values.gender);
    formData.append("birthDate", values.birthDate);
    formData.append("weight", String(values.weight));
    formData.append("status", values.status);

    if (imageFile) {
      formData.append("photo", imageFile);
    }

    // ===== DEBUG : AFFICHE LE CONTENU DU FORMDATA =====
    console.log("=== CONTENU DU FORMDATA ===");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("===========================");

    try {
      if (initialData?.id) {
        await dispatch(
          updateAnimal({ id: initialData.id, data: formData }),
        ).unwrap();
        toast.success("Animal mis à jour avec succès !");
      } else {
        await dispatch(createAnimal(formData)).unwrap();
        toast.success("Nouvel animal enregistré !");
      }
      onSuccess();
    } catch (error: any) {
      console.error("Erreur complète:", error); // Debug l'erreur
      toast.error(
        error?.meta?.message || error?.message || "Erreur lors de l'opération",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!finalFarmId) {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
        ⚠️ Aucune ferme détectée. Créez d'abord une ferme.
      </div>
    );
  }

  return (
    <div className="max-w-full">
      {/* ... (Reste de ton JSX identique jusqu'au bouton Submit) */}
      <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
        <span className="text-lg">📍</span>
        <p className="text-sm text-green-800 font-medium">
          Ferme :{" "}
          <span className="font-bold">
            {farms?.[0]?.name || "Chargement..."}
          </span>
        </p>
      </div>

      <Formik
        initialValues={initialFormValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form className="space-y-4">
            {/* Image Upload Section */}
            <div className="mb-6 flex flex-col items-center">
              <label className="text-sm font-bold text-gray-700 mb-2 w-full">
                Photo de l'animal
              </label>
              <div className="relative w-32 h-32 group">
                <div className="w-full h-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="text-gray-400" size={32} />
                  )}
                </div>
                <label className="absolute bottom-[-10px] right-[-10px] bg-vert p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-green-700 transition">
                  <Upload size={16} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setImageFile(null);
                    }}
                    className="absolute top-[-10px] right-[-10px] bg-red-500 p-1.5 rounded-full text-white shadow-md"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <Input
              label="Reference"
              name="name"
              placeholder="FR-59-123"
              disabled={isSubmitting}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Espèce *</label>
                <SelectInput
                  value={values.speciesId}
                  onChange={(val) => {
                    setFieldValue("speciesId", val);
                    setFieldValue("breedId", "");
                    setSelectedSpeciesId(val ? Number(val) : undefined);
                  }}
                  options={speciesOptions}
                  loading={loadingSpecies}
                  placeholder="Choisir une espèce"
                />
                {touched.speciesId && errors.speciesId && (
                  <p className="text-xs text-red-500">{errors.speciesId}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">
                  Race (optionnelle)
                </label>
                <SelectInput
                  value={values.breedId}
                  onChange={(val) => setFieldValue("breedId", val)}
                  options={breedsOptions}
                  loading={loadingBreeds}
                  disabled={!values.speciesId || loadingBreeds}
                  placeholder={
                    values.speciesId
                      ? "Rechercher une race"
                      : "Sélectionnez l'espèce"
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Genre *</label>
                <select
                  name="gender"
                  value={values.gender}
                  onChange={(e) => setFieldValue("gender", e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-vert outline-none bg-white"
                >
                  <option value="male">Mâle</option>
                  <option value="female">Femelle</option>
                  <option value="unknown">Inconnu</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Statut *</label>
                <select
                  name="status"
                  value={values.status}
                  onChange={(e) => setFieldValue("status", e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-vert outline-none bg-white"
                >
                  <option value="active">Actif</option>
                  <option value="sold">Vendu</option>
                  <option value="dead">Décédé</option>
                  <option value="transferred">Transféré</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date de naissance"
                name="birthDate"
                type="date"
                required
              />
              <Input
                label={initialData ? "Poids actuel (kg)" : "Poids initial (kg)"}
                name="weight"
                type="number"
                placeholder="0.00"
                required
              />
            </div>

            <motion.div whileTap={{ scale: 0.98 }} className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${initialData ? "bg-jaune hover:bg-darkJaune" : "bg-vert hover:bg-green-700"} text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors`}
              >
                {isSubmitting
                  ? "Opération en cours..."
                  : initialData
                    ? "Enregistrer les modifications"
                    : "Enregistrer l'animal"}
              </Button>
            </motion.div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AnimalForm;
