import { Barn } from "./barn";
import { Breed } from "./breed";
import { Pen } from "./pen";
import { Species } from "./species";
import { Animal } from "./animal";

export interface FecthLot {
  id: number;
  herdId?: number;
  farmId: number;
  barnId?: number;
  name: string;
  photo?: string;
  speciesId: number;
  breedId: number;
  ageGroup: string;
  quantity: number;
  entryDate: string;
  status: string;
  breed?: Breed;
  species?: Species;
  barn?: Barn;
  pen?:Pen;
  animals:Animal
  

}

export interface InputCreateLot {
    farmId: number;
    herId?:number,
    barnId:number,
    name:string,
    photo?:string,
    speciesId:number,
    breedId:number,
    ageGroup:string,
    quantity:number,
    entryDate:string,
    status:string,
}