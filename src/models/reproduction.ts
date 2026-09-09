// ==================== ENUMS ====================

export type CycleType = "chaleur" | "insemination" | "confirmation" | "echec";
export type CycleStatus = "en_cours" | "confirme" | "echec" | "termine";
export type InseminationType = "naturelle" | "artificielle";
export type GestationStatus =
  | "en_attente"
  | "confirmee"
  | "en_cours"
  | "terminee"
  | "avortement";
export type ConfirmationMethod =
  | "echographie"
  | "palpation"
  | "test_sanguin"
  | "observation";

// ==================== NESTED TYPES ====================

export interface AnimalLight {
  id: number;
  name: string;
  species?: { name: string };
}

export interface MaleLight {
  id: number;
  name: string;
}

export interface UserLight {
  id: number;
  name: string;
}

export interface GestationLight {
  id: number;
  status: GestationStatus;
  expectedDeliveryDate: string;
}

export interface BirthLight {
  id: number;
  numberBorn: number;
  numberAlive: number;
  date: string;
}

// ==================== REPRODUCTION CYCLE ====================

export interface FetchReproductionCycle {
  id: number;
  farmId: number;
  animalId: number;
  cycleType: CycleType;
  startDate: string;
  endDate?: string | null;
  status: CycleStatus;
  heatIntensity?: number | null;
  heatBehavior?: string | null;
  inseminationType?: InseminationType | null;
  maleId?: number | null;
  semenBatch?: string | null;
  technicianId?: number | null;
  notes?: string | null;
  animal?: AnimalLight;
  male?: MaleLight | null;
  technician?: UserLight | null;
  gestation?: GestationLight | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReproductionCyclePayload {
  farmId: number;
  animalId: number;
  cycleType: CycleType;
  startDate: string;
  endDate?: string;
  status?: CycleStatus;
  heatIntensity?: number;
  heatBehavior?: string;
  inseminationType?: InseminationType;
  maleId?: number;
  semenBatch?: string;
  technicianId?: number;
  notes?: string;
}

export interface UpdateReproductionCyclePayload {
  id: number;
  cycleType?: CycleType;
  startDate?: string;
  endDate?: string;
  status?: CycleStatus;
  heatIntensity?: number;
  heatBehavior?: string;
  inseminationType?: InseminationType;
  maleId?: number | null;
  semenBatch?: string;
  technicianId?: number | null;
  notes?: string;
}

export interface ReproductionCycleStats {
  total: number;
  byCycleType: Record<string, number>;
  byStatus: Record<string, number>;
}

// ==================== GESTATION CHECKUP ====================

export interface FetchGestationCheckup {
  id: number;
  gestationId: number;
  checkDate: string;
  gestationDay: number;
  motherWeight?: number | null;
  motherCondition?: number | null;
  fetalHeartbeat?: boolean | null;
  fetalMovement?: boolean | null;
  complications?: string | null;
  veterinarianId?: number | null;
  notes?: string | null;
  veterinarian?: UserLight | null;
  createdAt: string;
}

export interface CreateGestationCheckupPayload {
  gestationId: number;
  checkDate: string;
  motherWeight?: number;
  motherCondition?: number;
  fetalHeartbeat?: boolean;
  fetalMovement?: boolean;
  complications?: string;
  veterinarianId?: number;
  notes?: string;
}

export interface UpdateGestationCheckupPayload {
  id: number;
  checkDate?: string;
  motherWeight?: number;
  motherCondition?: number;
  fetalHeartbeat?: boolean;
  fetalMovement?: boolean;
  complications?: string;
  veterinarianId?: number | null;
  notes?: string;
}

// ==================== GESTATION ====================

export interface FetchGestation {
  id: number;
  farmId: number;
  animalId: number;
  reproductionCycleId: number;
  inseminationDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string | null;
  status: GestationStatus;
  gestationDays?: number | null;
  confirmationDate?: string | null;
  confirmationMethod?: ConfirmationMethod | null;
  numberOfOffspring?: number | null;
  complications?: string | null;
  abortionDate?: string | null;
  abortionCause?: string | null;
  lastCheckDate?: string | null;
  veterinarianId?: number | null;
  notes?: string | null;
  animal?: AnimalLight;
  reproductionCycle?: {
    id: number;
    cycleType: CycleType;
    inseminationType?: InseminationType | null;
    male?: MaleLight | null;
  };
  veterinarian?: UserLight | null;
  birth?: BirthLight | null;
  checkups?: FetchGestationCheckup[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGestationPayload {
  farmId: number;
  animalId: number;
  reproductionCycleId: number;
  inseminationDate: string;
  expectedDeliveryDate: string;
  status?: GestationStatus;
  confirmationDate?: string;
  confirmationMethod?: ConfirmationMethod;
  numberOfOffspring?: number;
  veterinarianId?: number;
  notes?: string;
}

export interface UpdateGestationPayload {
  id: number;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status?: GestationStatus;
  confirmationDate?: string;
  confirmationMethod?: ConfirmationMethod;
  numberOfOffspring?: number;
  complications?: string;
  abortionDate?: string;
  abortionCause?: string;
  lastCheckDate?: string;
  veterinarianId?: number | null;
  notes?: string;
}

export interface GestationStats {
  total: number;
  byStatus: Record<string, number>;
  expectedDeliveriesNext30Days: number;
}

// ==================== GENETIC PERFORMANCE ====================

export interface FetchGeneticPerformance {
   id: number;
  farmId: number;
  animalId: number;

  // Indicateurs de croissance
  growthRate?: number | null;
  birthWeight?: number | null;
  weaningWeight?: number | null;

  // Scores de sélection (Index)
  prolificityScore?: number | null;
  maternalInstinct?: number | null; // Note de 1 à 10
  diseaseResistance?: number | null; // Score de rusticité

  // Données généalogiques
  inbreedingCoeff?: number | null;
}

export interface CreateGeneticPerformancePayload {
 
  farmId: number;
  animalId: number;

  // Indicateurs de croissance
  growthRate?: number | null;
  birthWeight?: number | null;
  weaningWeight?: number | null;

  // Scores de sélection (Index)
  prolificityScore?: number | null;
  maternalInstinct?: number | null; // Note de 1 à 10
  diseaseResistance?: number | null; // Score de rusticité

  // Données généalogiques
  inbreedingCoeff?: number | null;


}

export interface UpdateGeneticPerformancePayload extends Partial<CreateGeneticPerformancePayload> {
  id: number;
}

// ==================== PAGINATION ====================

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ==================== QUERY PARAMS ====================

export interface ReproductionCycleQuery {
  farmId: number;
  animalId?: number;
  status?: CycleStatus;
  cycleType?: CycleType;
  page?: number;
  limit?: number;
}

export interface GestationQuery {
  farmId: number;
  animalId?: number;
  status?: GestationStatus;
  page?: number;
  limit?: number;
}

export interface GeneticPerformance {
  id: number;
  farmId: number;
  animalId: number;

  // Indicateurs de croissance
  growthRate?: number | null;
  birthWeight?: number | null;
  weaningWeight?: number | null;

  // Scores de sélection (Index)
  prolificityScore?: number | null;
  maternalInstinct?: number | null; // Note de 1 à 10
  diseaseResistance?: number | null; // Score de rusticité

  // Données généalogiques
  inbreedingCoeff?: number | null;

  // Metadata
  updatedAt: Date | string;
  createdAt: Date | string;
}