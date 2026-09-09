/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { X, Link2, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { createInvitation } from "../../store/administration/inviteAction";
import { selectInvitationCreateState } from "../../store/administration/inviteSlice";
import { Role } from "../../models/UserRolePermission";
import SelectInput from "../UI/SelectInput";
import { PATH_AUTH } from "../../constants/paths";

interface InviteModalProps {
  organizationId: number;
  organizationName: string;
  farms: { id: number; name: string }[];
  roles?: Role[];
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
  organizationId,
  organizationName,
  farms,
  roles = [],
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const createState = useAppSelector(selectInvitationCreateState);

  const [farmId, setFarmId] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("");
  const [usageMode, setUsageMode] = useState<"single" | "unlimited">("single");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const result = await dispatch(
        createInvitation({
          organizationId,
          data: {
            farmId: farmId ? Number(farmId) : undefined,
            roleId: roleId ? Number(roleId) : undefined,
            maxUses: usageMode === "unlimited" ? null : 1,
          },
        }),
      ).unwrap();

      const invitation = result.data as any;
      const link = `${window.location.origin}${PATH_AUTH.REGISTER}?token=${invitation.token}`;
      setGeneratedLink(link);
    } catch {
      toast.error("Erreur lors de la génération du lien");
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Lien copié");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Link2 className="w-4 h-4 text-bleu" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Inviter un membre</h2>
              <p className="text-xs text-gray-400">{organizationName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!generatedLink ? (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Ferme (optionnel)
                </label>
                <SelectInput
                  value={farmId}
                  placeholder="Aucune ferme spécifique"
                  onChange={(val) => setFarmId(String(val))}
                  options={[
                    { label: "Aucune ferme spécifique", value: "" },
                    ...farms.map((f) => ({ label: f.name, value: String(f.id) })),
                  ]}
                />
              </div>

              {roles.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Rôle à assigner (optionnel)
                  </label>
                  <SelectInput
                    value={roleId}
                    placeholder="Aucun rôle automatique"
                    onChange={(val) => setRoleId(String(val))}
                    options={[
                      { label: "Aucun rôle automatique", value: "" },
                      ...roles.map((r) => ({ label: r.name, value: String(r.id) })),
                    ]}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Utilisation du lien
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUsageMode("single")}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                      usageMode === "single"
                        ? "bg-emerald-50 border-vert text-vert"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Usage unique
                  </button>
                  <button
                    onClick={() => setUsageMode("unlimited")}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                      usageMode === "unlimited"
                        ? "bg-emerald-50 border-vert text-vert"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Réutilisable
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={createState.loading}
                className="w-full py-2.5 rounded-xl bg-vert text-white text-sm font-semibold hover:bg-dark_vert transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {createState.loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Génération…
                  </>
                ) : (
                  "Générer le lien"
                )}
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400">
                Partagez ce lien avec la personne à inviter. Elle sera automatiquement
                rattachée à cette organisation{farmId ? " et à la ferme sélectionnée" : ""}.
              </p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <span className="flex-1 text-xs text-gray-600 truncate">{generatedLink}</span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-vert" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setGeneratedLink(null)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition"
              >
                Générer un nouveau lien
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;