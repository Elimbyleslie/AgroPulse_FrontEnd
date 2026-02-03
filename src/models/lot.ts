import { Barn } from "./barn";
import { Breed } from "./breed";
import { Pen } from "./pen";
import { Species } from "./species";

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