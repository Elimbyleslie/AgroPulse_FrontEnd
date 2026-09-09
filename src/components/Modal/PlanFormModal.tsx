/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createPlan, updatePlan } from "../../store/Abonnement&Facturation/action";
import { Plan } from "../../models/abonnementFacturation";
import { X, Loader2 } from "lucide-react";
import type { AppDispatch } from "../../store";

interface PlanFormModalProps {
  plan: Plan | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormState = {
  name: string;
  code: string;
  description: string;
  priceMonthly: string;
  priceYearly: string; // vide = pas de tarif annuel (null)
  currency: string;
  maxUsers: string; // vide = illimité (null)
  maxAnimals: string; // vide = illimité (null)
  maxFarms: string; // vide = illimité (null)
  isActive: boolean;
  isPublic: boolean;
  sortOrder: string;
  features: string; // JSON brut, optionnel
};

const emptyForm: FormState = {
  name: "",
  code: "",
  description: "",
  priceMonthly: "",
  priceYearly: "",
  currency: "XAF",
  maxUsers: "",
  maxAnimals: "",
  maxFarms: "",
  isActive: true,
  isPublic: true,
  sortOrder: "0",
  features: "",
};

const toFormState = (plan: Plan): FormState => ({
  name: plan.name,
  code: plan.code,
  description: plan.description ?? "",
  priceMonthly: String(plan.priceMonthly),
  priceYearly: plan.priceYearly != null ? String(plan.priceYearly) : "",
  currency: plan.currency || "XAF",
  maxUsers: plan.maxUsers != null ? String(plan.maxUsers) : "",
  maxAnimals: plan.maxAnimals != null ? String(plan.maxAnimals) : "",
  maxFarms: plan.maxFarms != null ? String(plan.maxFarms) : "",
  isActive: plan.isActive,
  isPublic: plan.isPublic,
  sortOrder: String(plan.sortOrder ?? 0),
  features: plan.features ? JSON.stringify(plan.features, null, 2) : "",
});

// Petit toggle réutilisable pour isActive / isPublic
const ToggleField: React.FC<{
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, hint, value, onChange }) => (
  <div className="flex items-center justify-between rounded-lg border border-btn px-3 py-2.5">
    <div>
      <p className="text-sm font-medium text-darkText">{label}</p>
      <p className="text-xs text-text">{hint}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-colors ${
        value ? "bg-bleu" : "bg-btn"
      }`}
      style={{ height: 22 }}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          value ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

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
    if (!form.code.trim()) return "Le code du plan est requis.";
    if (!form.priceMonthly || Number(form.priceMonthly) < 0)
      return "Le prix mensuel doit être un nombre positif.";
    if (form.priceYearly.trim() && Number(form.priceYearly) < 0)
      return "Le prix annuel doit être un nombre positif.";
    if (form.maxUsers.trim() && Number(form.maxUsers) < 0)
      return "La limite d'utilisateurs est invalide.";
    if (form.maxAnimals.trim() && Number(form.maxAnimals) < 0)
      return "La limite d'animaux est invalide.";
    if (form.maxFarms.trim() && Number(form.maxFarms) < 0)
      return "La limite de fermes est invalide.";
    if (form.sortOrder.trim() && Number(form.sortOrder) < 0)
      return "L'ordre d'affichage est invalide.";
    if (form.features.trim()) {
      try {
        const parsed = JSON.parse(form.features);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          return "Les caractéristiques (features) doivent être un objet JSON valide.";
        }
      } catch {
        return "Les caractéristiques (features) ne sont pas un JSON valide.";
      }
    }
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
      code: form.code.trim(),
      description: form.description.trim() || undefined,
      priceMonthly: Number(form.priceMonthly),
      priceYearly: form.priceYearly.trim() ? Number(form.priceYearly) : null,
      currency: form.currency.trim() || "XAF",
      maxUsers: form.maxUsers.trim() ? Number(form.maxUsers) : null,
      maxAnimals: form.maxAnimals.trim() ? Number(form.maxAnimals) : null,
      maxFarms: form.maxFarms.trim() ? Number(form.maxFarms) : null,
      isActive: form.isActive,
      isPublic: form.isPublic,
      sortOrder: form.sortOrder.trim() ? Number(form.sortOrder) : 0,
      features: form.features.trim() ? JSON.parse(form.features) : null,
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-darkText">
                Nom du plan
              </label>
              <input
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Ex : Pro, Standard..."
                className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-darkText">
                Code (identifiant unique)
              </label>
              <input
                value={form.code}
                onChange={handleChange("code")}
                placeholder="Ex : PRO, STANDARD_2026..."
                className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
              />
            </div>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-darkText">
                Prix mensuel
              </label>
              <input
                type="number"
                min={0}
                value={form.priceMonthly}
                onChange={handleChange("priceMonthly")}
                className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-darkText">
                Prix annuel
              </label>
              <input
                type="number"
                min={0}
                value={form.priceYearly}
                onChange={handleChange("priceYearly")}
                placeholder="Optionnel"
                className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-darkText">
                Devise
              </label>
              <input
                value={form.currency}
                onChange={handleChange("currency")}
                placeholder="XAF"
                className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold text-text uppercase tracking-wide">
              Limites (laisser vide = illimité)
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-darkText">
                  Utilisateurs
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.maxUsers}
                  onChange={handleChange("maxUsers")}
                  placeholder="Illimité"
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
                  value={form.maxAnimals}
                  onChange={handleChange("maxAnimals")}
                  placeholder="Illimité"
                  className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-darkText">
                  Fermes
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.maxFarms}
                  onChange={handleChange("maxFarms")}
                  placeholder="Illimité"
                  className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-darkText">
              Ordre d'affichage
            </label>
            <input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={handleChange("sortOrder")}
              className="w-full rounded-lg border border-btn px-3 py-2 text-sm text-darkText outline-none focus:border-bleu"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ToggleField
              label="Plan actif"
              hint="Souscriptible immédiatement"
              value={form.isActive}
              onChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
            />
            <ToggleField
              label="Plan public"
              hint="Visible par les organisations"
              value={form.isPublic}
              onChange={(v) => setForm((p) => ({ ...p, isPublic: v }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-darkText">
              Caractéristiques (JSON, optionnel)
            </label>
            <textarea
              value={form.features}
              onChange={handleChange("features")}
              rows={4}
              placeholder='{"support": "prioritaire", "export": true}'
              className="w-full resize-none rounded-lg border border-btn px-3 py-2 font-mono text-xs text-darkText outline-none focus:border-bleu"
            />
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