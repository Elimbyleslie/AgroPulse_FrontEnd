import { useMemo } from "react";
import { useAppSelector } from "./store";
import { selectSpecies } from "../store/espece&Race/slice"; // On utilise la slice Species !

export const useBreeds = (options: { speciesId?: number } = {}) => {
  const { speciesId } = options;
  
  // On récupère toutes les espèces (qui contiennent leurs races respectives)
  const species = useAppSelector(selectSpecies);

  const breeds = useMemo(() => {
    if (!speciesId) return [];

    // On trouve l'espèce sélectionnée dans le tableau
    const selectedSpecie = species.find(
      (s) => Number(s.id) === Number(speciesId)
    );

    // On retourne ses races, ou un tableau vide
    return selectedSpecie?.breeds || [];
  }, [species, speciesId]);

  return {
    breeds,
    isLoading: false, // Pas de chargement car c'est local !
    isEmpty: breeds.length === 0,
  };
};