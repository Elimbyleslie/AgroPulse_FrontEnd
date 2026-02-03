/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { createPen, updatePen } from '../../../store/pen/action';
import { getAllBarns } from '../../../store/barn/action';
import { toast } from 'react-toastify';
import { Grid3x3 } from 'lucide-react';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import SelectInput from '../../UI/SelectInput';
import { Pen } from '../../../models/pen';

interface PenFormProps {
  farmId: number;
  pen?: Pen | null;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  barnId: Yup.number()
    .required('Le bâtiment est obligatoire')
    .positive('Veuillez sélectionner un bâtiment valide'),
  name: Yup.string()
    .required('Le nom de l\'enclos est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  capacity: Yup.number()
    .nullable()
    .positive('La capacité doit être positive')
    .integer('La capacité doit être un nombre entier'),
});

const PenForm: React.FC<PenFormProps> = ({ farmId, pen, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { entities: barns, isLoading: loadingBarns } = useAppSelector((state) => state.barn);

  useEffect(() => {
    // Charger les bâtiments de la ferme
    dispatch(getAllBarns({ farmId, limit: 100 }));
  }, [dispatch, farmId]);

  // Options pour le select des bâtiments
  const barnOptions = barns.map((barn) => ({
    value: barn.id.toString(),
    label: barn.name,
  }));

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        barnId: pen?.barnId,
        name: pen?.name || '',
        capacity: pen?.capacity || null,
      }}
      validationSchema={validationSchema}
    onSubmit={async (values, { setSubmitting }) => {
  // 1. Préparer les données en format JSON propre
  const payload = {
    ...values,
    barnId: Number(values.barnId),
    capacity: values.capacity ? Number(values.capacity) : 0, // Eviter le null si le backend veut un nombre
  };

  try {
    if (pen) {
      // On passe payload directement (JSON)
      await dispatch(updatePen({ id: pen.id, data: payload })).unwrap();
      toast.success('Enclos modifié avec succès !');
    } else {
      await dispatch(createPen(payload)).unwrap();
      toast.success('Enclos créé avec succès !');
    }
    onSuccess();
  } catch (error: any) {
    // Extraction plus précise des erreurs pour debugger
    console.error("Backend Error:", error);
    const errorMsg = error?.errors 
      ? Object.entries(error.errors).map(([field, msg]) => `${field}: ${msg}`).join(' | ') 
      : error?.message || 'Erreur lors de l\'opération';
    toast.error(errorMsg);
  } finally {
    setSubmitting(false);
  }
}}
    >
      {({ values, setFieldValue, isSubmitting, errors, touched }) => (
        <Form className="space-y-4 overflow-y-auto max-h-[70vh] px-2">
          {/* Icône décorative */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Grid3x3 size={32} className="text-vert" />
            </div>
          </div>

          {/* Sélection du bâtiment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Bâtiment *</label>
            <SelectInput
              value={values.barnId ?? null}
              onChange={(val) => setFieldValue('barnId', val)}
              options={barnOptions}
              loading={loadingBarns}
              placeholder="Sélectionner un bâtiment"
            />
            {touched.barnId && errors.barnId && (
              <span className="text-xs text-red-500">{errors.barnId as string}</span>
            )}
          </div>

          {/* Nom de l'enclos */}
          <div>
            <Input 
              label="Nom de l'enclos *" 
              name="name" 
              placeholder="Ex: Enclos A, Zone 1..." 
            />
            <ErrorMessage name="name" component="div" className="text-xs text-red-500 mt-1" />
          </div>

          {/* Capacité */}
          <div>
            <Input 
              label="Capacité (nombre d'animaux)" 
              name="capacity" 
              type="number" 
              placeholder="Ex: 20" 
            />
            <ErrorMessage name="capacity" component="div" className="text-xs text-red-500 mt-1" />
            <p className="text-xs text-gray-400 mt-1">Laissez vide si non applicable</p>
          </div>

          {/* Bouton de soumission */}
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-vert text-white py-3 rounded-xl mt-6 hover:bg-green-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : pen ? 'Modifier l\'enclos' : 'Créer l\'enclos'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default PenForm;