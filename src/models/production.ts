  /* eslint-disable @typescript-eslint/no-explicit-any */
import { FecthLot } from "./lot";
import { Animal } from "./animal";
import { Herd } from "./herd";
import { Pen } from "./pen";
import { SaleItem } from "./gestionFinanciere";
export interface Production {
  farmId: number;
  lotId?: number | null;
  animalId?: number | null;
  herdId?: number | null;
  penId?: number | null;
  date?: string;
  category: 'Product' | 'byproduct';
  type: string;
  quantity: number;
  unit: string;
  qualityGrade?: 'A' | 'B' | 'C' | null;
  notes?: string | null;
  userId?: number | null;
  saleItemId?: number | null;
  lot?: FecthLot ;
  animal?: Animal ;
  herd?: Herd ;
  pen?: Pen ;


}

export interface FetchProduction extends Production {
  id: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  lot?: FecthLot ;
  animal?: Animal ;
  herd?: Herd ;
  pen?: Pen ;
  user?: { id: number; userName: string; email: string } ;
  saleItem?: SaleItem ;

}

export interface ProductionStats {
  groupedStats: Array<{
    type: string;
    unit: string;
    category: string;
    _sum: { quantity: number };
    _avg: { quantity: number | null };
    _count: { id: number };
  }>;
  total: {
    totalQuantity: number | null;
    totalRecords: number;
    averageQuantity: number | null;
  };
  filters?: any;
}




export interface DailyProductionSummary {
  date: string;
  totalQuantity: number;
  productions: Production[];
  byType: Record<string, number>;
}

export interface LotPerformance {
  lotId: number;
  lotName: string;
  species: string;
  quantity: number;
  totalProduction: number;
  avgPerAnimal: number;
  productivityRate: number; 
}

