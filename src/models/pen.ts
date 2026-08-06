import { Animal } from "./animal";
import { FecthLot } from "./lot";
export interface Pen {
  id: number;
  barnId: number;
  name: string;
  capacity: number | null;
  animals:Animal;
  lots:FecthLot
}

export interface PenCreatePayload {
  barnId: number;
  name: string;
  capacity?: number | null;
}