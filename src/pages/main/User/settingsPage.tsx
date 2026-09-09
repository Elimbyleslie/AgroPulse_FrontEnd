/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../store";
import { Lock, LogOut, Bell, Loader2, CheckCircle2 } from "lucide-react";
import { updatePassword, logout } from "../../../store/auth/action";
import { selectAuthStatus } from "../../../store/auth/slice";
import { LoadingType } from "../../../models/store";

const SettingsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectAuthStatus);
  const isSaving = status === LoadingType.PENDING;

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Préférences (local uniquement pour l'instant, pas d'endpoint dédié)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
  });

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("Les mots de passe ne correspondent pas.");
      return;
    }

    const result = await dispatch(
      updatePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      } as any),
    );

    if (updatePassword.fulfilled.match(result)) {
      setPwdSuccess(true);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-20 sm:p-6 space-y-6">

      {/* Sécurité */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-gray-400" />
          <h2 className="text-base font-bold text-gray-800">Sécurité</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-tight">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={pwdForm.currentPassword}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, currentPassword: e.target.value }))
              }
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vert"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-tight">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vert"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-tight">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={pwdForm.confirmPassword}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vert"
              required
            />
          </div>

          {pwdError && <p className="text-xs text-red-500 font-medium">{pwdError}</p>}
          {pwdSuccess && (
            <p className="flex items-center gap-1 text-xs text-vert font-medium">
              <CheckCircle2 size={14} />
              Mot de passe mis à jour.
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-vert text-white text-sm font-semibold rounded-lg hover:bg-vert/90 transition-colors disabled:opacity-60"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            Mettre à jour
          </button>
        </form>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-gray-400" />
          <h2 className="text-base font-bold text-gray-800">Notifications</h2>
        </div>

        <ToggleRow
          label="Notifications par email"
          checked={notifications.email}
          onChange={(v) => setNotifications((n) => ({ ...n, email: v }))}
        />
        <ToggleRow
          label="Notifications push"
          checked={notifications.push}
          onChange={(v) => setNotifications((n) => ({ ...n, push: v }))}
        />
      
      </section>

      {/* Zone de danger */}
      <section className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
        <h2 className="text-base font-bold text-red-600 mb-4">Zone de danger</h2>
        <button
          onClick={() => dispatch(logout())}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </section>
    </div>
  );
};

const ToggleRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-700">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors relative ${
        checked ? "bg-vert" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          checked ? "-translate-x-0" : "-translate-x-5"
        }`}
      />
    </button>
  </div>
);

export default SettingsPage;