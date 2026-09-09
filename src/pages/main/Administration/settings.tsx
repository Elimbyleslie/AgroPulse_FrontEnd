/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import extractApiError from "../../../lib/errorextrator";
import {
  Settings as SettingsIcon,
  RefreshCw,
  ChevronRight,
  Globe,
  Ruler,
  PawPrint,
  Bell,
  Wallet,
  Palette,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getSettingsByFarmId,
  createSettings,
  updateSettings,
} from "../../../store/administration/actionSetting";
import {
  selectCurrentSettings,
  selectSettingsState,
  patchCurrentSettings,
} from "../../../store/administration/sliceSetting";
import { Settings, PaymentMethod } from "../../../models/administration";
import SelectInput from "../../../components/UI/SelectInput";
// L'id de la ferme active provient du user connecté (user.farmId).
// Adapte le nom du selector/slice si le tien s'appelle différemment
// (ex: selectAuthUser, selectLoggedUser, selectMe…).
import { selectCurrentUser } from "../../../store/auth/slice";

// ── Helpers ───────────────────────────────────────────────────────────────────

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const CURRENCIES = [
  { label: "Franc CFA (XOF)", value: "XOF" },
  { label: "Franc CFA (XAF)", value: "XAF" },
  { label: "Dollar US (USD)", value: "USD" },
  { label: "Euro (EUR)", value: "EUR" },
];

const LANGUAGES = [
  { label: "Français", value: "fr" },
  { label: "English", value: "en" },
];

const DATE_FORMATS = [
  { label: "JJ/MM/AAAA", value: "DD/MM/YYYY" },
  { label: "MM/JJ/AAAA", value: "MM/DD/YYYY" },
  { label: "AAAA-MM-JJ", value: "YYYY-MM-DD" },
];

const TIMEZONES = [
  { label: "Douala / Dakar (GMT+1)", value: "Africa/Douala" },
  { label: "Dakar (GMT+0)", value: "Africa/Dakar" },
  { label: "Nairobi (GMT+3)", value: "Africa/Nairobi" },
];

const WEIGHT_UNITS = [
  { label: "Kilogramme (kg)", value: "kg" },
  { label: "Gramme (g)", value: "g" },
  { label: "Livre (lb)", value: "lb" },
];

const VOLUME_UNITS = [
  { label: "Litre (L)", value: "L" },
  { label: "Millilitre (mL)", value: "mL" },
  { label: "Gallon (gal)", value: "gal" },
];

const AREA_UNITS = [
  { label: "Hectare (ha)", value: "ha" },
  { label: "Mètre carré (m²)", value: "m2" },
  { label: "Acre", value: "acre" },
];

const PAYMENT_METHODS = [
  { label: "Carte bancaire", value: PaymentMethod.card },
  { label: "Mobile Money", value: PaymentMethod.mobile_money },
  { label: "Orange Money", value: PaymentMethod.orange_money },
  { label: "Bank Transfer", value: PaymentMethod.bank_transfer },
  { label: "Espèces", value: PaymentMethod.cash },
  { label: "Autre", value: PaymentMethod.other },
];

type TabKey = "general" | "units" | "farming" | "notifications" | "finance" | "appearance";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "general", label: "Général", icon: <Globe className="w-4 h-4" /> },
  { key: "units", label: "Unités de mesure", icon: <Ruler className="w-4 h-4" /> },
  { key: "farming", label: "Élevage", icon: <PawPrint className="w-4 h-4" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { key: "finance", label: "Finance", icon: <Wallet className="w-4 h-4" /> },
  { key: "appearance", label: "Apparence", icon: <Palette className="w-4 h-4" /> },
];

const DEFAULT_SETTINGS: Settings = {
  currency: "XOF",
  language: "fr",
  dateFormat: "DD/MM/YYYY",
  timezone: "Africa/Douala",
  weightUnit: "kg",
  volumeUnit: "L",
  areaUnit: "ha",
  heatDetectionDays: 21,
  gestationDuration: 283,
  enableEmailAlerts: true,
  enableSmsAlerts: false,
  lowStockThreshold: 10,
  defaultPaymentMethod: PaymentMethod.cash,
};

// ── UI atoms ──────────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; hint?: string }> = ({
  label,
  required,
  children,
  hint,
}) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
      {label} {required && <span className="text-rouge">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
  </div>
);

const inputClass =
  "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }> = ({
  checked,
  onChange,
  label,
  sub,
}) => (
  <label className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition cursor-pointer">
    <div className="min-w-0 pr-3">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full flex-shrink-0 transition ${
        checked ? "bg-vert" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </label>
);

const SectionCard: React.FC<{
  title: string;
  description?: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}> = ({ title, description, icon, iconBg, children, onSave, saving }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
      <div>
        <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
    </div>
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition disabled:opacity-50 shadow-sm shadow-emerald-200"
      >
        {saving ? (
          <>
            <Spinner /> Enregistrement…
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> Enregistrer
          </>
        )}
      </button>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const SettingsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const currentSettings = useAppSelector(selectCurrentSettings);
  const settingsState = useAppSelector(selectSettingsState);
  const currentUser = useAppSelector(selectCurrentUser);
  console.log("currentUser", currentUser);
  const farmId = currentUser?.defaultFarmId;

  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [form, setForm] = useState<Settings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  const isLoading = settingsState.loading && !currentSettings;

  // ── Fetch ──
  const fetchData = useCallback(() => {
    if (farmId) dispatch(getSettingsByFarmId(farmId));
  }, [dispatch, farmId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (currentSettings) {
      setForm({ ...DEFAULT_SETTINGS, ...currentSettings });
    }
  }, [currentSettings]);

  const set = (k: keyof Settings, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const refresh = () => {
    fetchData();
    toast.info("Paramètres actualisés");
  };

  // ── Save (par section, mais on envoie l'objet complet) ──
  const handleSave = async () => {
    setSaving(true);
    try {
      if (currentSettings?.id) {
        const updated = await dispatch(
          updateSettings({ id: currentSettings.id, data: form }),
        ).unwrap();
        dispatch(patchCurrentSettings(updated.data as Partial<Settings>));
        toast.success("Paramètres mis à jour avec succès");
      } else {
        await dispatch(
          createSettings({ ...form, farmId: farmId ?? undefined }),
        ).unwrap();
        toast.success("Paramètres créés avec succès");
        fetchData();
      }
    } catch (err: any) {
      const apiError = extractApiError(err);
      toast.error(apiError.meta.message ?? "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(
    () => ({
      devise: form.currency,
      langue: form.language === "fr" ? "Français" : "English",
      alertes: form.enableEmailAlerts || form.enableSmsAlerts ? "Activées" : "Désactivées",
    }),
    [form],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium"
      />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Administration</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Paramètres système</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">Paramètres système</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Configurez le fonctionnement général de votre ferme
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!farmId ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <SettingsIcon className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">Aucune ferme associée à votre compte</p>
            <p className="text-sm text-gray-400">Contactez un administrateur pour vous rattacher à une ferme.</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 items-start">
            {/* ── Sidebar tabs ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex lg:flex-col gap-1 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                    activeTab === tab.key
                      ? "bg-emerald-50 text-vert"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Panels ── */}
            <div className="flex flex-col gap-5">
              {activeTab === "general" && (
                <SectionCard
                  title="Configuration générale"
                  description="Devise, langue, format de date et fuseau horaire"
                  icon={<Globe className="w-4 h-4 text-vert" />}
                  iconBg="bg-emerald-50"
                  onSave={handleSave}
                  saving={saving}
                >
                  <Field label="Nom de la ferme">
                    <input
                      type="text"
                      value={form.farmName ?? ""}
                      onChange={(e) => set("farmName", e.target.value)}
                      className={inputClass}
                      placeholder="Ferme Agro Douala"
                    />
                  </Field>
                  <Field label="Devise" required>
                    <SelectInput
                      value={form.currency}
                      onChange={(val) => set("currency", String(val))}
                      options={CURRENCIES}
                    />
                  </Field>
                  <Field label="Langue" required>
                    <SelectInput
                      value={form.language}
                      onChange={(val) => set("language", String(val))}
                      options={LANGUAGES}
                    />
                  </Field>
                  <Field label="Format de date" required>
                    <SelectInput
                      value={form.dateFormat}
                      onChange={(val) => set("dateFormat", String(val))}
                      options={DATE_FORMATS}
                    />
                  </Field>
                  <Field label="Fuseau horaire" required>
                    <SelectInput
                      value={form.timezone}
                      onChange={(val) => set("timezone", String(val))}
                      options={TIMEZONES}
                    />
                  </Field>
                </SectionCard>
              )}

              {activeTab === "units" && (
                <SectionCard
                  title="Unités de mesure"
                  description="Utilisées pour l'affichage dans toute l'application"
                  icon={<Ruler className="w-4 h-4 text-bleu" />}
                  iconBg="bg-blue-50"
                  onSave={handleSave}
                  saving={saving}
                >
                  <Field label="Unité de poids" required>
                    <SelectInput
                      value={form.weightUnit}
                      onChange={(val) => set("weightUnit", String(val))}
                      options={WEIGHT_UNITS}
                    />
                  </Field>
                  <Field label="Unité de volume" required>
                    <SelectInput
                      value={form.volumeUnit}
                      onChange={(val) => set("volumeUnit", String(val))}
                      options={VOLUME_UNITS}
                    />
                  </Field>
                  <Field label="Unité de superficie" required>
                    <SelectInput
                      value={form.areaUnit}
                      onChange={(val) => set("areaUnit", String(val))}
                      options={AREA_UNITS}
                    />
                  </Field>
                </SectionCard>
              )}

              {activeTab === "farming" && (
                <SectionCard
                  title="Paramètres d'élevage"
                  description="Valeurs par défaut utilisées pour le suivi reproductif"
                  icon={<PawPrint className="w-4 h-4 text-jaune" />}
                  iconBg="bg-yellow-50"
                  onSave={handleSave}
                  saving={saving}
                >
                  <Field
                    label="Détection de chaleur (jours)"
                    hint="Intervalle utilisé pour prévoir le prochain cycle"
                  >
                    <input
                      type="number"
                      min={1}
                      value={form.heatDetectionDays}
                      onChange={(e) => set("heatDetectionDays", Number(e.target.value))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Durée de gestation (jours)">
                    <input
                      type="number"
                      min={1}
                      value={form.gestationDuration}
                      onChange={(e) => set("gestationDuration", Number(e.target.value))}
                      className={inputClass}
                    />
                  </Field>
                </SectionCard>
              )}

              {activeTab === "notifications" && (
                <SectionCard
                  title="Notifications"
                  description="Choisissez comment vous souhaitez être alerté"
                  icon={<Bell className="w-4 h-4 text-purple-600" />}
                  iconBg="bg-purple-50"
                  onSave={handleSave}
                  saving={saving}
                >
                  <div className="sm:col-span-2">
                    <Toggle
                      checked={form.enableEmailAlerts}
                      onChange={(v) => set("enableEmailAlerts", v)}
                      label="Alertes par email"
                      sub="Recevoir les notifications importantes par email"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Toggle
                      checked={form.enableSmsAlerts}
                      onChange={(v) => set("enableSmsAlerts", v)}
                      label="Alertes par SMS"
                      sub="Recevoir les notifications importantes par SMS"
                    />
                  </div>
                  <Field
                    label="Seuil de stock bas"
                    hint="Déclenche une alerte quand le stock passe sous ce seuil"
                  >
                    <input
                      type="number"
                      min={0}
                      value={form.lowStockThreshold}
                      onChange={(e) => set("lowStockThreshold", Number(e.target.value))}
                      className={inputClass}
                    />
                  </Field>
                </SectionCard>
              )}

              {activeTab === "finance" && (
                <SectionCard
                  title="Finance"
                  description="Taxes et méthode de paiement par défaut"
                  icon={<Wallet className="w-4 h-4 text-vert" />}
                  iconBg="bg-emerald-50"
                  onSave={handleSave}
                  saving={saving}
                >
                  <Field label="Taux de taxe (%)">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={form.taxRate ?? ""}
                      onChange={(e) =>
                        set("taxRate", e.target.value === "" ? undefined : Number(e.target.value))
                      }
                      className={inputClass}
                      placeholder="19.25"
                    />
                  </Field>
                  <Field label="Méthode de paiement par défaut" required>
                    <SelectInput
                      value={form.defaultPaymentMethod}
                      onChange={(val) => set("defaultPaymentMethod", val as PaymentMethod)}
                      options={PAYMENT_METHODS}
                    />
                  </Field>
                </SectionCard>
              )}

              {activeTab === "appearance" && (
                <SectionCard
                  title="Apparence"
                  description="Personnalisez l'identité visuelle de votre espace"
                  icon={<Palette className="w-4 h-4 text-pink-600" />}
                  iconBg="bg-pink-50"
                  onSave={handleSave}
                  saving={saving}
                >
                  <Field label="Couleur principale">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.primaryColor ?? "#1e40af"}
                        onChange={(e) => set("primaryColor", e.target.value)}
                        className="w-11 h-11 rounded-xl border border-gray-200 cursor-pointer flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={form.primaryColor ?? ""}
                        onChange={(e) => set("primaryColor", e.target.value)}
                        className={inputClass}
                        placeholder="#1e40af"
                      />
                    </div>
                  </Field>
                  <Field label="URL du logo">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {form.logoUrl ? (
                          <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={form.logoUrl ?? ""}
                        onChange={(e) => set("logoUrl", e.target.value)}
                        className={inputClass}
                        placeholder="https://…/logo.png"
                      />
                    </div>
                  </Field>
                </SectionCard>
              )}

              {/* ── Résumé rapide ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-0.5">Devise</p>
                  <p className="text-sm font-bold text-gray-800">{summary.devise}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-0.5">Langue</p>
                  <p className="text-sm font-bold text-gray-800">{summary.langue}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-0.5">Notifications</p>
                  <p className="text-sm font-bold text-gray-800">{summary.alertes}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsDashboard;