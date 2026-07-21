/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createPlan, updatePlan } from "../../store/Abonnement&Facturation/action";
import { Plan, BillingCycle } from "../../models/abonnementFacturation"; 
import { X, Loader2 } from "lucide-react";
import type { AppDispatch } from "../../store";


interface PlanFormModalProps {
  plan: Plan | null; 
  onClose: () => void;
  onSuccess: () => void;
}

type FormState = {
  name: string;
  price: string;
  durationDays: string;
  description: string;
  billingCycle: BillingCycle;
  userLimit: string;
  storageLimit: string;
  animalLimit: string;
};

const emptyForm: FormState = {
  name: "",
  price: "",
  durationDays: "",
  description: "",
  billingCycle: BillingCycle.MONTHLY,
  userLimit: "",
  storageLimit: "",
  animalLimit: "",
};

const toFormState = (plan: Plan): FormState => ({
  name: plan.name,
  price: String(plan.price),
  durationDays: String(plan.durationDays),
  description: plan.description ?? "",
  billingCycle: plan.billingCycle,
  userLimit: String(plan.userLimit),
  storageLimit: String(plan.storageLimit),
  animalLimit: String(plan.animalLimit),
});

const PlanFormModal: React.FC<PlanFormModalProps> = ({
  plan,
  onClose,
  onSuccess,
}) => {
    const dispatch = useDispatch<AppDispatch>();
  const isEdit = Boolean(plan);

  const [form, setForm] = useState<FormState>(
    plan ? toFormState(plan) : emptyForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Le nom du plan est requis.";
    if (!form.price || Number(form.price) < 0)
      return "Le prix doit être un nombre positif.";
    if (!form.durationDays || Number(form.durationDays) <= 0)
      return "La durée (en jours) doit être supérieure à 0.";
    if (!form.userLimit || Number(form.userLimit) < 0)
      return "La limite d'utilisateurs est invalide.";
    if (!form.storageLimit || Number(form.storageLimit) < 0)
      return "La limite de stockage est invalide.";
    if (!form.animalLimit || Number(form.animalLimit) < 0)
      return "La limite d'animaux est invalide.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    setSubmitting(true);

    const payload: Partial<Plan> = {
      name: form.name.trim(),
      price: Number(form.price),
      durationDays: Number(form.durationDays),
      description: form.description.trim(),
      billingCycle: form.billingCycle,
      userLimit: Number(form.userLimit),
      storageLimit: Number(form.storageLimit),
      animalLimit: Number(form.animalLimit),
    };

    try {
      if (isEdit && plan) {
        await dispatch(updatePlan({ id: plan.id, data: payload })).unwrap();
      } else {
        await dispatch(createPlan(payload)).unwrap();
      }
      onSuccess();
    } catch (err: any) {
      setFormError(
        err?.meta?.message ??
          "Une erreur est survenue lors de l'enregistrement du plan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-modalBg/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-btn px-5 py-4">
          <h2 className="text-base font-semibold text-darkText">
            {isEdit ? "Modifier le plan" : "Nouveau plan"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text transition hover:bg-bg_dash"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {formError && (
            <div className="rounded-lg border border-rouge/30 bg-rouge/10 px-3 py-2 text-sm text-rouge">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-darkText">
              Nom du plan
            </label>
            <input
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Ex : Pro, Standard, Entreprise..."
              className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-darkText">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={2}
              placeholder="Résumé des avantages du plan"
              className="w-full resize-none rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-darkText">
                Prix (FCFA)
              </label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={handleChange("price")}
                className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-darkText">
                Cycle de facturation
              </label>
              <select
                value={form.billingCycle}
                onChange={handleChange("billingCycle")}
                className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
              >
                <option value={BillingCycle.MONTHLY}>Mensuel</option>
                <option value={BillingCycle.YEARLY}>Annuel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-darkText">
              Durée (jours)
            </label>
            <input
              type="number"
              min={1}
              value={form.durationDays}
              onChange={handleChange("durationDays")}
              className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-darkText">
                Utilisateurs
              </label>
              <input
                type="number"
                min={0}
                value={form.userLimit}
                onChange={handleChange("userLimit")}
                className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-darkText">
                Stockage (Mo)
              </label>
              <input
                type="number"
                min={0}
                value={form.storageLimit}
                onChange={handleChange("storageLimit")}
                className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-darkText">
                Animaux
              </label>
              <input
                type="number"
                min={0}
                value={form.animalLimit}
                onChange={handleChange("animalLimit")}
                className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-btn px-4 py-2 text-sm font-medium text-text transition hover:bg-bg_dash"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-bleu px-4 py-2 text-sm font-medium text-white transition hover:bg-darkBleu disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer le plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanFormModal;