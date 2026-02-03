
import { Breed } from "./breed";
import { Species } from "./species";
export interface Animal {
  id: number;
  name: string;
  farmId: number;
  lotId?: number;
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
