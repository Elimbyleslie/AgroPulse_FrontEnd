/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import {
  Stethoscope,
  Calendar,
  Activity,
  Syringe,
  Clipboard,
  Layers,
  Tag,
  X,
} from "lucide-react";
import {
  createConsultation,
  updateConsultation,
} from "../../store/health/action";
import { clearError, clearSuccess } from "../../store/health/slice";
import { toast } from "react-toastify";
import Button from "../UI/Button";
import SelectInput from "../UI/SelectInput";
import { Consultation, FetchConsultation } from "../../models/health";
import { Animal } from "../../models/animal";
import { getAllAnimals } from "../../store/animal/action";
import { getAllLots } from "../../store/lot/action";

interface ConsultationFormProps {
  initialAnimalId?: number;
  initialData?: FetchConsultation;
  farmId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({
  initialAnimalId,
  initialData,
  farmId: farmIdProp,
  onSuccess,
  onCancel,
}) => {
  const dispatch = useAppDispatch();

  const { loading, error, success } = useAppSelector((state) => state.health);
  const currentUser = useAppSelector(
    (state) => state.authentification.auth.user,
  );

  // ─── FarmId : prop → currentFarm → premier de farmList ────────────────────
  const currentFarm = useAppSelector((state) => state.farms.currentFarm);
  const farmList = useAppSelector((state) => state.farms.farmList.entities);

  const farmIdFromStore =
    currentFarm?.id ??
    (Array.isArray(farmList) && farmList.length > 0
      ? farmList[0].id
      : undefined);

  const farmId = farmIdProp ?? farmIdFromStore;

  // ─── Animaux & Lots ─────────────────────────────────────────────────────────
  const animalsEntities = useAppSelector(
    (state) => state.animal.animalist.entities,
  );
  const animals: Animal[] = Array.isArray(animalsEntities)
    ? animalsEntities
    : [];

  const lotsEntities = useAppSelector((state) => state.lot.entities);
  const lots: any[] = Array.isArray(lotsEntities) ? lotsEntities : [];

  const [targetType, setTargetType] = useState<"animal" | "lot">("animal");

  const [formData, setFormData] = useState({
    animalId: initialData?.animalId ?? initialAnimalId ?? 0,
    lotId: 0,
    checkDate: initialData?.checkDate
      ? new Date(initialData.checkDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    symptoms: initialData?.symptoms ?? "",
    diagnosis: initialData?.diagnosis ?? "",
    treatment: initialData?.treatment ?? "",
  });

  // ─── Fetch animaux + lots dès que farmId est disponible ────────────────────
  useEffect(() => {
    if (!farmId) {
      console.warn("[ConsultationForm] farmId undefined — fetch annulé");
      return;
    }
    console.log("[ConsultationForm] Fetch avec farmId:", farmId);
    dispatch(getAllAnimals({ farmId, limit: 100 }));
    dispatch(getAllLots({ farmId, limit: 100, search: "" }));
  }, [dispatch, farmId]);

  // ─── Gestion erreur / succès ────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(
        initialData?.id
          ? "Consultation mise à jour avec succès"
          : "Consultation enregistrée avec succès",
      );
      dispatch(clearSuccess());
      resetForm();
      onSuccess?.();
    }
  }, [success, dispatch, onSuccess]);

  const resetForm = () => {
    setFormData({
      animalId: initialAnimalId ?? 0,
      lotId: 0,
      checkDate: new Date().toISOString().split("T")[0],
      symptoms: "",
      diagnosis: "",
      treatment: "",
    });
    if (!initialAnimalId) setTargetType("animal");
  };

  const handleTargetTypeChange = (type: "animal" | "lot") => {
    setTargetType(type);
    setFormData((prev) => ({ ...prev, animalId: 0, lotId: 0 }));
  };

  const validateForm = (): boolean => {
    if (!farmId) {
      toast.error("Ferme non sélectionnée — veuillez réessayer");
      console.error("[ConsultationForm] farmId manquant:", {
        farmIdProp,
        farmIdFromStore,
      });
      return false;
    }
    if (targetType === "animal" && !formData.animalId) {
      toast.error("Veuillez sélectionner un animal");
      return false;
    }
    if (targetType === "lot" && !formData.lotId) {
      toast.error("Veuillez sélectionner un lot");
      return false;
    }
    if (!formData.checkDate) {
      toast.error("Veuillez sélectionner une date");
      return false;
    }
    if (!formData.symptoms.trim()) {
      toast.error("Veuillez décrire les symptômes");
      return false;
    }
    if (!currentUser?.id) {
      toast.error("Utilisateur non authentifié");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload: Consultation = {
        farmId: farmId!,
        animalId: Number(formData.animalId),
        checkDate: new Date(formData.checkDate).toISOString(),
        veterinarianId: currentUser!.id,
        symptoms: formData.symptoms.trim(),
        ...(targetType === "lot" &&
          formData.lotId && { lotId: formData.lotId }), // ← Ajoute seulement si lotId existe
        ...(formData.diagnosis.trim() && {
          diagnosis: formData.diagnosis.trim(),
        }),
        ...(formData.treatment.trim() && {
          treatment: formData.treatment.trim(),
        }),
      };

      console.log("[ConsultationForm] Payload:", payload);

      if (initialData?.id) {
        await dispatch(
          updateConsultation({ id: initialData.id, data: payload }),
        ).unwrap();
      } else {
        await dispatch(createConsultation(payload)).unwrap();
      }
    } catch (err: any) {
      console.error("[ConsultationForm] Erreur submit:", err);
    }
  };

  // ─── Options select ──────────────────────────────────────────────────────────
  const animalOptions = useMemo(() => {
    if (animals.length === 0)
      return [{ value: "", label: "Aucun animal disponible" }];
    return [
      { value: "", label: "Choisir un animal" },
      ...animals.map((a: Animal) => ({
        value: a.id.toString(),
        label: `${a.name}${
          a.species
            ? ` (${
                typeof a.species === "object"
                  ? (a.species as any).name
                  : a.species
              })`
            : ""
        }`,
      })),
    ];
  }, [animals]);

  const lotOptions = useMemo(() => {
    if (lots.length === 0)
      return [{ value: "", label: "Aucun lot disponible" }];
    return [
      { value: "", label: "Choisir un lot" },
      ...lots.map((l: any) => ({
        value: l.id.toString(),
        label: `${l.name}${l.quantity ? ` (${l.quantity} animaux)` : ""}`,
      })),
    ];
  }, [lots]);

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-3 rounded-[32px] shadow-sm border border-gray-100 max-w-2xl max-h-[90vh] "
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-vert/10 p-3 rounded-2xl text-vert">
            <Stethoscope size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-darkText">
              {initialData?.id
                ? "Modifier la Consultation"
                : "Nouvelle Consultation"}
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Saisie des observations vétérinaires
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        )}
      </div>

      <div className="space-y-6 overflow-y-auto max-h-[60vh] p-4">
        {/* Toggle Animal / Lot */}
        {!initialAnimalId && (
          <div className="flex p-1 bg-gray-50 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => handleTargetTypeChange("animal")}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${
                targetType === "animal"
                  ? "bg-white shadow-sm text-vert"
                  : "text-gray-400 hover:text-gray-600"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Tag size={16} /> Animal Individuel
            </button>
            <button
              type="button"
              onClick={() => handleTargetTypeChange("lot")}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${
                targetType === "lot"
                  ? "bg-white shadow-sm text-jaune"
                  : "text-gray-400 hover:text-gray-600"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Layers size={16} /> Lot d'animaux
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sélection animal / lot */}
          <div className="md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
              {targetType === "animal" ? "Animal Concerné" : "Lot Concerné"} *
            </label>

            {/* Spinner pendant chargement */}
            {!farmId ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl text-sm text-gray-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Chargement de la ferme…
              </div>
            ) : targetType === "animal" ? (
              <SelectInput
                value={formData.animalId.toString()}
                onChange={(val) =>
                  setFormData({ ...formData, animalId: Number(val) })
                }
                options={animalOptions}
                placeholder="Choisir l'animal"
                disabled={!!initialAnimalId || loading}
              />
            ) : (
              <SelectInput
                value={formData.lotId.toString()}
                onChange={(val) =>
                  setFormData({ ...formData, lotId: Number(val) })
                }
                options={lotOptions}
                placeholder="Choisir le lot"
                disabled={loading}
              />
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
              Date de l'examen *
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="date"
                value={formData.checkDate}
                onChange={(e) =>
                  setFormData({ ...formData, checkDate: e.target.value })
                }
                max={new Date().toISOString().split("T")[0]}
                required
                disabled={loading}
                className="w-full text-text pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-300  outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Symptômes */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
            Symptômes observés *
          </label>
          <div className="relative">
            <Activity
              className="absolute left-4 top-3 text-gray-400"
              size={18}
            />
            <textarea
              placeholder="Ex: Température élevée, perte d'appétit, boiterie..."
              rows={3}
              value={formData.symptoms}
              onChange={(e) =>
                setFormData({ ...formData, symptoms: e.target.value })
              }
              required
              disabled={loading}
              className="w-full pl-12 pr-4 pt-2 bg-gray-50  focus:ring-2 focus:ring-gray-300  rounded-2xl text-sm font-medium  outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Diagnostic */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
            Diagnostic (Analyse)
          </label>
          <div className="relative">
            <Clipboard
              className="absolute left-4 top-3 text-gray-400"
              size={18}
            />
            <textarea
              placeholder="Ex: Suspicion de fièvre aphteuse, carence alimentaire..."
              rows={3}
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              disabled={loading}
              className="w-full pl-12 pr-4 py-2 bg-gray-50 outline-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-gray-300  transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Traitement */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
            Traitement prescrit
          </label>
          <div className="relative">
            <Syringe
              className="absolute left-4 top-5 text-gray-400"
              size={18}
            />
            <textarea
              placeholder="Ex: Injection d'antibiotiques, mise en quarantaine..."
              rows={3}
              value={formData.treatment}
              onChange={(e) =>
                setFormData({ ...formData, treatment: e.target.value })
              }
              disabled={loading}
              className="w-full pl-12 pr-4 py-2 bg-gray-50 outline-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-gray-300 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 italic ml-2">
          * Champs obligatoires
        </p>

        {/* Boutons */}
        <div className="pt-4 flex gap-4">
          <Button
            type="button"
            onClick={onCancel ?? resetForm}
            disabled={loading}
            className="flex-1 bg-gray-100 text-gray-600 font-black py-2 rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading || !farmId}
            className="flex-1 bg-vert text-white font-black py-2 rounded-2xl shadow-lg shadow-green-200 hover:bg-vert/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Enregistrement...
              </span>
            ) : (
              "Enregistrer la visite"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ConsultationForm;
