
export interface FecthVaccination {
  id: number;
  animalId: string;
  lotId?: number;
  vaccinationDate: string;
  vaccinationType: string;
  veterinarianId: number;
}

export interface FetchConsultation {
  id: number;
  animalId?: number;
  lotId?: number;
  checkDate: string;
  veterinarianId: number;
  symptoms: string;
  farmId?: number;
  diagnosis?: string;
  treatment?: string;
}

export interface VaccinationPlan {
  id: string;
  animalId: number;
  lotId?: number;
  vaccinationDate: string;
  vaccinationType: string;
  veterinarianId: number;
}

export interface Consultation {
  animalId: number;
  lotId?: number;
  checkDate: string;
  farmId?: number;
  veterinarianId: number;
  symptoms: string;
  diagnosis?: string;
  treatment?: string;
}

export interface Vaccination {
  animalId: number;
  lotId?: number;
  vaccinationDate: string;
  vaccinationType: string;
  veterinarianId: number;
}