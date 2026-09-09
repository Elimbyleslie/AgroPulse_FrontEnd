/* eslint-disable @typescript-eslint/no-explicit-any */

import { User } from "./user";



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
  veterinarian?:User
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
    veterinarian?:{ name:string}

}
export interface Vaccination {
  id?: number;
  animalId?: number | null;
  lotId?: number | null;
  vaccineName?: string;
  dateGiven?: string | Date | null;
  nextDue?: string | Date | null;
  administeredBy?: number | null;
  inventoryId?: number | null;
  quantityUsed?: number | null;
  farmId?: number | null;
  vaccinated?: boolean;
  lastConfirmedAt?: string | Date | null;   // ← ajouté
}

export interface FecthVaccination extends Vaccination {
  id: number;
  animal?: any;
  lot?: any;
  inventory?: any;
  admin?: { id: number; name: string } | null;
}

export interface Treatment {
  id?: number;
  animalId?: number | null;
  lotId?: number | null;
  treatmentName?: string;
  medication?: string;
  inventoryId?: number | null;
  dosage?: string;
  quantityUsed?: number | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  administeredBy?: number | null;
  farmId?: number | null;
  treated?: boolean;
  frequencyDays?: number | null;            
  lastConfirmedAt?: string | Date | null;    
}

export interface FetchTreatment extends Treatment {
  id: number;
  animal?: any;
  lot?: any;
  inventory?: any;
  admin?: { id: number; name: string } | null;
}

export interface AnimalHealthRecord {
  id?: number;
  animalId?: number;
  farmId?: number;
  lotId?: number;
  checkDate: Date;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  veterinarianId?: number;
}
