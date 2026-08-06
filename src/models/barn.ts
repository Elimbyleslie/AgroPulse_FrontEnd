import { Pen } from "./pen";
import { FecthLot } from "./lot";
import { Herd } from "./herd";

export interface Barn {
  id: number;
  farmId: number;
  name: string;
  capacity: number | null;
  photo: string | null;
  createdAt: Date;
  pens?: Pen[];
  lots?: FecthLot[];
  herd:Herd
  
}
