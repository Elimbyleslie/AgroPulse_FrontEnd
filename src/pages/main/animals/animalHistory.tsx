// import React, { useEffect, useState, useMemo } from "react";
// import { useParams } from "react-router-dom";
// import { useAppDispatch, useAppSelector } from "../../../hooks/store";
// import { fetchAnimalHealthRecords ,getAnimalHealthRecordById ,deleteAnimalHealthRecord } from "../../../store/AnimalHistory/action";
// import { resetAnimalHealthRecordState } from "../../../store/AnimalHistory/slice";
// import Button  from '../../../components/UI/Button';
// import { 
//   Syringe, Scale, Stethoscope, Heart, 
//   Truck, Utensils, Skull, ClipboardList, Calendar, Filter
// } from "lucide-react";


//  // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const EVENT_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
//   VACCINATION: { icon: Syringe, color: "text-blue-600 bg-blue-100 border-blue-200", label: "Vaccination" },
//   WEIGHT: { icon: Scale, color: "text-orange-600 bg-orange-100 border-orange-200", label: "Pesée" },
//   HEALTH: { icon: Stethoscope, color: "text-red-600 bg-red-100 border-red-200", label: "Santé" },
//   REPRODUCTION: { icon: Heart, color: "text-pink-600 bg-pink-100 border-pink-200", label: "Reproduction" },
//   MOVEMENT: { icon: Truck, color: "text-purple-600 bg-purple-100 border-purple-200", label: "Mouvement" },
//   FEEDING: { icon: Utensils, color: "text-green-600 bg-green-100 border-green-200", label: "Alimentation" },
//   DEATH: { icon: Skull, color: "text-gray-700 bg-gray-200 border-gray-300", label: "Décès" },
// };

const AnimalHistory: React.FC = () => {
  // const { id } = useParams<{ id: string }>();
  // const dispatch = useAppDispatch();
  // const [activeFilter, setActiveFilter] = useState<string>("ALL");

  // const { events, loading } = useAppSelector((state) => state.animalHealthRecord);

  // // 1. Chargement des données spécifiques à l'animal
  // useEffect(() => {
  //   if (id) {
  //     dispatch(fetchAnimalHealthRecords({ farmId: parseInt(id), animalId: parseInt(id) }));
  //   }
  //   return () => { dispatch(resetAnimalHealthRecordState()); }; // Nettoyage au démontage
  // }, [dispatch, id]);

  // // 2. Logique de filtrage côté client
  // const filteredEvents = useMemo(() => {
  //   if (activeFilter === "ALL") return events;
  //   return events.filter(event => event.type === activeFilter);
  // }, [events, activeFilter]);

  // if (loading) return <div className="pt-32 text-center animate-pulse text-gray-500">Chargement du journal...</div>;

  return (
    // <div className=" pb-14 px-4 max-w-5xl mx-auto">
    //   Header avec ID Animal
    //   <div className="grid grid-cols-1 md:flex-row md:items-end  mb-10 gap-8">
    //     <div className="flex justify-between ">
    //       <div>
    //         <h1 className="text-xl font-black text-gray-900 tracking-tight">Journal de Vie</h1>
    //       </div>
    //       <div>
    //         <Button className="bg-vert p-4 rounded-md hover:bg-dark_vert text-white">
    //           Ajouter un Evenement  
    //         </Button>
    //       </div>
    //     </div>

    //     {/* Barre de Filtres Rapides */}
    //     <div className="flex flex-wrap gap-2">
    //       <button 
    //         onClick={() => setActiveFilter("ALL")}
    //         className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === "ALL" ? "bg-gray-900 text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"}`}
    //       >
    //         Tous
    //       </button>
    //       {Object.keys(EVENT_CONFIG).map(type => (
    //         <button 
    //           key={type}
    //           onClick={() => setActiveFilter(type)}
    //           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeFilter === type ? "bg-gray-900 text-white shadow-lg border-gray-900" : "bg-white text-gray-500 hover:bg-gray-100 border-gray-200"}`}
    //         >
    //           {EVENT_CONFIG[type].label}
    //         </button>
    //       ))}
    //     </div>
    //   </div>

    //   {filteredEvents.length === 0 ? (
    //     <div className="bg-white p-16 rounded-3xl border-2 border-dashed border-gray-200 text-center">
    //       <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
    //         <Filter className="text-gray-300" />
    //       </div>
    //       <p className="text-gray-400 font-medium">Aucun événement de type "{activeFilter}" trouvé.</p>
    //     </div>
    //   ) : (
    //     <div className="relative">
    //       {/* Ligne de la Timeline */}
    //       <div className="absolute left-6 md:left-10 top-2 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-100 to-transparent"></div>

    //       <div className="space-y-8">
    //         {filteredEvents.map((event, index) => {
    //           const config = EVENT_CONFIG[event.type] || { icon: ClipboardList, color: "text-gray-600 bg-gray-100", label: "Autre" };
    //           const Icon = config.icon;

    //           return (
    //             <div key={index} className="relative flex items-start gap-6 md:gap-10 group animate-in fade-in slide-in-from-bottom-4">
    //               {/* Icône décorative */}
    //               <div className={`relative z-10 shrink-0 flex items-center justify-center w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl border-4 border-white shadow-md transition-all group-hover:rotate-6 ${config.color}`}>
    //                 <Icon className="w-6 h-6 md:w-10 md:h-10" />
    //               </div>

    //               {/* Carte d'information */}
    //               <div className="flex-1 bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 group-hover:border-vert/30 transition-all">
    //                 <div className="flex items-center justify-between mb-2">
    //                   <div className="flex items-center gap-2 text-[11px] font-black text-vert bg-vert/5 px-3 py-1 rounded-lg uppercase tracking-widest">
    //                     <Calendar size={12} />
    //                     {new Date(event.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
    //                   </div>
    //                 </div>

    //                 <h3 className="text-xl font-extrabold text-gray-800 mb-1">{event.title}</h3>
    //                 <p className="text-gray-500 text-sm leading-relaxed">{event.description}</p>
    //               </div>
    //             </div>
    //           );
    //         })}
    //       </div>
    //     </div>
    //   )}
    // </div>
    <>  </>
  );
};

export default AnimalHistory;