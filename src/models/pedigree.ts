import { AnimalLight } from "./reproduction";

export interface CreatePedigreePayload {
  animalId: number;
  motherId?: number | null;
  fatherId?: number | null;
  maternalGrandmotherId?: number | null;
  maternalGrandfatherId?: number | null;
  paternalGrandmotherId?: number | null;
  paternalGrandfatherId?: number | null;
  generation4Ids?: number[] | null;
  verified?: boolean;
}

export interface UpdatePedigreePayload {
  motherId?: number | null;
  fatherId?: number | null;
  maternalGrandmotherId?: number | null;
  maternalGrandfatherId?: number | null;
  paternalGrandmotherId?: number | null;
  paternalGrandfatherId?: number | null;
  generation4Ids?: number[] | null;
  verified?: boolean;
}

export interface FetchPedigree {
  id: number;
  animalId: number;
  motherId?: number | null;
  fatherId?: number | null;
  maternalGrandmotherId?: number | null;
  maternalGrandfatherId?: number | null;
  paternalGrandmotherId?: number | null;
  paternalGrandfatherId?: number | null;
  generation4Ids?: unknown;
  completeness?: number | null;
  verified: boolean;
  animal?: AnimalLight;
  mother?: AnimalLight | null;
  father?: AnimalLight | null;
  maternalGrandmother?: AnimalLight | null;
  maternalGrandfather?: AnimalLight | null;
  paternalGrandmother?: AnimalLight | null;
  paternalGrandfather?: AnimalLight | null;
  createdAt: string;
  updatedAt: string;
}
