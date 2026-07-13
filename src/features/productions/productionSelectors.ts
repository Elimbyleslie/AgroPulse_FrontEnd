import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store"; // Ajuste le chemin selon ton architecture
import { LoadingType } from "../../models/store";

// Sélecteurs de base
export const selectProductionState = (state: RootState) => state.production;

export const selectProductionList = (state: RootState) => state.production.list;
export const selectCurrentProduction = (state: RootState) => state.production.current;
export const selectProductionStats = (state: RootState) => state.production.stats;
export const selectProductionOperation = (state: RootState) => ({
  status: state.production.operationStatus,
  error: state.production.operationError,
});

// ========================
// SÉLECTEURS POUR LA LISTE
// ========================

export const selectProductions = createSelector(
  selectProductionList,
  (list) => list.entities
);

export const selectProductionsPagination = createSelector(
  selectProductionList,
  (list) => list.pagination
);

export const selectProductionsLoading = createSelector(
  selectProductionList,
  (list) => list.status === LoadingType.PENDING
);

export const selectProductionsError = createSelector(
  selectProductionList,
  (list) => list.error
);

// ========================
// SÉLECTEURS POUR LE DÉTAIL
// ========================

export const selectCurrentProductionData = createSelector(
  selectCurrentProduction,
  (current) => current.entities
);

export const selectCurrentProductionLoading = createSelector(
  selectCurrentProduction,
  (current) => current.status === LoadingType.PENDING
);

export const selectCurrentProductionError = createSelector(
  selectCurrentProduction,
  (current) => current.error
);

// ========================
// SÉLECTEURS POUR LES STATS
// ========================

export const selectProductionStatsData = createSelector(
  selectProductionStats,
  (stats) => stats.entities
);

export const selectProductionStatsLoading = createSelector(
  selectProductionStats,
  (stats) => stats.status === LoadingType.PENDING
);

export const selectProductionStatsError = createSelector(
  selectProductionStats,
  (stats) => stats.error
);

// ========================
// SÉLECTEURS COMBINÉS / UTILITAIRES
// ========================

export const selectIsProductionLoading = createSelector(
  [selectProductionList, selectCurrentProduction, selectProductionStats],
  (list, current, stats) =>
    list.status === LoadingType.PENDING ||
    current.status === LoadingType.PENDING ||
    stats.status === LoadingType.PENDING
);

export const selectHasProductionError = createSelector(
  [selectProductionList, selectCurrentProduction, selectProductionStats, selectProductionOperation],
  (list, current, stats, operation) =>
    !!list.error || !!current.error || !!stats.error || !!operation.error
);

// Sélecteur pour vérifier si une production est en cours de création/mise à jour/suppression
export const selectIsOperationPending = createSelector(
  selectProductionOperation,
  (operation) => operation.status === LoadingType.PENDING
);

// Exemple : Récupérer une production par ID depuis la liste (utile pour cache)
export const selectProductionById = (id: number) =>
  createSelector(selectProductions, (productions) =>
    productions.find((p) => p.id === id)
  );