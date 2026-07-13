/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { Farm } from "../../../models/farm";
import {
  Stethoscope, Plus, CheckCircle2, AlertCircle,
  Search, Trash2, Pencil, X, ChevronDown, ChevronUp,
  Calendar, Pill, ClipboardList, User, Clock, FlaskConical,
  HeartPulse, Activity,
} from "lucide-react";
import { fetchConsultations, deleteConsultation } from "../../../store/health/action";
import ConsultationForm from "../../../components/Modal/ConsultationForm";
import { selectCurrentFarm, setCurrentFarm } from "../../../store/farm/slice";
import { getUserFarms } from "../../../store/farm/action";

interface ConsultationDashboardProps {
  animalId?: number;
}

const ConsultationDashboard: React.FC<ConsultationDashboardProps> = ({ animalId }) => {
  const dispatch = useAppDispatch();
  const { consultations, loading } = useAppSelector((state) => state.health);
  const currentUser = useAppSelector((state) => state.authentification.auth.user);
  const currentFarm = useAppSelector(selectCurrentFarm);
  const farmId = currentFarm?.id;

  const [showForm, setShowForm] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<any | null>(null);
  const [detailConsultation, setDetailConsultation] = useState<any | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "completed" | "followup">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingFarm, setIsLoadingFarm] = useState(false);

  // ─── Hydratation ferme ────────────────────────────────────────────────────
  useEffect(() => {
    const hydrateFarm = async () => {
      if (!currentUser?.id || currentFarm?.id) return;
      setIsLoadingFarm(true);
      try {
        const result = await dispatch(getUserFarms()).unwrap();
        const farms = result?.data || result;
        if (Array.isArray(farms) && farms.length > 0) {
          const savedFarmId = localStorage.getItem("last_farm_id");
          const farmToUse = savedFarmId
            ? (farms.find((f: Farm) => f.id === parseInt(savedFarmId, 10)) ?? farms[0])
            : farms[0];
          if (farmToUse) dispatch(setCurrentFarm(farmToUse));
        }
      } catch (error) {
        console.error("[Dashboard] Erreur chargement ferme:", error);
      } finally {
        setIsLoadingFarm(false);
      }
    };
    hydrateFarm();
  }, [currentUser?.id, currentFarm?.id, dispatch]);

  // ─── Chargement consultations ─────────────────────────────────────────────
  useEffect(() => {
    const id = Number(farmId);
    if (farmId && !isNaN(id) && id > 0) dispatch(fetchConsultations(id));
  }, [dispatch, farmId]);

  const refreshList = useCallback(() => {
    if (farmId) dispatch(fetchConsultations(Number(farmId)));
  }, [dispatch, farmId]);

  // ─── Statut ───────────────────────────────────────────────────────────────
  const getStatusInfo = (c: any) => {
    const isFollowup = c.treatment && !c.completedAt;
    return {
      status: isFollowup ? "followup" : "completed",
      label: isFollowup ? "À suivre" : "Terminé",
      isFollowup,
      icon: isFollowup ? AlertCircle : CheckCircle2,
    };
  };

  // ─── Suppression ──────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await dispatch(deleteConsultation({ id })).unwrap();
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Erreur suppression", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Filtrage + normalisation ─────────────────────────────────────────────
  const consultationsList = Array.isArray(consultations) ? consultations : [];

  // Normalise les données imbriquées de l'API
  const normalized = consultationsList
    .filter((c: any) => (animalId ? c.animalId === animalId : true))
    .map((c: any) => ({
      ...c,
      animalName: c.animalName ?? c.animal?.name,
      speciesName: c.animal?.species?.name,
      vetName: c.veterinarian?.name,
    }));

  const filteredConsultations = normalized
    .filter((c: any) => {
      const si = getStatusInfo(c);
      if (selectedStatus !== "all" && si.status !== selectedStatus) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          c.symptoms?.toLowerCase().includes(s) ||
          c.diagnosis?.toLowerCase().includes(s) ||
          c.animalName?.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .sort((a: any, b: any) => new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime());

  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };
  const formatTime = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const totalCount     = normalized.length;
  const completedCount = normalized.filter((c: any) => !getStatusInfo(c).isFollowup).length;
  const followupCount  = normalized.filter((c: any) => getStatusInfo(c).isFollowup).length;

  // ─── Loading / Empty states ───────────────────────────────────────────────
  if (isLoadingFarm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-500">
        <div className="w-11 h-11 rounded-full border-[3px] border-gray-200 border-t-green-500 animate-spin" />
        <p className="font-semibold">Récupération de votre ferme...</p>
      </div>
    );
  }

  if (!farmId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
        <div className="p-5 bg-orange-50 rounded-2xl text-jaune">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-black text-gray-800">Aucune ferme trouvée</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Impossible de charger les consultations sans ferme sélectionnée.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4 pt-20   bg-gray-50">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-100 rounded-xl text-green-700">
            <Stethoscope size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Consultations Vétérinaires</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {currentFarm?.name ? `${currentFarm.name} • ` : ""}Suivi des visites et traitements
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditingConsultation(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-md shadow-green-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={16} /> Nouvelle consultation
        </button>
      </div>

      {/* ── Stats ── */}
      {!loading && normalized.length > 0 && (
        <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2  max-md:grid-cols-1">
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm hover:-translate-y-0.5 transition-transform">
            <p className="text-2xl font-black text-gray-700">{totalCount}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">Total</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm hover:-translate-y-0.5 transition-transform">
            <p className="text-2xl font-black text-green-600">{completedCount}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">Terminées</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm hover:-translate-y-0.5 transition-transform">
            <p className="text-2xl font-black text-jaune">{followupCount}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">À suivre</p>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100 transition-all"
            placeholder="Rechercher symptômes, diagnostic, animal…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(["all", "completed", "followup"] as const).map((s) => {
            const labels   = { all: "Tous", completed: "Terminés", followup: "À suivre" };
            const active   = {
              all:       "bg-green-600 text-white shadow-md shadow-green-200",
              completed: "bg-blue-600 text-white shadow-md shadow-blue-200",
              followup:  "bg-jaune text-white shadow-md shadow-orange-200",
            };
            return (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
                  selectedStatus === s ? active[s] : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
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
      ) : filteredConsultations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="p-5 bg-gray-100 rounded-2xl text-gray-300">
            <Stethoscope size={28} />
          </div>
          <p className="text-sm font-black text-gray-500">Aucune consultation trouvée</p>
          <p className="text-xs text-gray-400">
            {searchTerm || selectedStatus !== "all"
              ? "Essayez de modifier vos filtres"
              : "Commencez par ajouter une nouvelle consultation"}
          </p>
          {!searchTerm && selectedStatus === "all" && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-1 flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm rounded-xl font-bold shadow-md shadow-green-200"
            >
              <Plus size={15} /> Ajouter une consultation
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredConsultations.map((c: any) => {
            const si = getStatusInfo(c);
            const StatusIcon = si.icon;
            const isExpanded = expandedId === c.id;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                  onClick={() => setDetailConsultation(c)}
                >
                  {/* Badge statut */}
                  <div className={`p-2 rounded-xl shrink-0 ${
                    si.isFollowup ? "bg-orange-50 text-jaune" : "bg-green-50 text-green-600"
                  }`}>
                    <StatusIcon size={18} />
                  </div>

              
                  <div className="flex flex-col flex-1 max-w-[50rem]">
                    <div className=" flex items-center  gap-2 flex-wrap mb-0.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        si.isFollowup ? "bg-orange-50 text-jaune" : "bg-green-50 text-green-600"
                      }`}>
                        {si.label}
                      </span>
                      {c.animalName && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 truncate">
                          <User size={10} /> {c.animalName}
                          {c.speciesName && <span className="text-gray-400 font-normal">· {c.speciesName}</span>}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {c.symptoms || "Aucun symptôme renseigné"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400 font-medium">
                      <Calendar size={10} />
                      {formatDate(c.checkDate)}
                      {c.checkDate && (
                        <><span>·</span><Clock size={10} />{formatTime(c.checkDate)}</>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setEditingConsultation(c); setShowForm(true); }}
                      className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(c.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-jaune hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Détails dépliants */}
                {isExpanded && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3 flex flex-col gap-3">
                    {c.diagnosis && (
                      <div>
                        <p className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                          <ClipboardList size={10} /> Diagnostic
                        </p>
                        <p className="text-sm text-gray-700 bg-green-50 rounded-xl p-3 leading-relaxed">{c.diagnosis}</p>
                      </div>
                    )}
                    {c.treatment && (
                      <div>
                        <p className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                          <Pill size={10} /> Traitement
                        </p>
                        <p className="text-sm text-gray-700 bg-blue-50 rounded-xl p-3 leading-relaxed">{c.treatment}</p>
                      </div>
                    )}
                    {!c.diagnosis && !c.treatment && (
                      <p className="text-xs text-gray-400">Aucun détail disponible.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══ MODAL DÉTAIL ══ */}
      {detailConsultation && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailConsultation(null)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setDetailConsultation(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  getStatusInfo(detailConsultation).isFollowup
                    ? "bg-orange-50 text-jaune"
                    : "bg-green-50 text-green-600"
                }`}>
                  {getStatusInfo(detailConsultation).label}
                </span>
                {detailConsultation.animalName && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                    <User size={11} /> {detailConsultation.animalName}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-gray-900 pr-8">
                {detailConsultation.symptoms || "Consultation vétérinaire"}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400 font-medium">
                <Calendar size={12} /> {formatDate(detailConsultation.checkDate)}
                {detailConsultation.checkDate && (
                  <><span>·</span><Clock size={12} /> {formatTime(detailConsultation.checkDate)}</>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              {detailConsultation.symptoms && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                    <HeartPulse size={11} /> Symptômes
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{detailConsultation.symptoms}</p>
                </div>
              )}
              {detailConsultation.diagnosis && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                    <FlaskConical size={11} /> Diagnostic
                  </p>
                  <p className="text-sm text-gray-700 bg-green-50 rounded-xl p-3 leading-relaxed">{detailConsultation.diagnosis}</p>
                </div>
              )}
              {detailConsultation.treatment && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                    <Pill size={11} /> Traitement
                  </p>
                  <p className="text-sm text-gray-700 bg-blue-50 rounded-xl p-3 leading-relaxed">{detailConsultation.treatment}</p>
                </div>
              )}
              {detailConsultation.notes && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                    <Activity size={11} /> Notes
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{detailConsultation.notes}</p>
                </div>
              )}
              {!detailConsultation.diagnosis && !detailConsultation.treatment && !detailConsultation.notes && (
                <p className="text-sm text-gray-400 text-center py-3">Aucun détail supplémentaire disponible.</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => { setEditingConsultation(detailConsultation); setDetailConsultation(null); setShowForm(true); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl font-bold text-sm transition-colors"
              >
                <Pencil size={15} /> Modifier
              </button>
              <button
                onClick={() => { setConfirmDeleteId(detailConsultation.id); setDetailConsultation(null); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-sm transition-colors"
              >
                <Trash2 size={15} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL SUPPRESSION ══ */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setConfirmDeleteId(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <div className="inline-flex p-3.5 bg-red-100 text-red-600 rounded-2xl mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">Supprimer la consultation ?</h3>
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
                {isDeleting ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Suppression...</>
                ) : (
                  <><Trash2 size={14} /> Supprimer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL FORMULAIRE ══ */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowForm(false); setEditingConsultation(null); }} />
          <div className="relative w-full max-w-lg">
            <ConsultationForm
              farmId={farmId}
              initialAnimalId={animalId}
              initialData={editingConsultation ?? undefined}
              onSuccess={() => { setShowForm(false); setEditingConsultation(null); refreshList(); }}
              onCancel={() => { setShowForm(false); setEditingConsultation(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationDashboard;