/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import {
  Search,
  RefreshCw,
  ChevronRight,
  Settings,
  Plus,
  Pencil,
  Trash2,
  X,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchEquipements,
  createEquipement,
  updateEquipement,
  deleteEquipement,
  fetchEquipementMaintenances,
  createEquipementMaintenance,
  updateEquipementMaintenance,
  deleteEquipementMaintenance,
} from "../../../store/equipments/action";
import {
  selectEquipments,
  selectEquipmentState,
  selectMaintenances,
} from "../../../store/equipments/slice";
import {
  Equipement,
  EquipmentMaintenance,
} from "../../../models/equipement&maintenance";
import SelectInput from "../../../components/UI/SelectInput";
import { selectCurrentFarm } from "../../../store/farm/slice";

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
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
);

const fmtDate = (d?: string | Date) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtNum = (n?: number | null, dec = 0) =>
  n != null ? Number(n).toFixed(dec).replace(".", ",") : "—";

const statusConfig: Record<
  string,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  OPERATIONAL: {
    label: "Opérationnel",
    cls: "bg-emerald-50 text-vert border border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  UNDER_MAINTENANCE: {
    label: "En maintenance",
    cls: "bg-amber-50 text-amber-600 border border-amber-200",
    icon: <Wrench className="w-3.5 h-3.5" />,
  },
  OUT_OF_SERVICE: {
    label: "Hors service",
    cls: "bg-red-50 text-rouge border border-red-200",
    icon: <Ban className="w-3.5 h-3.5" />,
  },
};

const frequencyLabels: Record<string, string> = {
  daily: "Quotidienne",
  weekly: "Hebdomadaire",
  monthly: "Mensuelle",
  quarterly: "Trimestrielle",
  yearly: "Annuelle",
  custom: "Personnalisée",
};

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  bg: string;
}> = ({ label, value, sub, icon, bg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const DeleteModal: React.FC<{
  title: string;
  subtitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ title, subtitle, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
        Cette action est <strong>irréversible</strong>.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rouge text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <>
              <Spinner /> Suppression…
            </>
          ) : (
            "Confirmer"
          )}
        </button>
      </div>
    </div>
  </div>
);

const EquipmentFormModal: React.FC<{
  farmId: number;
  initial?: Equipement | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    purchaseDate: initial?.purchaseDate
      ? new Date(initial.purchaseDate).toISOString().slice(0, 10)
      : "",
    status: initial?.status || "OPERATIONAL",
    value: initial?.value ?? ("" as any),
    maintenanceFrequency: initial?.maintenanceFrequency || "",
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";

  const handleSubmit = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const payload: any = {
        farmId,
        name: form.name,
        description: form.description || undefined,
        purchaseDate: form.purchaseDate || undefined,
        status: form.status,
        value: form.value ? Number(form.value) : undefined,
        maintenanceFrequency: form.maintenanceFrequency || undefined,
      };
      if (initial) {
        await dispatch(
          updateEquipement({ id: initial.id, data: payload }),
        ).unwrap();
        toast.success("Équipement mis à jour avec succès");
      } else {
        await dispatch(createEquipement(payload)).unwrap();
        toast.success("Équipement ajouté avec succès");
      }
      onSuccess();
    } catch (err) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {initial ? "Modifier l'équipement" : "Nouvel équipement"}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nom <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="ex: Tracteur John Deere"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Détails, modèle, n° de série..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Date d'acquisition
              </label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => set("purchaseDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Valeur
              </label>
              <input
                type="number"
                step="0.01"
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                className={inputClass}
                placeholder="Optionnel"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Statut
            </label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("status", key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${form.status === key ? "bg-white text-vert shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {cfg.icon} {cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Fréquence de maintenance
            </label>
            <SelectInput
              value={form.maintenanceFrequency}
              onChange={(v) => set("maintenanceFrequency", v)}
              options={[
                { value: "", label: "Non définie" },
                ...Object.entries(frequencyLabels).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200"
          >
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : initial ? (
              "Enregistrer"
            ) : (
              "Créer l'équipement"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MaintenanceFormModal: React.FC<{
  farmId: number;
  equipments: Equipement[];
  initial?: EquipmentMaintenance | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, equipments, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    equipmentId: initial?.equipmentId ? String(initial.equipmentId) : "",
    name: initial?.name || "",
    maintenanceDate: initial?.maintenanceDate
      ? new Date(initial.maintenanceDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    cost: initial?.cost ?? ("" as any),
    notes: initial?.notes || "",
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";
  const equipmentOptions = equipments.map((e) => ({
    value: String(e.id),
    label: e.name,
  }));

  const handleSubmit = async () => {
    if (!form.equipmentId || !form.name || !form.maintenanceDate) return;
    setSaving(true);
    try {
      const payload: any = {
        farmId,
        equipmentId: Number(form.equipmentId),
        name: form.name,
        maintenanceDate: form.maintenanceDate,
        cost: form.cost ? Number(form.cost) : undefined,
        notes: form.notes || undefined,
      };
      if (initial) {
        await dispatch(
          updateEquipementMaintenance({ id: initial.id, data: payload }),
        ).unwrap();
        toast.success("Maintenance mise à jour avec succès");
      } else {
        await dispatch(createEquipementMaintenance(payload)).unwrap();
        toast.success("Maintenance enregistrée avec succès");
      }
      onSuccess();
    } catch (err) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-vert" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">
              {initial ? "Modifier la maintenance" : "Nouvelle maintenance"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Équipement <span className="text-red-400">*</span>
            </label>
            <SelectInput
              value={form.equipmentId}
              onChange={(v) => set("equipmentId", v)}
              options={equipmentOptions}
              placeholder="— choisir un équipement —"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Intervention <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="ex: Vidange, révision moteur..."
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.maintenanceDate}
                onChange={(e) => set("maintenanceDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Coût
              </label>
              <input
                type="number"
                step="0.01"
                value={form.cost}
                onChange={(e) => set("cost", e.target.value)}
                className={inputClass}
                placeholder="Optionnel"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Observations..."
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.equipmentId || !form.name}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200"
          >
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : initial ? (
              "Enregistrer"
            ) : (
              "Créer la maintenance"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const EquipmentMaintenanceDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const equipments = useAppSelector(selectEquipments);
  const maintenances = useAppSelector(selectMaintenances);
  const { loading } = useAppSelector(selectEquipmentState);
  const farmId = currentFarm?.id;

  const [activeTab, setActiveTab] = useState<"equipment" | "maintenance">(
    "equipment",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [showEquipForm, setShowEquipForm] = useState(false);
  const [editingEquip, setEditingEquip] = useState<Equipement | null>(null);
  const [deleteEquipTarget, setDeleteEquipTarget] = useState<Equipement | null>(
    null,
  );

  const [showMaintForm, setShowMaintForm] = useState(false);
  const [editingMaint, setEditingMaint] = useState<EquipmentMaintenance | null>(
    null,
  );
  const [deleteMaintTarget, setDeleteMaintTarget] =
    useState<EquipmentMaintenance | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchEquipements({ page: 1, limit: 200 }));
    dispatch(fetchEquipementMaintenances({ page: 1, limit: 200 }));
  }, [dispatch]);

  const refresh = useCallback(() => {
    dispatch(fetchEquipements({ page: 1, limit: 200 }));
    dispatch(fetchEquipementMaintenances({ page: 1, limit: 200 }));
    toast.info("Données actualisées");
  }, [dispatch]);

  const equipmentName = (id: number) =>
    equipments.find((e) => e.id === id)?.name || `Équipement #${id}`;

  const handleDeleteEquip = async () => {
    if (!deleteEquipTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteEquipement({ id: deleteEquipTarget.id })).unwrap();
      toast.success("Équipement supprimé avec succès");
      setDeleteEquipTarget(null);
    } catch (err) {
      toast.error("Erreur lors de la suppression");
      console.log(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteMaint = async () => {
    if (!deleteMaintTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(
        deleteEquipementMaintenance({ id: deleteMaintTarget.id }),
      ).unwrap();
      toast.success("Maintenance supprimée avec succès");
      setDeleteMaintTarget(null);
    } catch (err) {
      console.log(err);

      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEquip = useMemo(() => {
    let list = [...equipments];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((e) =>
        [e.name, e.description].some((v) => v?.toLowerCase().includes(q)),
      );
    }
    if (filterStatus !== "all")
      list = list.filter((e) => e.status === filterStatus);
    return list;
  }, [equipments, searchTerm, filterStatus]);

  const filteredMaint = useMemo(() => {
    let list = [...maintenances];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((m) =>
        [equipmentName(m.equipmentId), m.name, m.notes].some((v) =>
          v?.toLowerCase().includes(q),
        ),
      );
    }
    list.sort(
      (a, b) =>
        new Date(b.maintenanceDate).getTime() -
        new Date(a.maintenanceDate).getTime(),
    );
    return list;
  }, [maintenances, equipments, searchTerm]);

  const totalMaintCost = maintenances.reduce((s, m) => s + (m.cost || 0), 0);
  const underMaintenanceCount = equipments.filter(
    (e) => e.status === "UNDER_MAINTENANCE",
  ).length;
  const outOfServiceCount = equipments.filter(
    (e) => e.status === "OUT_OF_SERVICE",
  ).length;

  const paginatedMaint = filteredMaint.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const totalPagesM = Math.max(
    1,
    Math.ceil(filteredMaint.length / ITEMS_PER_PAGE),
  );

  const isLoading = loading;

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Stocks & Matériel</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">
                Équipements & Maintenance
              </span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">
              Équipements & Maintenance
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Suivi du matériel et de son entretien
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                activeTab === "equipment"
                  ? (setEditingEquip(null), setShowEquipForm(true))
                  : (setEditingMaint(null), setShowMaintForm(true))
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition shadow-sm shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />{" "}
              {activeTab === "equipment"
                ? "Nouvel équipement"
                : "Nouvelle maintenance"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total équipements"
            value={equipments.length}
            sub="enregistrés"
            icon={<Settings className="w-5 h-5 text-vert" />}
            bg="bg-emerald-50"
          />
          <StatCard
            label="En maintenance"
            value={underMaintenanceCount}
            sub="actuellement"
            icon={<Wrench className="w-5 h-5 text-amber-600" />}
            bg="bg-amber-50"
          />
          <StatCard
            label="Hors service"
            value={outOfServiceCount}
            sub="à traiter"
            icon={<AlertCircle className="w-5 h-5 text-rouge" />}
            bg="bg-red-50"
          />
          <StatCard
            label="Coût total maintenance"
            value={`${fmtNum(totalMaintCost)} F`}
            sub={`${maintenances.length} interventions`}
            icon={<Wrench className="w-5 h-5 text-bleu" />}
            bg="bg-blue-50"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {(["equipment", "maintenance"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchTerm("");
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === tab ? "bg-vert text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab === "equipment" ? "Équipements" : "Historique maintenance"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={
                activeTab === "equipment"
                  ? "Rechercher équipement..."
                  : "Rechercher intervention, équipement..."
              }
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            />
          </div>
          {activeTab === "equipment" && (
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">Tous statuts</option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : activeTab === "equipment" ? (
          filteredEquip.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Settings className="w-10 h-10 text-gray-200" />
              <p className="font-semibold text-gray-500">
                Aucun équipement trouvé
              </p>
              <button
                onClick={() => {
                  setEditingEquip(null);
                  setShowEquipForm(true);
                }}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition"
              >
                <Plus className="w-4 h-4" /> Nouvel équipement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredEquip.map((e) => {
                const cfg = statusConfig[e.status];
                return (
                  <div
                    key={e.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-vert" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {e.name}
                          </p>
                          {e.maintenanceFrequency && (
                            <p className="text-xs text-gray-400">
                              Maintenance{" "}
                              {frequencyLabels[
                                e.maintenanceFrequency
                              ]?.toLowerCase()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setEditingEquip(e);
                            setShowEquipForm(true);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteEquipTarget(e)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {e.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {e.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${cfg?.cls}`}
                      >
                        {cfg?.icon} {cfg?.label}
                      </span>
                      {e.value != null && (
                        <span className="text-xs font-bold text-gray-600">
                          {fmtNum(e.value)} F
                        </span>
                      )}
                    </div>
                    {e.purchaseDate && (
                      <p className="text-[11px] text-gray-300">
                        Acquis le {fmtDate(e.purchaseDate)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : filteredMaint.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Wrench className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">
              Aucune maintenance enregistrée
            </p>
            <button
              onClick={() => {
                setEditingMaint(null);
                setShowMaintForm(true);
              }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition"
            >
              <Plus className="w-4 h-4" /> Nouvelle maintenance
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[110px_1fr_1fr_110px_1fr_96px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Date
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Équipement
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Intervention
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Coût
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Notes
              </p>
              <p />
            </div>
            <div className="divide-y divide-gray-50">
              {paginatedMaint.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-[1fr_auto] md:grid-cols-[110px_1fr_1fr_110px_1fr_96px] gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition items-center group"
                >
                  <p className="text-xs text-gray-500">
                    {fmtDate(m.maintenanceDate)}
                  </p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {equipmentName(m.equipmentId)}
                  </p>
                  <p className="hidden md:block text-sm text-gray-600">
                    {m.name}
                  </p>
                  <p className="hidden md:block text-sm font-bold text-gray-800">
                    {m.cost != null ? `${fmtNum(m.cost)} F` : "—"}
                  </p>
                  <p
                    className="hidden md:block text-xs text-gray-400 truncate"
                    title={m.notes || ""}
                  >
                    {m.notes || "—"}
                  </p>
                  <div
                    className="flex items-center gap-1 justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setEditingMaint(m);
                        setShowMaintForm(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteMaintTarget(m)}
                      className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {(page - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(page * ITEMS_PER_PAGE, filteredMaint.length)} sur{" "}
                {filteredMaint.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                {Array.from({ length: Math.min(5, totalPagesM) }, (_, i) => {
                  const pg =
                    totalPagesM <= 5
                      ? i + 1
                      : Math.max(1, Math.min(page - 2, totalPagesM - 4)) + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${pg === page ? "bg-vert text-white" : "hover:bg-gray-200 text-gray-600"}`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPagesM, p + 1))}
                  disabled={page === totalPagesM}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEquipForm && farmId && (
        <EquipmentFormModal
          farmId={farmId}
          initial={editingEquip}
          onClose={() => {
            setShowEquipForm(false);
            setEditingEquip(null);
          }}
          onSuccess={() => {
            setShowEquipForm(false);
            setEditingEquip(null);
            refresh();
          }}
        />
      )}
      {showMaintForm && farmId && (
        <MaintenanceFormModal
          farmId={farmId}
          equipments={equipments}
          initial={editingMaint}
          onClose={() => {
            setShowMaintForm(false);
            setEditingMaint(null);
          }}
          onSuccess={() => {
            setShowMaintForm(false);
            setEditingMaint(null);
            refresh();
          }}
        />
      )}
      {deleteEquipTarget && (
        <DeleteModal
          title="Supprimer cet équipement ?"
          subtitle={deleteEquipTarget.name}
          onCancel={() => setDeleteEquipTarget(null)}
          onConfirm={handleDeleteEquip}
          isDeleting={isDeleting}
        />
      )}
      {deleteMaintTarget && (
        <DeleteModal
          title="Supprimer cette maintenance ?"
          subtitle={`${equipmentName(deleteMaintTarget.equipmentId)} · ${deleteMaintTarget.name}`}
          onCancel={() => setDeleteMaintTarget(null)}
          onConfirm={handleDeleteMaint}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default EquipmentMaintenanceDashboard;
