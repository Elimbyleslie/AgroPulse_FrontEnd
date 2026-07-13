/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { useEffect, useState } from 'react';
import { getAnimalById, assignAnimal, unassignAnimal } from '../../../store/animal/action';
import { fetchAnimalHistory } from '../../../store/AnimalHistory/action'; // Import de l'action historique
import { getAllLots } from '../../../store/lot/action';
import { getAllHerds } from '../../../store/herd/action';
import { getAllPens } from '../../../store/pen/action';
import { 
  ChevronLeft, 
  Tag, 
  Mars, 
  Venus, 
  Calendar, 
  TrendingUp, 
  Printer, 
  Download,
  Layers,
  Users as UsersIcon,
  Grid3x3,
  AlertCircle,
  X,
  AlertTriangle,
  History, // Icône pour l'onglet
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { env } from '../../../constants/env';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import SelectInput from '../../../components/UI/SelectInput';
import Button from '../../../components/UI/Button';
import AnimalHistory from './animalHistory'; 

type AssignType = 'lot' | 'herd' | 'pen'; 
type TabType = 'general' | 'history'; // Types d'onglets

const AnimalDetail = () => {
  const { id } = useParams(); 
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const animal = useAppSelector((state) => state.animal.selectedAnimal);
  const { entities: lots, isLoading: loadingLots } = useAppSelector((state) => state.lot);
  const { entities: herds, isLoading: loadingHerds } = useAppSelector((state) => state.herd);
  const { entities: pens, isLoading: loadingPens } = useAppSelector((state) => state.pen);

  // States pour les onglets et modals
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
  const [assignType, setAssignType] = useState<AssignType>('lot');
  const [selectedId, setSelectedId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getAnimalById(Number(id))); 
    }
  }, [id, dispatch]);

  // Charger l'historique quand on bascule sur l'onglet
  useEffect(() => {
    if (id && activeTab === 'history') {
      dispatch(fetchAnimalHistory(id));
    }
  }, [id, activeTab, dispatch]);

  // Charger les options d'assignation
  useEffect(() => {
    if (animal?.entities?.farmId) {
      dispatch(getAllLots({ farmId: animal.entities.farmId, limit: 10, search: "" }));
      dispatch(getAllHerds({ farmId: animal.entities.farmId, limit: 100 }));
      dispatch(getAllPens({ farmId: animal.entities.farmId, limit: 100 }));
    }
  }, [animal?.entities?.farmId, dispatch]);

  // Préremplir l'assignation
  useEffect(() => {
    if (animal?.entities) {
      const data = animal.entities;
      if (data.lotId) { setAssignType('lot'); setSelectedId(data.lotId.toString()); }
      else if (data.herdId) { setAssignType('herd'); setSelectedId(data.herdId.toString()); }
      else if (data.penId) { setAssignType('pen'); setSelectedId(data.penId.toString()); }
    }
  }, [animal?.entities]);

  const downloadQRCode = () => {
    const svg = document.getElementById("animal-qr") as HTMLElement & SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_${animal?.entities?.name || 'animal'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  const handleAssign = async () => {
    if (!selectedId || !animal?.entities) {
      toast.error('Veuillez sélectionner une option');
      return;
    }
    setIsSubmitting(true);
    const data: { lotId?: number; herdId?: number; penId?: number } = {};
    if (assignType === 'lot') data.lotId = Number(selectedId);
    if (assignType === 'herd') data.herdId = Number(selectedId);
    if (assignType === 'pen') data.penId = Number(selectedId);
    try {
      await dispatch(assignAnimal({ id: animal.entities.id, data })).unwrap();
      toast.success('Animal assigné avec succès !');
      dispatch(getAnimalById(animal.entities.id));
      setIsAssignModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de l\'assignation');
    } finally { setIsSubmitting(false); }
  };

  const handleUnassign = async () => {
    if (!animal?.entities) return;
    setIsSubmitting(true);
    try {
      await dispatch(unassignAnimal(animal.entities.id)).unwrap();
      toast.success('Animal retiré avec succès !');
      dispatch(getAnimalById(animal.entities.id));
      setIsUnassignModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors du retrait');
    } finally { setIsSubmitting(false); }
  };

  const getCurrentAssignment = () => {
    if (!animal?.entities) return 'Aucune assignation';
    const d = animal.entities;
    if (d.lotId) return `Lot #${d.lotId}`;
    if (d.herdId) return `Troupeau #${d.herdId}`;
    if (d.penId) return `Enclos #${d.penId}`;
    return 'Aucune assignation';
  };

  const isAssigned = animal?.entities && !!(animal.entities.lotId || animal.entities.herdId || animal.entities.penId);

  if (!animal || !animal.entities) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  const data = animal.entities;

  const lotOptions = lots.map((lot:any) => ({ value: lot.id.toString(), label: `${lot.name} (${lot.quantity} animaux)` }));
  const herdOptions = herds.map((herd) => ({ value: herd.id!.toString(), label: herd.name }));
  const penOptions = pens.map((pen) => ({ value: pen.id.toString(), label: `${pen.name} (Capacité: ${pen.capacity || 'N/A'})` }));

  const assignmentTypes = [
    { id: 'lot' as AssignType, label: 'Lot', icon: Layers, color: 'bg-green-50 text-green-600' },
    { id: 'herd' as AssignType, label: 'Troupeau', icon: UsersIcon, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'pen' as AssignType, label: 'Enclos', icon: Grid3x3, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen pt-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition print:hidden"
      >
        <ChevronLeft size={20} /> Retour à la liste
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNE GAUCHE */}
        <div className="space-y-6 print:hidden">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-green-50 mb-4 shadow-inner">
              <img 
                src={data.photo ? `${env.noreact}${data.photo}` : "/placeholder-animal.png"} 
                alt={data.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">{data.name}</h1>
            <span className="mt-2 px-4 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
              {data.status || 'Actif'}
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Assignation</h3>
            <div className="mb-4"> 
              {data.lotId && <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-3 rounded-2xl text-sm font-bold w-full justify-center"><Layers size={16} /><span className='capitalize '>Lot {data.lot?.name}</span></div>}
              {data.herdId && <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-3 rounded-2xl text-sm font-bold w-full justify-center"><UsersIcon size={16} /><span className='capitalize '>Troupeau {data.herd?.name}</span></div>}
              {data.penId && <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-3 rounded-2xl text-sm font-bold w-full justify-center"><Grid3x3 size={16} /><span className='capitalize '>Enclos {data.pen?.name}</span></div>}
              {!isAssigned && <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-3 rounded-2xl text-sm font-bold w-full justify-center tracking-tight">Non assigné</div>}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAssignModalOpen(true)} className="flex-1 bg-vert text-white hover:bg-green-700 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition font-bold text-sm shadow-md shadow-green-100">
                {isAssigned ? 'Modifier' : 'Assigner'}
              </Button>
              {isAssigned && (
                <Button onClick={() => setIsUnassignModalOpen(true)} className=" bg-red-50 text-red-600 hover:bg-red-100 px-4 py-3 rounded-2xl flex items-center gap-2 transition font-bold text-sm">
                Retirer 
                
                </Button>
              )}
            </div>
          </div>

          <div id="printable-badge" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="p-4 bg-white border-2 border-gray-50 rounded-2xl">
              <QRCodeSVG id="animal-qr" value={data.id.toString()} size={150} level={"H"} includeMargin={true} />
            </div>
            <div className="text-center mt-4">
              <p className="text-lg font-black text-gray-900">{data.name}</p>
              <p className="text-[10px] text-gray-400 font-mono">ID: #{data.id}</p>
            </div>
            <div className="flex gap-2 mt-6 w-full print:hidden">
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-100 transition font-bold text-xs"><Printer size={16} /> Imprimer</button>
              <button onClick={downloadQRCode} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition shadow-sm"><Download size={18} /></button>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE AVEC ONGLETS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* NAVIGATION PAR ONGLETS */}
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-1 print:hidden">
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-vert text-white shadow-lg shadow-green-100' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Info size={18} /> Détails Généraux
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-vert text-white shadow-lg shadow-green-100' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <History size={18} /> Historique de Vie
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'general' ? (
              <motion.div 
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Tag /></div>
                  <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Espèce / Race</p><p className="text-gray-900 font-black">{data.species?.name || '—'} / {data.breed?.name || 'Non spécifiée'}</p></div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${data.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>{data.gender === 'male' ? <Mars /> : <Venus />}</div>
                  <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Genre</p><p className="text-gray-900 font-black">{data.gender === 'male' ? 'Mâle' : 'Femelle'}</p></div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><Calendar /></div>
                  <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Date de naissance</p><p className="text-gray-900 font-black">{data.birthDate ? new Date(data.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p></div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-green-50 p-4 rounded-2xl text-green-600"><TrendingUp /></div>
                  <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Dernier poids</p><p className="text-gray-900 font-black">{data.weight} kg</p></div>
                </div>

                <div className="md:col-span-2 bg-white p-12 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                   <div className="bg-gray-50 p-6 rounded-full mb-4"><AlertCircle size={40} /></div>
                   <p className="font-bold text-gray-400">Section Santé complète à venir</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AnimalHistory />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL D'ASSIGNATION */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden">
              <div className="p-8 border-b bg-vert text-white">
                <div className="flex justify-between items-center">
                  <div><h3 className="text-2xl font-black">Assigner l'animal</h3><p className="opacity-80 font-bold">{data.name}</p></div>
                  <button onClick={() => setIsAssignModalOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition"><X size={28} /></button>
                </div>
              </div>
              <div className="p-8 space-y-8">
                {isAssigned && <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-sm font-bold text-blue-900"><AlertCircle size={20} /> Assigné à : {getCurrentAssignment()}</div>}
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">Type d'assignation</label>
                  <div className="grid grid-cols-3 gap-4">
                    {assignmentTypes.map((type) => {
                      const Icon = type.icon;
                      const isActive = assignType === type.id;
                      return (
                        <button key={type.id} onClick={() => { setAssignType(type.id); setSelectedId(''); }} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isActive ? 'border-vert bg-green-50 shadow-inner' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                          <div className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center shadow-sm`}><Icon size={24} /></div>
                          <p className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-vert' : 'text-gray-500'}`}>{type.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Choisir {assignType === 'lot' ? 'le lot' : assignType === 'herd' ? 'le troupeau' : 'l\'enclos'}</label>
                  {assignType === 'lot' && <SelectInput value={selectedId} onChange={(v) => setSelectedId(String(v))} options={lotOptions} loading={loadingLots} placeholder="Sélectionner..." />}
                  {assignType === 'herd' && <SelectInput value={selectedId} onChange={(v) => setSelectedId(String(v))} options={herdOptions} loading={loadingHerds} placeholder="Sélectionner..." />}
                  {assignType === 'pen' && <SelectInput value={selectedId} onChange={(v) => setSelectedId(String(v))} options={penOptions} loading={loadingPens} placeholder="Sélectionner..." />}
                </div>
              </div>
              <div className="p-8 border-t bg-gray-50 flex gap-4">
                <Button onClick={() => setIsAssignModalOpen(false)} className="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-black py-4 rounded-2xl">Annuler</Button>
                <Button onClick={handleAssign} disabled={!selectedId || isSubmitting} className="flex-1 bg-vert text-white font-black py-4 rounded-2xl shadow-lg shadow-green-200">Assigner</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE RETRAIT */}
      <AnimatePresence>
        {isUnassignModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden text-center">
              <div className="p-10">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={40} /></div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Retirer l'animal ?</h3>
                <p className="text-gray-500 font-medium">L'animal <span className="text-gray-900 font-bold">{data.name}</span> ne sera plus associé à <span className="font-bold">{getCurrentAssignment()}</span>.</p>
              </div>
              <div className="p-8 border-t bg-gray-50 flex gap-4">
                <Button onClick={() => setIsUnassignModalOpen(false)} className="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-black py-4 rounded-2xl">Annuler</Button>
                <Button onClick={handleUnassign} disabled={isSubmitting} className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-200">Confirmer</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          #printable-badge {
            position: absolute; top: 0; left: 50%; transform: translateX(-50%);
            border: 2px solid #eee !important; box-shadow: none !important;
            visibility: visible !important; width: 350px !important;
          }
          div:not(#printable-badge) { visibility: hidden; }
          #printable-badge, #printable-badge * { visibility: visible; }
        }
      `}</style>
    </div>
  );
};

export default AnimalDetail;