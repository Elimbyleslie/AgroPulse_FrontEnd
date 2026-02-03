import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import { selectSpecies, selectSpeciesLoading, selectSpeciesError } from "../store/espece&Race/slice";
import { LoadingType } from "../models/store";
import { Species } from "../models/species";
import { getSpeciesList } from '../store/espece&Race/species';

export const useSpecies = (autoFetch: boolean = true) => {
  const dispatch = useAppDispatch();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData: any = useAppSelector(selectSpecies);
  const loading = useAppSelector(selectSpeciesLoading);
  const error = useAppSelector(selectSpeciesError);

  const species: Species[] = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if (rawData.data?.species) return rawData.data.species;
    if (Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, [rawData]);

  useEffect(() => {
    if (autoFetch && species.length === 0 && loading === LoadingType.IDLE) {
      dispatch(getSpeciesList());
    }
  }, [autoFetch, species.length, loading, dispatch]);

  const isLoading = loading === LoadingType.PENDING;
  const isSuccess = loading === LoadingType.SUCCESS;

  return {
    species, // Retourne maintenant toujours un tableau [Sp1, Sp2...]
    loading,
    isLoading,
    isSuccess,
    isError: loading === LoadingType.REJECTED,
    isEmpty: isSuccess && species.length === 0,
    error,
    refetch: () => dispatch(getSpeciesList()),
    searchSpecies: (query: string) => {
      if (!query) return species;
      const lowerQuery = query.toLowerCase();
      return species.filter(sp => sp.name.toLowerCase().includes(lowerQuery));
    },
    findById: (id: number) => species.find(sp => sp.id === id),
    count: species.length,
  };
};