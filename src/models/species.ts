import { Breed } from './breed';
import { Animal } from './animal';

export interface Species {
  id: number;
  code: string;
  name: string;
  breeds: Breed[];
  herds: unknown[];
  lots: unknown[];
  animals: Animal[];
}