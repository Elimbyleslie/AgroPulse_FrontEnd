export interface Herd {
  id?: number;
  farmId: number;
  speciesId: number;
  name: string;
  photo?: string;
  createdAt?: Date;
}

export interface InputCreateHerd {
  farmId: number;
  speciesId: number;
  name: string;
  photo?: string;
}
export interface InputUpdateHerd {
  id: number;
  farmId: number;
  speciesId: number;
  name: string;
  photo?: string;
}