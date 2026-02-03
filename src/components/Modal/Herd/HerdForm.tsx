/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Farm/Herd/HerdForm.tsx
import React, { useState, useEffect } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { createHerd, updateHerd } from '../../../store/herd/action';
import { getSpeciesList } from '../../../store/espece&Race/species';
import { toast } from 'react-toastify';
import { Camera,  } from 'lucide-react';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import SelectInput from '../../UI/SelectInput';
import { Herd } from '../../../models/herd';

interface HerdFormProps {
  farmId: number;
  herd?: Herd | null;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Le nom du troupeau est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  speciesId: Yup.number()
    .required('L\'espèce est obligatoire')
    .positive('Veuillez sélectionner une espèce valide'),
});

const HerdForm: React.FC<HerdFormProps> = ({ farmId, herd, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { data: species, loading: loadingSpecies } = useAppSelector(
    (state) => state.species
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(herd?.photo || null);

  useEffect(() => {
    // Charger les espèces
    dispatch(getSpeciesList());
  }, [dispatch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Options pour le select des espèces
  const speciesOptions = species.map((sp:any) => ({
    value: sp.id.toString(),
    label: sp.name,
  }));

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        farmId: farmId,
        name: herd?.name || '',
        speciesId: herd?.speciesId?.toString() || '',
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const formData = new FormData();
        
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, String(value));
          }
        });

        if (imageFile) {
          formData.append('photo', imageFile);
        }

        try {
          if (herd?.id) {
            await dispatch(updateHerd({ id: herd.id, data: formData })).unwrap();
            toast.success('Troupeau modifié avec succès !');
          } else {
            await dispatch(createHerd(formData)).unwrap();
            toast.success('Troupeau créé avec succès !');
          }
          onSuccess();
        } catch (error: any) {
          const errorMsg = error?.errors 
            ? Object.values(error.errors).join(' | ') 
            : error?.message || 'Erreur lors de l\'opération';
          toast.error(errorMsg);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, isSubmitting, errors, touched }) => (
        <Form className="space-y-4 overflow-y-auto max-h-[70vh] px-2">
          {/* Photo */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Camera className="text-gray-300 mx-auto mb-1" size={32} />
                  <span className="text-xs text-gray-400">Photo du troupeau</span>
                </div>
              )}
              <input 
                type="file" 
                id="herd-photo-upload"
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 cursor-pointer opacity-0" 
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Cliquez pour ajouter une photo</p>
          </div>

          {/* Nom du troupeau */}
          <div>
            <Input 
              label="Nom du troupeau *" 
              name="name" 
              placeholder="Ex: Troupeau Nord, Groupe A..." 
            />
            <ErrorMessage name="name" component="div" className="text-xs text-red-500 mt-1" />
          </div>

          {/* Sélection de l'espèce */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Espèce *</label>
            <SelectInput
              value={values.speciesId}
              onChange={(val) => setFieldValue('speciesId', val)}
              options={speciesOptions}
              loading={loadingSpecies === 'pending'}
              placeholder="Sélectionner une espèce"
            />
            {touched.speciesId && errors.speciesId && (
              <span className="text-xs text-red-500">{errors.speciesId as string}</span>
            )}
          </div>

          {/* Bouton de soumission */}
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-vert text-white py-3 rounded-xl mt-6 hover:bg-green-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : herd ? 'Modifier le troupeau' : 'Créer le troupeau'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default HerdForm;