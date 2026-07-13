import { Animal } from "./animal";

export interface Pedigree {
    id : number;
    animalId: number,
    motherId:number,
    fatherId:number,
    maternalGrandmotherId:number,
    maternalGrandfatherId:number,
    paternalGrandmotherId:number,
    paternalGrandfatherId:number,
    generation4Ids:number,
    completeness:number,
    verified:boolean,
    animal:Animal,
}