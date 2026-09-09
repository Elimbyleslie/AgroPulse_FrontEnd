/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/store";
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
  Baby,
  Wheat,
  Wallet,
  AlertTriangle,
  Package,
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
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
  LabelList,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import EmptyDashboard from "./EmptyDashboard";
import StatCard from "../../../components/UI/startCard";
import Modal from "../../../components/UI/Modal";
import AnimalForm from "../../../components/Modal/AnimalForm";
import WeatherWidget from "../../../components/UI/WeatherWidget"; 

import { getAllAnimals } from "../../../store/animal/action";
import { fetchAlertsByFarmId } from "../../../store/alerts/action";
import { fetchWithAuthOrganizations } from "../../../store/organization/action";
import { getAllFarms } from "../../../store/farm/action";
import { fetchProductions, fetchProductionStats } from "../../../store/production/action";
import { fetchBirths } from "../../../store/birth/action";
import { fetchFeedStock } from "../../../store/alimentations/feedstockAct";
import { getAllExpenses, getAllSales } from "../../../store/gestionFinanciere/action";

import { selectCurrentFarm } from "../../../store/farm/slice";
import { LoadingType } from "../../../models/store";
import { StockStatus } from "../../../models/alimentation";



type TabType = "overview";

function MainDashboard() {
  const dispatch = useAppDispatch();

  // ── Organisations / Fermes ──
  const organizations =
    useAppSelector((state) => state.organizations.organizationList.entities) ?? [];
  const farms = useAppSelector((state) => state.farms.farmList.entities) ?? [];
  const orgStatus = useAppSelector((state) => state.organizations.organizationList.status);
  const farmStatus = useAppSelector((state) => state.farms.farmList.status);
  const currentFarm = useAppSelector(selectCurrentFarm);

  // ── Animaux ──
  const allAnimals = useAppSelector((state) => state.animal.animalist?.entities) ?? [];
  const animalStatus = useAppSelector((state) => state.animal.animalist?.status);

  // ── Alertes ──
  const allStoreAlerts: any[] = useAppSelector((state) => {
    const raw = state.alerts.alerts;
    return Array.isArray(raw) ? raw : [];
  });

  // ── Production ──
  const productions = useAppSelector((state) => state.production.list.entities) ?? [];
  const productionStatus = useAppSelector((state) => state.production.list.status);
  const productionStats = useAppSelector((state) => state.production.stats.entities);

  // ── Naissances ──
  const births = useAppSelector((state) => state.birth.births) ?? [];
  const birthLoading = useAppSelector((state) => state.birth.birthState.loading);

  // ── Stock alimentation ──
  const feedStock = useAppSelector((state) => state.feedStock.FeedStock)
  const feedStockLoading = useAppSelector(
    (state) => state.feedStock.FeedStockState.fetchLoading
  );

  // ── Finance ──
  const expenses = useAppSelector((state) => state.finance.expenseList.entities) ?? [];
  const sales = useAppSelector((state) => state.finance.saleList.entities) ?? [];
  const expenseStatus = useAppSelector((state) => state.finance.expenseList.status);
  const saleStatus = useAppSelector((state) => state.finance.saleList.status);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const farmId = currentFarm?.id ?? farms[0]?.id;
  const currentFarmId = selectedFarmId === "all" ? farms[0]?.id : Number(selectedFarmId);

  const handleAddSuccess = () => {
    setIsModalOpen(false);
    if (farms.length > 0) {
      dispatch(getAllAnimals({ limit: 10, farmId: currentFarmId }));
    }
  };

  // ── Filtrage animaux par ferme ──
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

  // --- Calculs Graphiques Animaux ---
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
      const month = new Date(a.createdAt ?? 0).toLocaleString("fr-FR", { month: "short" });
      const existing = acc.find((item: any) => item.month === month);
      if (existing) existing.total += 1;
      else acc.push({ month, total: 1 });
      return acc;
    }, []);
  }, [filteredAnimals]);

  const COLORS = ["#16A34A", "#3b82f6", "#E3BA3E", "#ef4444", "#8b5cf6"];

  const healthStats = useMemo(() => {
    if (filteredAnimals.length === 0) return { rate: null as number | null, sick: 0 };
    const sick = filteredAnimals.filter(
      (a) => a.status === "sick" || a.status === "dead" || a.status === "malade"
    ).length;
    const rate = ((filteredAnimals.length - sick) / filteredAnimals.length) * 100;
    return { rate, sick };
  }, [filteredAnimals]);

  // ── Calculs Production ──
  const filteredProductions = useMemo(() => {
    if (selectedFarmId === "all") return productions;
    return productions.filter((p: any) => p.farmId === Number(selectedFarmId));
  }, [productions, selectedFarmId]);

  const productionByType = useMemo(() => {
    const counts = filteredProductions.reduce((acc: any, p: any) => {
      acc[p.Type] = (acc[p.Type] || 0) + (p.quantity ?? 0);
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredProductions]);

  const totalProductionQty =
    productionStats?.total?.totalQuantity ??
    filteredProductions.reduce((acc: number, p: any) => acc + (p.quantity ?? 0), 0);

  // ── Calculs Naissances ──
  const filteredBirths = useMemo(() => {
    if (selectedFarmId === "all") return births;
    return births.filter((b: any) => b.farmId === Number(selectedFarmId));
  }, [births, selectedFarmId]);

  const birthStats = useMemo(() => {
    const totalBorn = filteredBirths.reduce((acc: number, b: any) => acc + (b.numberBorn ?? 0), 0);
    const totalAlive = filteredBirths.reduce((acc: number, b: any) => acc + (b.numberAlive ?? 0), 0);
    const totalDead = filteredBirths.reduce((acc: number, b: any) => acc + (b.numberDead ?? 0), 0);
    return { totalBorn, totalAlive, totalDead, count: filteredBirths.length };
  }, [filteredBirths]);

  // ── Calculs Stock Alimentation ──
  const filteredFeedStock = useMemo(() => {
    if (selectedFarmId === "all") return feedStock;
    return feedStock.filter((f: any) => f.farmId === Number(selectedFarmId));
  }, [feedStock, selectedFarmId]);

  const feedAlerts = useMemo(
    () =>
      filteredFeedStock.filter(
        (f: any) => f.status === StockStatus.LOW_STOCK || f.status === StockStatus.OUT_OF_STOCK
      ),
    [filteredFeedStock]
  );

  //calculer la valeur du stock alimentaire  en mutipliant la quantité par le prix unitaire
  const totalStockValue = useMemo(() => {
    return filteredFeedStock.reduce((acc: number, f: any) => {
      return acc + (f.quantity ?? 0) * (f.unitPrice ?? 0);
    }, 0);
  }, [filteredFeedStock]);

  // ── Calculs Finance ──
  const filteredExpenses = useMemo(() => {
    if (selectedFarmId === "all") return expenses ?? [];
    return (expenses ?? []).filter((e: any) => e.farmId === Number(selectedFarmId));
  }, [expenses, selectedFarmId]);

  const filteredSales = useMemo(() => {
    if (selectedFarmId === "all") return sales ?? [];
    return (sales ?? []).filter((s: any) => s.farmId === Number(selectedFarmId));
  }, [sales, selectedFarmId]);

  const financeStats = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce(
      (acc: number, e: any) => acc + (e.totalAmount ?? 0),
      0
    );
    const totalSales = filteredSales.reduce((acc: number, s: any) => acc + (s.total ?? 0), 0);
    return { totalExpenses, totalSales, net: totalSales - totalExpenses };
  }, [filteredExpenses, filteredSales]);

  // Configuration des onglets
  const tabs = [
    { id: "overview" as TabType, label: "Vue d'ensemble", icon: LayoutDashboard, badge: filteredAnimals.length },
  ];

  const dashboardAlerts = allStoreAlerts.filter((alert) => {
    const lower = alert.title?.toLowerCase() ?? "";
    const isSante =
      lower.includes("malade") || lower.includes("santé") ||
      lower.includes("décès") || lower.includes("mort");
    return !isSante && alert.status === "active";
  });

  // ── Chargement initial : orgs + fermes ──
  useEffect(() => {
    if (orgStatus === LoadingType.IDLE) {
      dispatch(fetchWithAuthOrganizations({ limit: 10 }));
    }
    if (farmStatus === LoadingType.IDLE) {
      dispatch(getAllFarms({ limit: 10 }));
    }
  }, [dispatch, orgStatus, farmStatus]);

  // ── Alertes ──
  useEffect(() => {
    if (farmId) dispatch(fetchAlertsByFarmId(farmId));
  }, [farmId, dispatch]);

  // ── Animaux : CORRECTIF DU BUG "données disparaissent au rechargement" ──
  // Rien ne redemandait les animaux au montage — seulement après un ajout manuel.
  useEffect(() => {
    if (farmId && animalStatus === LoadingType.IDLE) {
      dispatch(getAllAnimals({ farmId, page: 1, limit: 50 }));
    }
  }, [dispatch, farmId, animalStatus]);

  // ── Production ──
  useEffect(() => {
    if (farmId && productionStatus === LoadingType.IDLE) {
      dispatch(fetchProductions({ farmId, page: 1, limit: 50 }));
      dispatch(fetchProductionStats({ farmId, groupBy: "Type" }));
    }
  }, [dispatch, farmId, productionStatus]);

  // ── Naissances ──
  useEffect(() => {
    if (farmId && !birthLoading && births.length === 0) {
      dispatch(fetchBirths({ farmId, page: 1, limit: 50 }));
    }
  }, [dispatch, farmId]);

  // ── Stock alimentation ──
  useEffect(() => {
    if (farmId && !feedStockLoading && feedStock.length === 0) {
      dispatch(fetchFeedStock(farmId));
    }
  }, [dispatch, farmId]);

  // ── Finance ──
  useEffect(() => {
    if (farmId && expenseStatus === LoadingType.IDLE) {
      dispatch(getAllExpenses({ farmId, page: 1, limit: 50 }));
    }
    if (farmId && saleStatus === LoadingType.IDLE) {
      dispatch(getAllSales({ farmId, page: 1, limit: 50 }));
    }
  }, [dispatch, farmId, expenseStatus, saleStatus]);

  if (organizations.length === 0 || farms.length === 0 || allAnimals.length === 0) {
    return <EmptyDashboard />;
  }

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
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              {activeTab === "overview" && (
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
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-all relative ${
                    isActive
                      ? "border-vert text-vert bg-green-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {tab.badge !== null && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? "bg-vert text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
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
        {activeTab === "overview" && (
          <>
            {/* Alertes stock & équipements */}
            {dashboardAlerts.length > 0 && (
              <div className="mb-6 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  Alertes opérationnelles
                </h3>
                {dashboardAlerts.map((alert: any) => {
                  const isStock = alert.title?.toLowerCase().includes("stock");
                  const Icon = isStock ? Package : Wrench;
                  const colors = isStock
                    ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                    : "bg-purple-50 border-purple-200 text-purple-700";
                  return (
                    <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl border ${colors}`}>
                      <Icon size={16} className="shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{alert.title}</p>
                        <p className="text-xs opacity-75 truncate">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Alertes stock alimentation bas */}
            {feedAlerts.length > 0 && (
              <div className="mb-6 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <Wheat size={14} className="text-orange-500" />
                  Stock alimentation faible
                </h3>
                {feedAlerts.map((f: any) => (
                  <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl border bg-orange-50 border-orange-200 text-orange-700">
                    <Package size={16} className="shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{f.name}</p>
                      <p className="text-xs opacity-75">
                        {f.quantity} {f.unit} restant {f.minQuantity ? `(seuil: ${f.minQuantity} ${f.unit})` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Météo + KPI Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-1">
                <WeatherWidget farmName={currentFarm?.name ?? farms[0]?.name ?? ""} />
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                  title="Effectif"
                  value={filteredAnimals.length}
                  icon={<Dog className="text-jaune" />}
                  color="bg-blue-50"
                />
                <StatCard
                  title="Santé"
                  value={healthStats.rate !== null ? `${healthStats.rate.toFixed(0)}%` : "N/A"}
                  icon={<Activity className="text-vert" />}
                  color="bg-green-50"
                />
                <StatCard
                  title="Poids Moyen"
                  value={
                    filteredAnimals.length
                      ? (filteredAnimals.reduce((acc, a) => acc + a.weight, 0) / filteredAnimals.length).toFixed(1) + " kg"
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
            </div>

            {/* KPI Production / Naissances / Stock / Finance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Production totale"
                value={`${totalProductionQty ?? 0}`}
                icon={<Wheat className="text-vert" />}
                color="bg-green-50"
              />
              <StatCard
                title="Naissances"
                value={`${birthStats.totalAlive} vivant(s)`}
                icon={<Baby className="text-pink-500" />}
                color="bg-pink-50"
              />
              <StatCard
                title="Valeur stock aliment."
                value={`${totalStockValue.toLocaleString("fr-FR")} FCFA`}
                icon={<Package className="text-orange-500" />}
                color="bg-orange-50"
              />
              <StatCard
                title="Solde (ventes - dépenses)"
                value={`${financeStats.net.toLocaleString("fr-FR")} FCFA`}
                icon={
                  financeStats.net >= 0 ? (
                    <ArrowUpRight className="text-vert" />
                  ) : (
                    <ArrowDownRight className="text-red-500" />
                  )
                }
                color={financeStats.net >= 0 ? "bg-green-50" : "bg-red-50"}
              />
            </div>

            {/* Charts Animaux */}
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
                      label={({ percent }) => `${(percent ? percent * 100 : 0).toFixed(0)}%`}
                    >
                      {speciesData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => [`${value ?? 0} tête(s)`, "Quantité"]} />
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "#F8FAFC" }} />
                    <Bar dataKey="total" fill="#E3BA3E" radius={[6, 6, 0, 0]} barSize={30} />
                    <LabelList dataKey="total" position="top" style={{ fontSize: "12px", fill: "#64748b" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart Production par type + Finance ventes vs dépenses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[340px]">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Wheat size={18} className="text-green-500" /> Production par type
                </h3>
                {productionByType.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-10">Aucune production enregistrée.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={productionByType}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#16A34A" radius={[6, 6, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[340px]">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Wallet size={18} className="text-green-500" /> Finance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Ventes</span>
                    <span className="font-bold text-vert">
                      {financeStats.totalSales.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Dépenses</span>
                    <span className="font-bold text-red-500">
                      {financeStats.totalExpenses.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-sm font-bold text-gray-700">Solde net</span>
                    <span className={`font-black ${financeStats.net >= 0 ? "text-vert" : "text-red-500"}`}>
                      {financeStats.net.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Animaux */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-md font-bold text-gray-800">Derniers Animaux</h3>
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
                    {[...filteredAnimals].reverse().slice(0, 3).map((animal) => (
                      <tr key={animal.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2 font-bold text-darkText">{animal.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {animal.species?.name || "-"} / {animal.breed?.name || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">{animal.weight} kg</td>
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
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enregistrer un nouvel animal">
        <AnimalForm farmId={currentFarmId} onSuccess={handleAddSuccess} />
      </Modal>
    </div>
  );
}

export default MainDashboard;