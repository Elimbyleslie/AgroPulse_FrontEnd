/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useAppSelector } from "../../../hooks/store";
import {
  Dog,
  Home,
  TrendingUp,
  Activity,
  Plus,
  LayoutDashboard,
  Filter,
  FileText,
  Download,
  Layers,
  Grid3x3,
  Users as UsersIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import EmptyDashboard from "./EmptyDashboard";
import StatCard from "../../../components/UI/startCard";
import Modal from "../../../components/UI/Modal";
import AnimalForm from "../../../components/Modal/AnimalForm";
import { getAllAnimals } from "../../../store/animal/action";
import { useAppDispatch } from "../../../hooks/store";

// Import des nouveaux composants de gestion
import BarnList from "../barnList";
import LotDashboard from "../lotList";
import PenList from "../../../components/Modal/Pen/PenList";
import HerdList from "../../../components/Modal/Herd/HerdList";

type TabType = 'overview' | 'barns' | 'lots' | 'pens' | 'herds';

function MainDashboard() {
  const organizations =
    useAppSelector((state) => state.organizations.organizationList.entities) ??
    [];
  const farms = useAppSelector((state) => state.farms.farmList.entities) ?? [];
  const allAnimals =
    useAppSelector((state) => state.animal.pagination?.entities) ?? [];
  const status = useAppSelector((state) => state.animal.pagination?.status);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const dispatch = useAppDispatch();

  const handleAddSuccess = () => {
    setIsModalOpen(false);
    if (farms.length > 0) {
      dispatch(
        getAllAnimals({
          limit: 10,
          farmId:
            selectedFarmId === "all" ? farms[0].id : Number(selectedFarmId),
        }),
      );
    }
  };

  // --- Logique de Filtrage ---
  const filteredAnimals = useMemo(() => {
    if (selectedFarmId === "all") return allAnimals;
    return allAnimals.filter((a) => a.farmId === Number(selectedFarmId));
  }, [allAnimals, selectedFarmId]);

  // --- Fonction Export PDF ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const farmName =
      selectedFarmId === "all"
        ? "Toutes les fermes"
        : farms.find((f) => f.id === Number(selectedFarmId))?.name;
    const dateStr = new Date().toLocaleDateString("fr-FR");

    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text("AgroPulse - Rapport d'Élevage", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Ferme: ${farmName}`, 14, 30);
    doc.text(`Date du rapport: ${dateStr}`, 14, 37);
    doc.text(`Nombre d'animaux: ${filteredAnimals.length}`, 14, 44);

    const tableData = filteredAnimals.map((a) => [
      a.name,
      a.species?.name || "-",
      a.breed?.name || "-",
      `${a.weight} kg`,
      a.gender === "male" ? "Male" : "Femelle",
      a.status,
    ]);

    autoTable(doc, {
      startY: 55,
      head: [["Nom", "Espèce", "Race", "Poids", "Genre", "Statut"]],
      body: tableData,
      headStyles: { fillColor: [16, 185, 129] },
      theme: "grid",
    });

    doc.save(`Rapport_AgroPulse_${farmName}_${dateStr}.pdf`);
  };

  // --- Calculs Graphiques ---
  const speciesData = useMemo(() => {
    const counts = filteredAnimals.reduce((acc: any, a) => {
      const name = a.species?.name || "Inconnu";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredAnimals]);

  const monthlyData = useMemo(() => {
    return filteredAnimals.reduce((acc: any, a) => {
      const month = new Date(a.createdAt ?? 0).toLocaleString("fr-FR", {
        month: "short",
      });
      const existing = acc.find((item: any) => item.month === month);
      if (existing) existing.total += 1;
      else acc.push({ month, total: 1 });
      return acc;
    }, []);
  }, [filteredAnimals]);

  const COLORS = ["#16A34A", "#3b82f6", "#E3BA3E", "#ef4444", "#8b5cf6"];

  // Configuration des onglets
  const tabs = [
    { 
      id: 'overview' as TabType, 
      label: 'Vue d\'ensemble', 
      icon: LayoutDashboard,
      badge: filteredAnimals.length
    },
    { 
      id: 'barns' as TabType, 
      label: 'Bâtiments', 
      icon: Home,
      badge: null
    },
    { 
      id: 'lots' as TabType, 
      label: 'Lots', 
      icon: Layers,
      badge: null
    },
    { 
      id: 'pens' as TabType, 
      label: 'Enclos', 
      icon: Grid3x3,
      badge: null
    },
    { 
      id: 'herds' as TabType, 
      label: 'Troupeaux', 
      icon: UsersIcon,
      badge: null
    },
  ];

  if (status === "pending" && allAnimals.length === 0)
    return (
      <div className="h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  
  if (
    organizations.length === 0 ||
    farms.length === 0 ||
    allAnimals.length === 0
  )
    return <EmptyDashboard />;

  // Obtenir le farmId actuel pour les composants de gestion
  const currentFarmId = selectedFarmId === "all" ? farms[0]?.id : Number(selectedFarmId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20">
      {/* Header avec Sélecteur de Ferme */}
      <div className="bg-white border-b sticky top-20 z-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-darkText flex items-center gap-2">
                <LayoutDashboard className="text-vert" /> Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg w-fit">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="text-sm font-semibold text-text outline-none bg-transparent cursor-pointer"
                >
                  <option value="all">Toutes les fermes</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              {activeTab === 'overview' && (
                <>
                  <button
                    onClick={generatePDF}
                    className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-text font-bold hover:bg-gray-50 transition shadow-sm"
                  >
                    <Download size={20} /> PDF
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-vert text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-green-700 transition"
                  >
                    <Plus size={20} /> Nouvel Animal
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navigation par Onglets */}
          <div className="flex gap-1 overflow-x-auto pb-0 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap
                    border-b-2 transition-all relative
                    ${isActive 
                      ? 'border-vert text-vert bg-green-50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={18} />
                  {tab.label}
                  {tab.badge !== null && (
                    <span className={`
                      ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                      ${isActive ? 'bg-vert text-white' : 'bg-gray-200 text-gray-600'}
                    `}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ONGLET VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Effectif"
                value={filteredAnimals.length}
                icon={<Dog className="text-jaune" />}
                color="bg-blue-50"
              />
              <StatCard
                title="Santé"
                value="98%"
                icon={<Activity className="text-vert" />}
                color="bg-green-50"
              />
              <StatCard
                title="Poids Moyen"
                value={
                  filteredAnimals.length
                    ? (
                        filteredAnimals.reduce((acc, a) => acc + a.weight, 0) /
                        filteredAnimals.length
                      ).toFixed(1) + " kg"
                    : "0 kg"
                }
                icon={<TrendingUp className="text-jaune" />}
                color="bg-orange-50"
              />
              <StatCard
                title="Fermes"
                value={selectedFarmId === "all" ? farms.length : 1}
                icon={<Home className="text-bleu" />}
                color="bg-purple-50"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[380px]">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText size={18} className="text-green-500" /> Par Espèce
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={speciesData}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={1}
                      dataKey="value"
                      label={({ percent }) =>
                        `${(percent ? percent * 100 : 0).toFixed(0)}%`
                      }
                    >
                      {speciesData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined) => [`${value ?? 0} tête(s)`, "Quantité"]}
                    />
                    <Legend verticalAlign="bottom" height={9} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[380px]">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <TrendingUp size={18} className="text-green-500" /> Enregistrements
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "#F8FAFC" }} />
                    <Bar
                      dataKey="total"
                      fill="#16A34A"
                      radius={[6, 6, 0, 0]}
                      barSize={30}
                    />
                    <LabelList dataKey="total" position="top" style={{ fontSize: '12px', fill: '#64748b' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Derniers Animaux</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Animal</th>
                      <th className="px-6 py-4">Espèce / Race</th>
                      <th className="px-6 py-4">Poids</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAnimals.slice(0, 10).map((animal) => (
                      <tr key={animal.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-darkText">
                          {animal.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {animal.species?.name || "-"} / {animal.breed?.name || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          {animal.weight} kg
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-tighter">
                            {animal.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ONGLET BÂTIMENTS */}
        {activeTab === 'barns' && <BarnList farmId={currentFarmId} />}

        {/* ONGLET LOTS */}
        {activeTab === 'lots' && <LotDashboard farmId={currentFarmId} />}

        {/* ONGLET ENCLOS */}
        {activeTab === 'pens' && <PenList farmId={currentFarmId} />}

        {/* ONGLET TROUPEAUX */}
        {activeTab === 'herds' && <HerdList farmId={currentFarmId} />}
      </div>

      {/* Modal d'ajout d'animal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enregistrer un nouvel animal"
      >
        <AnimalForm
          farmId={currentFarmId}
          onSuccess={handleAddSuccess}
        />
      </Modal>
    </div>
  );
}

export default MainDashboard;