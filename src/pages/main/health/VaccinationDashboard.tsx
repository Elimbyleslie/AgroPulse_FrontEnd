/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { Farm } from "../../../models/farm";
import {
  Syringe, Plus, AlertTriangle, CheckCircle2, Clock,
  Search, Trash2, Pencil, X, Calendar, User,
  ChevronDown, ChevronUp, Bell, Shield, Activity,
  FlaskConical, Layers,
} from "lucide-react";
import {
  fetchVaccination,
  deleteAnimalVaccination,
  createAnimalVaccination,
  updateAnimalVaccination,
} from "../../../store/health/action";
import { clearError, clearSuccess } from "../../../store/health/slice";
import { selectCurrentFarm, setCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";
import { getAllAnimals } from "../../../store/animal/action";
import { toast } from "react-toastify";
import SelectInput from "../../../components/UI/SelectInput";
import Button from "../../../components/UI/Button";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d?: string | Date | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

const daysUntil = (d?: string | Date | null): number | null => {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const getUrgency = (nextDue?: string | Date | null) => {
  const days = daysUntil(nextDue);
  if (days === null) return { label: "Complété",      color: "done",    icon: CheckCircle2, days: null };
  if (days < 0)      return { label: "En retard",     color: "overdue", icon: AlertTriangle, days };
  if (days <= 7)     return { label: `Dans ${days}j`, color: "urgent",  icon: Bell,          days };
  if (days <= 365)    return { label: `Dans ${days}j`, color: "soon",    icon: Clock,         days };
  return               { label: `Dans ${days}j`,      color: "ok",      icon: Shield,        days };
};

// Pill classes par couleur d'urgence
const pillClass: Record<string, string> = {
  overdue: "bg-red-100 text-red-600",
  soon:    "bg-blue-100 text-bleu",
  ok:      "bg-green-100 text-green-600",
  done:    "bg-gray-100 text-gray-500",
};

// Icône bg+color par urgence
const iconClass: Record<string, string> = {
  overdue: "bg-red-100 text-red-500",
  soon:    "bg-blue-100 text-bleu",
  ok:      "bg-green-100 text-green-600",
  done:    "bg-gray-100 text-gray-400",
};

// Bordure gauche carte
const borderClass: Record<string, string> = {
  overdue: "border-l-4 border-l-red-400",
  soon:    "border-l-4 border-l-blue-400",
  ok:      "border-l-4 border-l-green-400",
  done:    "",
};

// ─── VaccinationForm ──────────────────────────────────────────────────────────
interface VFormProps {
  farmId?: number;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const VaccinationForm: React.FC<VFormProps> = ({ farmId, initialData, onSuccess, onCancel }) => {
  const dispatch = useAppDispatch();
  const { loading, error, success } = useAppSelector((s) => s.health);
  const currentUser = useAppSelector((s) => s.authentification.auth.user);
  const animalsEntities = useAppSelector((s) => s.animal.animalist.entities);
  const animals: any[] = Array.isArray(animalsEntities) ? animalsEntities : [];

  const [form, setForm] = useState({
    animalId:   initialData?.animalId ?? 0,
    vaccineName: initialData?.vaccineName ?? "",
    dateGiven:  initialData?.dateGiven
      ? new Date(initialData.dateGiven).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    nextDue: initialData?.nextDue
      ? new Date(initialData.nextDue).toISOString().split("T")[0]
      : "",
  });

  useEffect(() => { if (error)   { toast.error(error);   dispatch(clearError());   } }, [error,   dispatch]);
  useEffect(() => {
    if (success) {
      toast.success(initialData?.id ? "Vaccination mise à jour" : "Vaccination enregistrée");
      dispatch(clearSuccess());
      onSuccess();
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.animalId)          return toast.error("Sélectionnez un animal");
    if (!form.vaccineName.trim()) return toast.error("Nom du vaccin requis");
    if (!currentUser?.id)        return toast.error("Utilisateur non authentifié");

    const payload = {
      animalId:      Number(form.animalId),
      vaccineName:   form.vaccineName.trim(),
      dateGiven:     new Date(form.dateGiven).toISOString(),
      nextDue:       form.nextDue ? new Date(form.nextDue).toISOString() : undefined,
      administeredBy: currentUser.id,
      ...(initialData?.lotId && { lotId: initialData.lotId }),
    };

    try {
      if (initialData?.id) {
        await dispatch(updateAnimalVaccination({ id: initialData.id, data: payload as any })).unwrap();
      } else {
        await dispatch(createAnimalVaccination(payload as any)).unwrap();
      }
    } catch (err) { console.error(err); }
  };

  const animalOptions = useMemo(() => {
    if (!animals.length) return [{ value: "", label: "Aucun animal disponible" }];
    return [
      { value: "", label: "Choisir un animal" },
      ...animals.map((a: any) => ({
        value: a.id.toString(),
        label: `${a.name}${a.species ? ` (${typeof a.species === "object" ? a.species.name : a.species})` : ""}`,
      })),
    ];
  }, [animals]);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-jaune/10 rounded-xl text-jaune"><Syringe size={22} /></div>
        <div>
          <h2 className="text-base font-black text-gray-900">
            {initialData?.id ? "Modifier le vaccin" : "Nouveau vaccin"}
          </h2>
          <p className="text-xs text-gray-400">Enregistrement d'une vaccination</p>
        </div>
        <button type="button" onClick={onCancel} className="ml-auto p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Animal */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Animal concerné *</label>
          <SelectInput
            value={form.animalId.toString()}
            onChange={(v) => setForm({ ...form, animalId: Number(v) })}
            options={animalOptions}
            placeholder="Choisir l'animal"
            disabled={loading}
          />
        </div>

        {/* Nom vaccin */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nom du vaccin *</label>
          <div className="relative">
            <FlaskConical size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-jaune/10 transition-all"
              placeholder="Ex: Fièvre aphteuse, Charbon..."
              value={form.vaccineName}
              onChange={(e) => setForm({ ...form, vaccineName: e.target.value })}
              required disabled={loading}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Date d'administration *</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-jaune/10 transition-all"
                value={form.dateGiven}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, dateGiven: e.target.value })}
                required disabled={loading}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Prochain rappel</label>
            <div className="relative">
              <Bell size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-jaune/10 transition-all"
                value={form.nextDue}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, nextDue: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 italic ml-1">* Champs obligatoires</p>

        {/* Boutons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button" onClick={onCancel} disabled={loading}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
          >
            Annuler
          </Button>
          <Button
            type="submit" disabled={loading || !farmId}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-jaune hover:bg-jaune text-white rounded-xl font-bold text-sm shadow-md shadow-blue-200 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Enregistrement...</>
            ) : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const VaccinationDashboard: React.FC<{ animalId?: number }> = ({ animalId }) => {
  const dispatch = useAppDispatch();
  const { vaccinations: rawVaccinations, loading } = useAppSelector((s) => s.health);
  const currentUser  = useAppSelector((s) => s.authentification.auth.user);
  const currentFarm  = useAppSelector(selectCurrentFarm);
  const animalsEntities = useAppSelector((s) => s.animal.animalist.entities);
  const animals: any[] = Array.isArray(animalsEntities) ? animalsEntities : [];
  const farmId = currentFarm?.id;

  const [isLoadingFarm,   setIsLoadingFarm]   = useState(false);
  const [showForm,        setShowForm]         = useState(false);
  const [editingVaccin,   setEditingVaccin]    = useState<any | null>(null);
  const [detailVaccin,    setDetailVaccin]     = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId]  = useState<number | null>(null);
  const [isDeleting,      setIsDeleting]       = useState(false);
  const [searchTerm,      setSearchTerm]       = useState("");
  const [filterStatus,    setFilterStatus]     = useState<"all" | "overdue" | "urgent" | "soon" | "ok" | "done">("all");
  const [filterAnimalId,  setFilterAnimalId]   = useState<string>("all");
  const [expandedId,      setExpandedId]       = useState<number | null>(null);
  const [activeTab,       setActiveTab]        = useState<"list" | "calendar">("list");

  // ─── Hydratation ferme ────────────────────────────────────────────────────
  useEffect(() => {
    const hydrate = async () => {
      if (!currentUser?.id || currentFarm?.id) return;
      setIsLoadingFarm(true);
      try {
        const result = await dispatch(getUserFarms()).unwrap();
        const farms  = result?.data || result;
        if (Array.isArray(farms) && farms.length > 0) {
          const saved   = localStorage.getItem("last_farm_id");
          const toUse   = saved
            ? (farms.find((f: Farm) => f.id === parseInt(saved, 10)) ?? farms[0])
            : farms[0];
          if (toUse) dispatch(setCurrentFarm(toUse));
        }
      } catch (e) { console.error(e); }
      finally { setIsLoadingFarm(false); }
    };
    hydrate();
  }, [currentUser?.id, currentFarm?.id, dispatch]);

  // ─── Chargement animaux ───────────────────────────────────────────────────
  useEffect(() => {
    if (farmId) dispatch(getAllAnimals({ farmId, limit: 200 }));
  }, [dispatch, farmId]);

  // ─── Chargement vaccins ───────────────────────────────────────────────────
  const loadVaccinations = useCallback(() => {
    if (!farmId) return;
    dispatch(fetchVaccination(animalId ? String(animalId) : ""));
  }, [dispatch, farmId, animalId]);

  useEffect(() => { loadVaccinations(); }, [loadVaccinations]);

  // ─── Normalisation ────────────────────────────────────────────────────────
  const vaccinsList: any[] = useMemo(() => {
    const raw = rawVaccinations as any;
    if (Array.isArray(raw))     return raw;
    if (raw?.vaccinations)      return raw.vaccinations;
    return [];
  }, [rawVaccinations]);

  const normalized = useMemo(() => vaccinsList.map((v: any) => ({
    ...v,
    animalName: v.animalName ?? v.animal?.name  ?? "—",
    speciesName: v.animal?.species?.name ?? v.animal?.species ?? "—",
    adminName:  v.administeredBy?.name ?? v.admin?.name ?? "—",
  })), [vaccinsList]);

  // ─── Filtrage ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => normalized
    .filter((v) => {
      const u = getUrgency(v.nextDue);
      if (filterStatus !== "all" && u.color !== filterStatus) return false;
      if (filterAnimalId !== "all" && String(v.animalId) !== filterAnimalId) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return v.vaccineName?.toLowerCase().includes(s) || v.animalName?.toLowerCase().includes(s);
      }
      return true;
    })
    .sort((a, b) => (daysUntil(a.nextDue) ?? 999) - (daysUntil(b.nextDue) ?? 999)),
  [normalized, filterStatus, filterAnimalId, searchTerm]);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   normalized.length,
    overdue: normalized.filter(v => getUrgency(v.nextDue).color === "overdue").length,
    urgent:  normalized.filter(v => ["urgent", "soon"].includes(getUrgency(v.nextDue).color)).length,
    done:    normalized.filter(v => getUrgency(v.nextDue).color === "done").length,
  }), [normalized]);

  // ─── Calendrier ───────────────────────────────────────────────────────────
  const calendarGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};
    normalized
      .filter(v => v.nextDue && (daysUntil(v.nextDue) ?? -1) >= 0)
      .sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())
      .forEach(v => {
        const key = new Date(v.nextDue).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
        if (!groups[key]) groups[key] = [];
        groups[key].push(v);
      });
    return groups;
  }, [normalized]);

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await dispatch(deleteAnimalVaccination({ id })).unwrap();
      toast.success("Vaccination supprimée");
      setConfirmDeleteId(null);
      setDetailVaccin(null);
    } catch { toast.error("Erreur lors de la suppression"); }
    finally { setIsDeleting(false); }
  };

  const animalFilterOptions = useMemo(() => [
    { value: "all", label: "Tous les animaux" },
    ...animals.map((a: any) => ({ value: a.id.toString(), label: a.name })),
  ], [animals]);

  // ─── Loading / empty guards ───────────────────────────────────────────────
  if (isLoadingFarm) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-500">
      <div className="w-11 h-11 rounded-full border-[3px] border-gray-200 border-t-blue-500 animate-spin" />
      <p className="font-semibold">Chargement de la ferme...</p>
    </div>
  );

  if (!farmId) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="p-5 bg-orange-50 rounded-2xl text-orange-500"><AlertTriangle size={32} /></div>
      <p className="font-bold text-gray-700">Aucune ferme sélectionnée</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-jaune/10 rounded-xl text-jaune"><Syringe size={22} /></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Vaccins & Traitements</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {currentFarm?.name ?? ""} • Suivi du calendrier vaccinal
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditingVaccin(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-jaune hover:bg-jaune text-white rounded-xl font-bold text-sm shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={16} /> Nouveau vaccin
        </button>
      </div>

      {/* ── Alerte overdue ── */}
      {stats.overdue > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="p-2 bg-red-500 text-white rounded-xl shrink-0 animate-pulse">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-sm font-black text-red-600">
              {stats.overdue} rappel{stats.overdue > 1 ? "s" : ""} en retard !
            </p>
            <p className="text-xs text-red-400">Des animaux nécessitent une vaccination immédiate.</p>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      {!loading && normalized.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { key: "all",     val: stats.total,   label: "Total",      cls: "text-gray-700"   },
            { key: "overdue", val: stats.overdue,  label: "En retard",  cls: "text-rouge"    },
            { key: "urgent",  val: stats.urgent,   label: "À venir",    cls: "text-bleu" },
            { key: "done",    val: stats.done,     label: "Complétés",  cls: "text-vert"  },
          ].map(s => (
            <div
              key={s.key}
              onClick={() => setFilterStatus(s.key as any)}
              className={`bg-white rounded-2xl p-3 text-center border shadow-sm cursor-pointer hover:-translate-y-0.5 transition-all ${
                filterStatus === s.key ? "border-2 border-vert" : "border-gray-100"
              }`}
            >
              <p className={`text-2xl font-black ${s.cls}`}>{s.val}</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex bg-white rounded-2xl p-1 gap-1 border border-gray-100 shadow-sm">
        {([
          { key: "list",     label: "Liste",              icon: <Layers size={15} /> },
          { key: "calendar", label: "Calendrier rappels", icon: <Calendar size={15} /> },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === t.key
                ? "bg-jaune text-white shadow-md shadow-blue-200"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      {activeTab === "list" && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-jaune/10 transition-all"
              placeholder="Rechercher vaccin, animal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>
          <select
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer"
            value={filterAnimalId}
            onChange={(e) => setFilterAnimalId(e.target.value)}
          >
            {animalFilterOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* ══ CONTENU ══ */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <div className="h-3 rounded-lg bg-gray-100 animate-pulse w-2/5" />
                <div className="h-3.5 rounded-lg bg-gray-100 animate-pulse w-3/4" />
                <div className="h-2.5 rounded-lg bg-gray-100 animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === "list" ? (
        filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="p-5 bg-gray-100 rounded-2xl text-gray-300"><Syringe size={28} /></div>
            <p className="text-sm font-black text-gray-500">Aucun vaccin trouvé</p>
            <p className="text-xs text-gray-400">
              {searchTerm || filterStatus !== "all" ? "Modifiez vos filtres" : "Ajoutez le premier vaccin"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-1 flex items-center gap-2 px-4 py-2.5 bg-jaune text-white text-sm rounded-xl font-bold shadow-md shadow-blue-200"
              >
                <Plus size={15} /> Ajouter un vaccin
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((v: any) => {
              const u = getUrgency(v.nextDue);
              const UIcon = u.icon;
              const isExpanded = expandedId === v.id;
              return (
                <div key={v.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all ${borderClass[u.color] ?? ""}`}>
                  <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/60 transition-colors" onClick={() => setDetailVaccin(v)}>
                    <div className={`p-2 rounded-xl shrink-0 ${iconClass[u.color]}`}>
                      <UIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide inline-flex items-center gap-1 ${pillClass[u.color]}`}>
                          <UIcon size={9} /> {u.label}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">{v.vaccineName || "Vaccin non précisé"}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-0.5">
                        <User size={10} /> {v.animalName}
                        {v.speciesName !== "—" && <span className="text-gray-400">· {v.speciesName}</span>}
                      </div>
                      <div className="flex gap-3 mt-0.5 text-[11px] text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><Calendar size={9} /> {fmt(v.dateGiven)}</span>
                        {v.nextDue && <span className="flex items-center gap-1"><Bell size={9} /> {fmt(v.nextDue)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditingVaccin(v); setShowForm(true); }} className="p-2 rounded-xl text-gray-400 hover:text-jaune hover:bg-blue-50 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(v.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : v.id)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-50 px-4 pb-4 pt-3 flex flex-col gap-3">
                      {v.adminName !== "—" && (
                        <div>
                          <p className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                            <User size={10} /> Administré par
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{v.adminName}</p>
                        </div>
                      )}
                      {v.notes && (
                        <div>
                          <p className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                            <Activity size={10} /> Notes
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{v.notes}</p>
                        </div>
                      )}
                      {v.adminName === "—" && !v.notes && (
                        <p className="text-xs text-gray-400">Aucun détail supplémentaire.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        // ── Calendrier ──
        <div className="flex flex-col gap-6">
          {Object.keys(calendarGroups).length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <CheckCircle2 size={36} className="text-green-500" />
              <p className="text-sm font-bold text-gray-500">Aucun rappel à venir — tout est à jour !</p>
            </div>
          ) : (
            Object.entries(calendarGroups).map(([month, items]) => (
              <div key={month}>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">{month}</p>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((v: any) => {
                    const d = new Date(v.nextDue);
                    const u = getUrgency(v.nextDue);
                    const dateGradient =
                      u.color === "overdue" ? "bg-red-500" :
                      u.color === "urgent"  ? "bg-orange-500" :
                      u.color === "soon"    ? "bg-bleu" :
                      u.color === "done"    ? "bg-vert" :
                      "bg-gray-300";
                    return (
                      <div
                        key={v.id}
                        onClick={() => setDetailVaccin(v)}
                        className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <div className={`${dateGradient} text-white rounded-xl px-3 py-2 text-center shrink-0 min-w-[48px]`}>
                          <div className="text-lg font-black leading-none">{d.getDate()}</div>
                          <div className="text-[10px] font-bold uppercase opacity-85">
                            {d.toLocaleDateString("fr-FR", { month: "short" })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{v.vaccineName}</p>
                          <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <User size={10} /> {v.animalName}
                          </p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wide ${pillClass[u.color]}`}>
                          {u.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══ MODAL DÉTAIL ══ */}
      {detailVaccin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailVaccin(null)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <button onClick={() => setDetailVaccin(null)} className="absolute top-4 right-4 z-10 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 transition-colors">
              <X size={15} />
            </button>
            {(() => {
              const u  = getUrgency(detailVaccin.nextDue);
              const UI = u.icon;
              return (
                <>
                  <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide inline-flex items-center gap-1 ${pillClass[u.color]}`}>
                        <UI size={10} /> {u.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 pr-8">{detailVaccin.vaccineName}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg font-medium">
                        <User size={11} /> {detailVaccin.animalName}
                      </span>
                      {detailVaccin.speciesName !== "—" && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg font-medium">
                          <Activity size={11} /> {detailVaccin.speciesName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                        <Calendar size={11} /> Date d'administration
                      </p>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{fmt(detailVaccin.dateGiven)}</p>
                    </div>
                    {detailVaccin.nextDue && (
                      <div>
                        <p className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                          <Bell size={11} /> Prochain rappel
                        </p>
                        <p className="text-sm text-jaune bg-blue-50 rounded-xl p-3">{fmt(detailVaccin.nextDue)}</p>
                      </div>
                    )}
                    {detailVaccin.adminName !== "—" && (
                      <div>
                        <p className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                          <User size={11} /> Administré par
                        </p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{detailVaccin.adminName}</p>
                      </div>
                    )}
                  </div>
                  <div className="px-6 pb-6 flex gap-3">
                    <button
                      onClick={() => { setEditingVaccin(detailVaccin); setDetailVaccin(null); setShowForm(true); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-jaune/10 text-jaune rounded-2xl font-bold text-sm transition-colors"
                    >
                      <Pencil size={14} /> Modifier
                    </button>
                    <button
                      onClick={() => { setConfirmDeleteId(detailVaccin.id); setDetailVaccin(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-sm transition-colors"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ══ MODAL SUPPRESSION ══ */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setConfirmDeleteId(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <div className="inline-flex p-3.5 bg-red-100 text-red-600 rounded-2xl mb-4"><Trash2 size={22} /></div>
            <h3 className="text-base font-black text-gray-900 mb-1">Supprimer ce vaccin ?</h3>
            <p className="text-sm text-gray-500 mb-5">Cette action est définitive et ne peut pas être annulée.</p>
            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                disabled={isDeleting}
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-200 transition-colors disabled:opacity-60"
              >
                {isDeleting
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Suppression...</>
                  : <><Trash2 size={14} /> Supprimer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL FORMULAIRE ══ */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowForm(false); setEditingVaccin(null); }} />
          <div className="relative w-full max-w-lg">
            <VaccinationForm
              farmId={farmId}
              initialData={editingVaccin ?? undefined}
              onSuccess={() => { setShowForm(false); setEditingVaccin(null); loadVaccinations(); }}
              onCancel={() => { setShowForm(false); setEditingVaccin(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationDashboard;