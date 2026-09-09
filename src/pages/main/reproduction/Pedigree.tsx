    /* eslint-disable @typescript-eslint/no-explicit-any */
// pages/Reproduction/GenealogyTreePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { selectCurrentFarm } from "../../../store/farm/slice";
import { getAllAnimals } from "../../../store/animal/action";
import {
  fetchPedigreeById,
  createPedigree,
  updatePedigree,
  deletePedigree,
  checkConsanguinity,
} from "../../../store/Reproduction/actPedigree";
import {
  clearCurrentPedigree,
  clearConsanguinity,
} from "../../../store/Reproduction/slicepedigree";
import {
  Search, X, Loader2, GitBranch, Users, ShieldCheck, ShieldAlert,
  Trash2, Pencil, Plus, ChevronDown,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { CreatePedigreePayload, UpdatePedigreePayload } from "../../../models/pedigree";

// ── Petit sélecteur d'animal réutilisable (recherche nom / ID) ─────────────
const AnimalPicker: React.FC<{
  animals: any[];
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
}> = ({ animals, value, onChange, placeholder = "Nom ou ID..." }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = animals.find((a) => a.id === value);

  const suggestions = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return animals
      .filter((a) => a.name?.toLowerCase().includes(q) || String(a.id) === q)
      .slice(0, 8);
  }, [animals, query]);

  return (
    <div className="relative">
      {selected ? (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="text-sm font-semibold text-gray-800">
            {selected.name} <span className="text-gray-400 font-normal">#{selected.id}</span>
          </span>
          <button onClick={() => { onChange(null); setQuery(""); }} className="text-gray-400 hover:text-red-500">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-vert focus:ring-2 focus:ring-vert/20 transition"
            />
          </div>
          {open && suggestions.length > 0 && (
            <ul className="absolute z-30 mt-1 w-full max-h-52 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {suggestions.map((a) => (
                <li
                  key={a.id}
                  onClick={() => { onChange(a.id); setOpen(false); setQuery(""); }}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-green-50 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-800">{a.name}</span>
                  <span className="text-xs text-gray-400">#{a.id}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

// ── Case de l'arbre (une "boîte" animal) ────────────────────────────────
const TreeNode: React.FC<{
  animal?: { id: number; name: string } | null;
  label: string;
  onOpen?: (id: number) => void;
  size?: "lg" | "md" | "sm";
}> = ({ animal, label, onOpen, size = "md" }) => {
  const sizeClasses = {
    lg: "w-40 py-3",
    md: "w-32 py-2.5",
    sm: "w-28 py-2",
  }[size];

  if (!animal) {
    return (
      <div className={`${sizeClasses} rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300`}>
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        <span className="text-xs">Inconnu</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => onOpen?.(animal.id)}
      className={`${sizeClasses} rounded-xl border border-gray-200 bg-white hover:border-vert hover:shadow-md transition-all flex flex-col items-center justify-center text-center px-2`}
    >
      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-sm font-bold text-gray-900 truncate max-w-full">{animal.name}</span>
      <span className="text-[10px] text-gray-400">#{animal.id}</span>
    </button>
  );
};

// ── Modal création / édition ────────────────────────────────────────────
const PedigreeFormModal: React.FC<{
  animalId: number;
  animals: any[];
  initial?: any;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ animalId, animals, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [motherId, setMotherId] = useState<number | null>(initial?.motherId ?? null);
  const [fatherId, setFatherId] = useState<number | null>(initial?.fatherId ?? null);
  const [mgm, setMgm] = useState<number | null>(initial?.maternalGrandmotherId ?? null);
  const [mgf, setMgf] = useState<number | null>(initial?.maternalGrandfatherId ?? null);
  const [pgm, setPgm] = useState<number | null>(initial?.paternalGrandmotherId ?? null);
  const [pgf, setPgf] = useState<number | null>(initial?.paternalGrandfatherId ?? null);
  const [verified, setVerified] = useState<boolean>(initial?.verified ?? false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (initial) {
        const data: UpdatePedigreePayload = {
          motherId, fatherId,
          maternalGrandmotherId: mgm, maternalGrandfatherId: mgf,
          paternalGrandmotherId: pgm, paternalGrandfatherId: pgf,
          verified,
        };
        await dispatch(updatePedigree({ animalId, data })).unwrap();
        toast.success("Pedigree mis à jour");
      } else {
        const data: CreatePedigreePayload = {
          animalId, motherId, fatherId,
          maternalGrandmotherId: mgm, maternalGrandfatherId: mgf,
          paternalGrandmotherId: pgm, paternalGrandfatherId: pgf,
          verified,
        };
        await dispatch(createPedigree(data)).unwrap();
        toast.success("Pedigree créé");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const otherAnimals = animals.filter((a) => a.id !== animalId);

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">
              {initial ? "Modifier le pedigree" : "Créer le pedigree"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Mère</label>
              <AnimalPicker animals={otherAnimals} value={motherId} onChange={setMotherId} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Père</label>
              <AnimalPicker animals={otherAnimals} value={fatherId} onChange={setFatherId} />
            </div>
          </div>

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2 border-t border-gray-100">
            Grands-parents (optionnel)
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Grand-mère maternelle</label>
              <AnimalPicker animals={otherAnimals} value={mgm} onChange={setMgm} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Grand-père maternel</label>
              <AnimalPicker animals={otherAnimals} value={mgf} onChange={setMgf} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Grand-mère paternelle</label>
              <AnimalPicker animals={otherAnimals} value={pgm} onChange={setPgm} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Grand-père paternel</label>
              <AnimalPicker animals={otherAnimals} value={pgf} onChange={setPgf} />
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2 cursor-pointer">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)}
              className="w-4 h-4 accent-vert" />
            <span className="text-sm text-gray-600">Généalogie vérifiée</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition">
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {initial ? "Enregistrer" : "Créer le pedigree"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────
const GenealogyTreePage = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const farmId = currentFarm?.id;

  const animalsRaw = useAppSelector((s: any) => s.animal?.animalist?.entities);
  const animals = Array.isArray(animalsRaw) ? animalsRaw : [];

  const pedigree = useAppSelector((s: any) => s.pedigree.currentPedigree);
  const isLoading = useAppSelector((s: any) => s.pedigree.loading);
  const consanguinity = useAppSelector((s: any) => s.pedigree.consanguinity);

  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConsang, setShowConsang] = useState(false);
  const [compareAnimalId, setCompareAnimalId] = useState<number | null>(null);

  useEffect(() => {
    if (farmId) dispatch(getAllAnimals({ farmId, limit: 200, page: 1 }));
  }, [dispatch, farmId]);

  useEffect(() => {
    dispatch(clearCurrentPedigree());
    if (selectedAnimalId) dispatch(fetchPedigreeById(selectedAnimalId));
  }, [dispatch, selectedAnimalId]);

  useEffect(() => {
    dispatch(clearConsanguinity());
  }, [dispatch, selectedAnimalId]);

  const selectedAnimal = animals.find((a: any) => a.id === selectedAnimalId);

  const handleDelete = async () => {
    if (!selectedAnimalId) return;
    try {
      await dispatch(deletePedigree(selectedAnimalId)).unwrap();
      toast.success("Pedigree supprimé");
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleCheckConsanguinity = async () => {
    if (!selectedAnimalId || !compareAnimalId) return;
    try {
      await dispatch(checkConsanguinity({ animal1Id: selectedAnimalId, animal2Id: compareAnimalId })).unwrap();
    } catch {
      toast.error("Erreur lors de l'analyse");
    }
  };

  const gen4Ids: number[] = Array.isArray(pedigree?.generation4Ids) ? pedigree.generation4Ids : [];

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium" />

      <div className="min-h-screen bg-[#F8FAFC] pt-20">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">

          {/* En-tête + recherche */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl text-white shadow-lg shadow-purple-100">
                <GitBranch size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Arbre Généalogique</h1>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Recherche un animal par nom ou ID pour voir sa lignée
                </p>
              </div>
            </div>
            <AnimalPicker animals={animals} value={selectedAnimalId} onChange={setSelectedAnimalId} placeholder="Rechercher un animal..." />
          </div>

          {!selectedAnimalId ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <Users size={32} className="text-gray-200" />
              <p className="text-sm font-semibold text-gray-500">Sélectionne un animal pour afficher son pedigree</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-vert" size={36} />
            </div>
          ) : !pedigree ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <GitBranch size={32} className="text-gray-200" />
              <p className="text-sm font-semibold text-gray-500">
                Aucun pedigree enregistré pour {selectedAnimal?.name ?? `#${selectedAnimalId}`}
              </p>
              <button onClick={() => setShowForm(true)}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-vert/10 text-vert rounded-xl text-sm font-semibold hover:bg-vert/20 transition">
                <Plus size={16} /> Créer son pedigree
              </button>
            </div>
          ) : (
            <>
              {/* Carte info + actions */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {pedigree.verified ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                      <ShieldCheck size={14} /> Vérifié
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold">
                      <ShieldAlert size={14} /> Non vérifié
                    </span>
                  )}
                  {pedigree.completeness != null && (
                    <span className="text-xs text-gray-400">
                      Complétude : <span className="font-bold text-gray-600">{pedigree.completeness}%</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowConsang((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                    <ShieldAlert size={14} /> Consanguinité
                  </button>
                  <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-vert bg-vert/10 rounded-lg hover:bg-vert/20 transition">
                    <Pencil size={14} /> Modifier
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Panneau consanguinité */}
              {showConsang && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comparer avec un autre animal</p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <AnimalPicker animals={animals.filter((a: any) => a.id !== selectedAnimalId)} value={compareAnimalId} onChange={setCompareAnimalId} />
                    </div>
                    <button onClick={handleCheckConsanguinity} disabled={!compareAnimalId}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-indigo-700 transition">
                      Analyser
                    </button>
                  </div>
                  {consanguinity && (
                    <div className={`rounded-xl p-3 text-sm ${consanguinity.isConsanguine ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                      <p className="font-bold">
                        {consanguinity.isConsanguine ? "Lien de consanguinité détecté" : "Aucun lien de consanguinité détecté"}
                      </p>
                      {consanguinity.isConsanguine && (
                        <p className="text-xs mt-1">Niveau : {consanguinity.consanguinityLevel} · {consanguinity.recommendation}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Arbre */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 overflow-x-auto">
                <div className="flex flex-col items-center gap-6 min-w-[560px]">

                  {/* Génération grands-parents */}
                  <div className="flex items-center gap-3">
                    <TreeNode animal={pedigree.maternalGrandmother} label="GM maternelle" size="sm" onOpen={setSelectedAnimalId} />
                    <TreeNode animal={pedigree.maternalGrandfather} label="GP maternel" size="sm" onOpen={setSelectedAnimalId} />
                    <div className="w-10" />
                    <TreeNode animal={pedigree.paternalGrandmother} label="GM paternelle" size="sm" onOpen={setSelectedAnimalId} />
                    <TreeNode animal={pedigree.paternalGrandfather} label="GP paternel" size="sm" onOpen={setSelectedAnimalId} />
                  </div>

                  <div className="w-px h-4 bg-gray-200" />

                  {/* Génération parents */}
                  <div className="flex items-center gap-6">
                    <TreeNode animal={pedigree.mother} label="Mère" size="md" onOpen={setSelectedAnimalId} />
                    <TreeNode animal={pedigree.father} label="Père" size="md" onOpen={setSelectedAnimalId} />
                  </div>

                  <div className="w-px h-4 bg-gray-200" />

                  {/* Animal sujet */}
                  <div className="rounded-2xl border-2 border-vert bg-vert/5 px-6 py-4 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-vert">Sujet</span>
                    <span className="text-base font-black text-gray-900">
                      {pedigree.animal?.name ?? selectedAnimal?.name}
                    </span>
                    <span className="text-xs text-gray-400">#{pedigree.animalId}</span>
                  </div>
                </div>
              </div>

              {/* 4e génération (IDs bruts uniquement) */}
              {gen4Ids.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ChevronDown size={13} /> Arrière-grands-parents (4e génération)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {gen4Ids.map((id) => (
                      <button
                        key={id}
                        onClick={() => setSelectedAnimalId(id)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg text-xs font-semibold text-gray-600 hover:text-purple-600 transition"
                      >
                        Voir #{id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showForm && selectedAnimalId && (
        <PedigreeFormModal
          animalId={selectedAnimalId}
          animals={animals}
          initial={pedigree}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); dispatch(fetchPedigreeById(selectedAnimalId)); }}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Supprimer ce pedigree ?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
              Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                Annuler
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenealogyTreePage;