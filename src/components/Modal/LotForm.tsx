/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { Formik, Form, ErrorMessage } from "formik"; // Ajout de ErrorMessage
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Camera } from "lucide-react";
import { selectFarmList } from '../../store/farm/slice';

// UI Components
import Input from "../UI/Input";
import Button from "../UI/Button";
import SelectInput from "../UI/SelectInput";

// Hooks & Actions
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { createLot } from "../../store/lot/action";
import { useSpecies } from "../../hooks/useSpecies";
import { useBreeds } from "../../hooks/useBreed";

interface LotFormProps {
  farmId?: number;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  farmId: Yup.number().required("L'ID de la ferme est obligatoire"),
  name: Yup.string().required("Le nom est requis"),
  barnId: Yup.number().typeError("Doit être un nombre").required("Le bâtiment est requis"),
  speciesId: Yup.number().typeError("Sélectionnez une espèce").required("L'espèce est requise"),
  breedId: Yup.number().typeError("Sélectionnez une race").required("La race est requise"),
  ageGroup: Yup.string().required("Le groupe d'âge est requis"),
  quantity: Yup.number().typeError("Doit être un nombre").min(1, "Minimum 1").required("La quantité est requise"),
  entryDate: Yup.date().required("La date d'entrée est requise"),
  status: Yup.string().required("Le statut est requis"),
});

const LotForm: React.FC<LotFormProps> = ({ farmId, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | undefined>();

  const { species: rawSpecies, isLoading: loadingSpecies } = useSpecies();
  const { breeds: rawBreeds, isLoading: loadingBreeds } = useBreeds({
    speciesId: selectedSpeciesId,
  });

  const farmList = useAppSelector(selectFarmList);
  const farms = farmList.entities ?? [];

  const finalFarmId = useMemo(() => {
    return farmId || (farms.length > 0 ? farms[0].id : undefined);
  }, [farmId, farms]);

  const speciesOptions = useMemo(() => {
    const list = Array.isArray(rawSpecies) ? rawSpecies : (rawSpecies as any)?.data || [];
    return list.map((sp: any) => ({ value: sp.id.toString(), label: sp.name }));
  }, [rawSpecies]);

  const breedsOptions = useMemo(() => {
    const list = Array.isArray(rawBreeds) ? rawBreeds : (rawBreeds as any)?.data || [];
    return list.map((b: any) => ({ value: b.id.toString(), label: b.name }));
  }, [rawBreeds]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        farmId: finalFarmId || "",
        barnId: "",
        name: "",
        speciesId: "",
        breedId: "",
        ageGroup: "young", // Défini par défaut pour éviter de bloquer la validation
        quantity: 1,
        entryDate: new Date().toISOString().split("T")[0],
        status: "active",
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        console.log("Submit triggered with values:", values); // Debug
        const formData = new FormData();
        
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        if (imageFile) formData.append("photo", imageFile);

        try {
          await dispatch(createLot(formData)).unwrap();
          toast.success("Lot créé avec succès !");
          onSuccess();
        } catch (error: any) {
          const errorMsg = error?.errors 
            ? Object.values(error.errors).join(" | ") 
            : error?.message || "Erreur lors de la création";
          toast.error(errorMsg);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, isSubmitting, errors, touched, handleSubmit }) => (
        <Form className="space-y-4 overflow-y-auto max-h-[70vh] px-2" onSubmit={handleSubmit}>
          {/* Photo */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="text-gray-300" />
              )}
              <input 
                type="file" 
                id="photo-upload"
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 cursor-pointer opacity-0" 
              />
            </div>
          </div>

          <Input label="Nom du Lot *" name="name" placeholder="Ex: Lot A1 - Sevrage" />
          <ErrorMessage name="name" component="div" className="text-xs text-red-500" />

          <div className="grid grid-cols-2 gap-4">
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
                placeholder="Choisir"
              />
              {touched.speciesId && errors.speciesId && <span className="text-xs text-red-500">{errors.speciesId as string}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Race *</label>
              <SelectInput
                value={values.breedId}
                onChange={(val) => setFieldValue("breedId", val)}
                options={breedsOptions}
                loading={loadingBreeds}
                disabled={!values.speciesId}
                placeholder="Choisir"
              />
              {touched.breedId && errors.breedId && <span className="text-xs text-red-500">{errors.breedId as string}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <Input label="ID Bâtiment (Barn) *" name="barnId" type="number" />
                <ErrorMessage name="barnId" component="div" className="text-xs text-red-500" />
            </div>
            <div>
                <Input label="Quantité *" name="quantity" type="number" />
                <ErrorMessage name="quantity" component="div" className="text-xs text-red-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Groupe d'âge *</label>
              <select
                name="ageGroup"
                value={values.ageGroup}
                onChange={(e) => setFieldValue("ageGroup", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-vert bg-white"
              >
                <option value="young">Jeune</option>
                <option value="adult">Adulte</option>
                <option value="breeding">Reproduction</option>
                <option value="fattening">Engraissement</option>
                <option value="mixed">Mixte</option>
              </select>
              <ErrorMessage name="ageGroup" component="div" className="text-xs text-red-500" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Statut *</label>
              <select
                name="status"
                value={values.status}
                onChange={(e) => setFieldValue("status", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-vert bg-white"
              >
                <option value="active">Actif</option>
                <option value="closed">Fermé</option>
               
              </select>
            </div>
          </div>

          <Input label="Date d'entrée *" name="entryDate" type="date" />
          <ErrorMessage name="entryDate" component="div" className="text-xs text-red-500" />

          {/* Bouton de test : si vous cliquez et que rien ne se passe, regardez la console */}
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            onClick={() => console.log("Button clicked. Errors:", errors)}
            className="w-full bg-vert text-white py-3 rounded-xl mt-4"
          >
            {isSubmitting ? "Création en cours..." : "Enregistrer le Lot"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default LotForm;