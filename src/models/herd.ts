import { Animal } from "./animal";
import { FecthLot } from "./lot";
export interface Herd {
  id?: number;
  farmId: number;
  speciesId: number;
  name: string;
  photo?: string;
  createdAt?: Date;
  lots : FecthLot[];
  animals:Animal
  barnId:number
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