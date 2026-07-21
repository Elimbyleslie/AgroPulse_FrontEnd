import { 
  LayoutDashboard, 
  Beef, 
  Stethoscope, 
  Baby, 
  Sprout, 
  TrendingUp, 
  Wallet, 
  Package, 
  Bell, 
  ShoppingBag,
  Settings,
  UserCog,
  Activity,
  CalendarDays,
  Utensils,
  BarChart3,
  DollarSign,
  QrCode,
  Users,
  Truck,
  LineChart
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface SubMenuItem {
  label: string;
  path: string;
  icon?: LucideIcon;
}

export interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  subItems?: SubMenuItem[];
}
export const menuItems: MenuItem[] = [
  {
    label: "Tableau de Bord",
    path: "/main/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Gestion du Cheptel",
    path: "/main/animals",
    icon: Beef,
    subItems: [
      { label: "Liste des Animaux", path: "/main/animals", icon: Activity },
      { label: "Suivi RFID / QR Code", path: "/main/animals/tracking", icon: QrCode },
      { label: "Groupes & Lots", path: "/main/animals/groups", icon: Users },
    ],
  },
  {
    label: "Santé Animale",
    path: "/main/health",
    icon: Stethoscope,
    subItems: [
      { label: "Consultations & Soins", path: "/main/health/consultations", icon: Activity },
      { label: "Vaccins & Traitements", path: "/main/health/vaccins", icon: CalendarDays },
      { label: "Alertes Sanitaires", path: "/main/health/alerts", icon: Bell },
    ],
  },
  {
    label: "Reproduction",
    path: "/main/reproduction",
    icon: Baby,
    subItems: [
      { label: "Cycles & Gestation", path: "/main/reproduction/cycles", icon: Activity },
      { label: "Registre des Naissances", path: "/main/reproduction/births", icon: Sprout },
      { label: "Performance Génétique", path: "/main/reproduction/genetic", icon: TrendingUp },
    ],
  },
  {
    label: "Alimentation",
    path: "/main/feeding",
    icon: Utensils,
    subItems: [
      { label: "Plans de Ration", path: "/main/feeding/rations", icon: Activity },
      { label: "Stocks d'Aliments", path: "/main/feeding/feedstock", icon: Package },
      // { label: "Distribution", path: "/main/feeding/distribution", icon: Truck },
    ],
  },
{
  label: "Production",
  path: "/main/production",
  icon: TrendingUp,
  subItems: [
    { label: "Tableau Production", path: "/main/production/dashboard", icon: LayoutDashboard },
    { label: "Production Journalière", path: "/main/production/daily", icon: TrendingUp },
    { label: "Suivi des Performances", path: "/main/production/performances", icon: BarChart3 },
    { label: "Analyses par Lot / troupeaux", path: "/main/production/lots", icon: LayoutDashboard },
    { label: "Courbes & Statistiques", path: "/main/production/curves", icon: LineChart },
  ],
},
  {
    label: "Finance & Ventes",
    path: "/main/finance",
    icon: Wallet,
    subItems: [
      { label: "Dépenses & Achats", path: "/main/finance/expenses", icon: Wallet },
      { label: "Ventes & Produits", path: "/main/finance/sales", icon: DollarSign },
      { label: "Bénéfices / Pertes", path: "/main/finance/reports", icon: TrendingUp },
      { label: "Gestion des Clients", path: "/main/finance/clients", icon: Users },
    ],
  },
 {
    label: "Stocks & Matériel",
    path: "/main/inventory",
    icon: Package,
    subItems: [
      { label: "Inventaire Général", path: "/main/inventory", icon: Package },
      { label: "Mouvements de Stock", path: "/main/inventory/movements", icon: Truck },
      { label: "Achats & Fournisseurs", path: "/main/inventory/purchases", icon: ShoppingBag },
      { label: "Équipements & Maintenance", path: "/main/inventory/equipment", icon: Settings },
    ],
  },

  {
    label: "Abonnement ",
    path: "/main/subscription",
    icon: DollarSign,
    subItems: [
      { label: "Mon Abonnement", path: "/main/subscription", icon: TrendingUp },
      { label: "Historique des Paiements", path: "/main/subscription/payments", icon: DollarSign },
      { label: "Gestion des Offres", path: "/main/subscription/plans", icon: Package }, // Admin only
    ],
  },

  {
    label: "Administration",
    path: "/main/admin",
    icon: UserCog,
    subItems: [
      { label: "Gestion Utilisateurs", path: "/main/admin/users", icon: UserCog },
      { label: "Paramètres Système", path: "/main/admin/settings", icon: Settings },
    ],
  },
];