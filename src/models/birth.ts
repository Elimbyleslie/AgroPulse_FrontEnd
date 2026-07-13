export interface Birth {
  id?: number;
  farmId: number;
  lotId?: number;
  motherId: number;
  fatherId?: number;
  photo?: string;
  date: string; // ISO string
  numberBorn?: number;
  numberAlive?: number;
  numberDead?: number;
  notes?: string;
  userId?: number;
  createdAt?: string;
}


export interface ReproductionWithBirth {
  id?: number;
  femaleId?: number;
  maleId?: number;
  matingDate?: string; // ISO string
  expectedBirth?: string; // ISO string
  actualBirthDate?: string; // ISO string
  numberBorn?: number;
  notes?: string;
  birthId?: number;
}

