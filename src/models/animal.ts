
import { Breed } from "./breed";
import { Species } from "./species";
import { FecthLot } from "./lot";
import { Herd } from "./herd";
import { Pen } from "./pen";
export interface Animal {
  id: number;
  name: string;
  farmId: number;
  lotId?: number;
  herdId?: number;
  penId?: number;
  barnId?: number;
  speciesId: number;
  breedId?: number;
  photo?: string;
  birthId?: number;
  qrcode: string;
  gender: string;
  birthDate: string;
  weight: number;
  status: string;
  createdAt?:string;
  updatedAt?:string;
  species?: Species;
  breed?: Breed;
  lot?: FecthLot;
  herd?:Herd;
  pen?:Pen;

}

export interface AnimalForm {
  name: string;
  farmId: number;
  lotId?: number;
  speciesId: number;
  breedId?: number;
  photo?: string;
  birthId?: number;
  qrcode?: string;
  gender: string;
  birthDate?: Date;
  weight: number;
  status: string;
}

export interface FetchAnimalArgs {
  limit: number;
  page?: number;
  search?: string;
  skip?: number;
  farmId: number;
}


export enum Gender {
  male = "male",
  female="female",
  unknown="unknown"
}

export enum AnimalStatus {
  active = "active",
  sold="sold",
  dead="dead",
  transferred="transferred"
}
