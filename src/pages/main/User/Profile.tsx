import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../store";
import {
  User as UserIcon,
  Camera,
  Mail,
  Phone,
  AtSign,
  Edit2,
  Save,
  X,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import {
  sendEmailVerificationOtp,
  verifyEmailOTP,
} from "../../../store/auth/action";
import { updateUserProfile } from "../../../store/auth/userAction";
import { selectCurrentUser, selectAuthStatus } from "../../../store/auth/slice";
import { LoadingType } from "../../../models/store";

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);
  const status = useSelector(selectAuthStatus);
  const isSaving = status === LoadingType.PENDING;

  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState<string | null>(user?.photo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    userName: user?.userName || "",
    phone: user?.phone || "",
  });

  // --- Vérification email ---
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const payload = {
      ...form,
      ...(preview && preview !== user?.photo ? { photo: preview } : {}),
    };

    const result = await dispatch(
      updateUserProfile({
        id: user.id,
        data: payload,
      })
    );

    if (updateUserProfile.fulfilled.match(result)) {
      setEditMode(false);
    }
  };

  const handleSendOtp = () => {
    if (!user?.email) return;
    dispatch(sendEmailVerificationOtp({ email: user.email }));
    setOtpModalOpen(true);
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    const result = await dispatch(verifyEmailOTP({ email: user.email, otp }));
    if (verifyEmailOTP.fulfilled.match(result)) {
      setOtpModalOpen(false);
      setOtp("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 my-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Bandeau */}
        <div className="h-24 bg-gradient-to-r from-vert to-jaune" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 flex items-end justify-between">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-jaune text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
                {preview ? (
                  <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {editMode && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-vert text-white rounded-full flex items-center justify-center shadow-sm hover:bg-vert/90"
                >
                  <Camera size={16} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={16} />
                Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setPreview(user?.photo || null);
                    setForm({
                      name: user?.name || "",
                      userName: user?.userName || "",
                      phone: user?.phone || "",
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Infos */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Field
              icon={<UserIcon size={18} className="text-gray-400" />}
              label="Nom complet"
              editMode={editMode}
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <Field
              icon={<AtSign size={18} className="text-gray-400" />}
              label="Nom d'utilisateur"
              editMode={editMode}
              value={form.userName}
              onChange={(v) => setForm((f) => ({ ...f, userName: v }))}
            />
            <Field
              icon={<Phone size={18} className="text-gray-400" />}
              label="Téléphone"
              editMode={editMode}
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            />

            {/* Email non éditable ici, avec statut de vérification */}
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-tight">
                    Email
                  </p>
                  <p className="text-sm text-gray-800">{user?.email}</p>
                </div>
              </div>
              {user?.emailVerified ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-vert">
                  <ShieldCheck size={14} />
                  Vérifié
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
                >
                  <ShieldAlert size={14} />
                  Vérifier
                </button>
              )}
            </div>

            {editMode && (
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-vert text-white text-sm font-semibold rounded-lg hover:bg-vert/90 transition-colors disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Enregistrer
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Modal OTP vérification email */}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Vérifier votre email</h3>
            <p className="text-sm text-gray-500 mb-4">
              Un code a été envoyé à {user?.email}.
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Code OTP"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vert"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-vert rounded-lg hover:bg-vert/90"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Petit composant interne pour un champ label/valeur ou input
const Field = ({
  icon,
  label,
  value,
  editMode,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editMode: boolean;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-3 py-2 border-b border-gray-50">
    {icon}
    <div className="flex-1">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-tight">{label}</p>
      {editMode ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-2 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-vert"
        />
      ) : (
        <p className="text-sm text-gray-800">{value || "—"}</p>
      )}
    </div>
  </div>
);

export default ProfilePage;