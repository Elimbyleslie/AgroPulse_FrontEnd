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
  Settings,
  UserCog,
  History,
  Activity,
  CalendarDays,
  Utensils,
  BarChart3,
  DollarSign,
  QrCode
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
      { label: "Historique Individuel", path: "/main/animals/history", icon: History },
    ],
  },
  {
    label: "Santé Animale",
    path: "/main/health",
    icon: Stethoscope,
    subItems: [
      { label: "Consultations", path: "/main/health/consultations", icon: Activity },
      { label: "Vaccins & Traitements", path: "/main/health/vaccines", icon: CalendarDays },
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
      { label: "Plan des Rations", path: "/main/feeding/rations", icon: Activity },
      { label: "Stocks d'Aliments", path: "/main/feeding/inventory", icon: Package },
    ],
  },
  {
    label: "Production",
    path: "/main/production",
    icon: TrendingUp,
    subItems: [
      { label: "Suivi des Rendements", path: "/main/production/yields", icon: BarChart3 },
      { label: "Analyses par Lot", path: "/main/production/lots", icon: LayoutDashboard },
    ],
  },
  {
    label: "Finance & Logistique",
    path: "/main/finance",
    icon: Wallet,
    subItems: [
      { label: "Dépenses & Achats", path: "/main/finance/expenses", icon: Wallet },
      { label: "Ventes & Produits", path: "/main/finance/sales", icon: DollarSign },
      { label: "Bénéfices / Pertes", path: "/main/finance/reports", icon: TrendingUp },
    ],
  },
  {
    label: "Stocks & Équipements",
    path: "/main/inventory",
    icon: Package,
    subItems: [
      { label: "Inventaire Matériel", path: "/main/inventory/equipment", icon: Package },
      { label: "Maintenance", path: "/main/inventory/maintenance", icon: Settings },
    ],
  },
  {
    label: "Sécurité & Admin",
    path: "/main/admin",
    icon: UserCog,
    subItems: [
      { label: "Gestion Utilisateurs", path: "/main/admin/users", icon: UserCog },
      { label: "Paramètres Système", path: "/main/admin/settings", icon: Settings },
    ],
  },
];