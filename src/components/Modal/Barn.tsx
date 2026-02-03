
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '../../hooks/store';
import { createBarn, updateBarn } from '../../store/barn/action';
import { toast } from 'react-toastify';
import { Camera } from 'lucide-react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { Barn } from '../../models/barn';

interface BarnFormProps {
  farmId: number;
  barn?: Barn | null;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Le nom du bâtiment est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  capacity: Yup.number()
    .nullable()
    .positive('La capacité doit être positive')
    .integer('La capacité doit être un nombre entier'),
});

const BarnForm: React.FC<BarnFormProps> = ({ farmId, barn, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(barn?.photo || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        farmId: farmId,
        name: barn?.name || '',
        capacity: barn?.capacity || null,
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const formData = new FormData();
        
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        if (imageFile) {
          formData.append('photo', imageFile);
        }

        try {
          if (barn) {
            await dispatch(updateBarn({ id: barn.id, data: formData })).unwrap();
            toast.success('Bâtiment modifié avec succès !');
          } else {
            await dispatch(createBarn(formData)).unwrap();
            toast.success('Bâtiment créé avec succès !');
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
      {({ isSubmitting, handleSubmit }) => (
        <Form className="space-y-4 overflow-y-auto max-h-[70vh] px-2" onSubmit={handleSubmit}>
          {/* Photo */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Camera className="text-gray-300 mx-auto mb-1" size={32} />
                  <span className="text-xs text-gray-400">Photo</span>
                </div>
              )}
              <input 
                type="file" 
                id="barn-photo-upload"
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 cursor-pointer opacity-0" 
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Cliquez pour ajouter une photo</p>
          </div>

          {/* Nom du bâtiment */}
          <div>
            <Input 
              label="Nom du bâtiment *" 
              name="name" 
              placeholder="Ex: Bâtiment A, Étable principale..." 
            />
            <ErrorMessage name="name" component="div" className="text-xs text-red-500 mt-1" />
          </div>

          {/* Capacité */}
          <div>
            <Input 
              label="Capacité (nombre d'animaux)" 
              name="capacity" 
              type="number" 
              placeholder="Ex: 50" 
            />
            <ErrorMessage name="capacity" component="div" className="text-xs text-red-500 mt-1" />
            <p className="text-xs text-gray-400 mt-1">Laissez vide si non applicable</p>
          </div>

          {/* Bouton de soumission */}
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-vert text-white py-3 flex justify-center rounded-xl mt-6 hover:bg-green-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : barn ? 'Modifier le bâtiment' : 'Créer le bâtiment'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default BarnForm;