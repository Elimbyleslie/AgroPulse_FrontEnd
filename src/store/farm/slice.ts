  import { createSlice, PayloadAction } from "@reduxjs/toolkit";
  import { Farm, FarmPagination } from "../../models/farm";
  import {
    getAllFarms,
    getFarmById,
    createFarm,
    updateFarm,
    deleteFarm,
    getUserFarms,
  } from "./action";
  import { AsyncState, LoadingType } from "../../models/store";
  import { RootState } from "..";

  // ─── Types ────────────────────────────────────────────────────────────────────
interface FarmState {
  farmList: AsyncState<Farm[] | null>;
  pagination: FarmPagination | null;
  farm: AsyncState<Farm | null>;
  createFarm: AsyncState<Farm | null>;
  updateFarm: AsyncState<Farm | null>;
  deleteFarm: AsyncState<number | null>;
  currentFarm: Farm | null;
}

const initialState: FarmState = {
  farmList: { entities: null, status: LoadingType.IDLE, error: null },
  pagination: null,
  farm: { entities: null, status: LoadingType.IDLE, error: null },
  createFarm: { entities: null, status: LoadingType.IDLE, error: null },
  updateFarm: { entities: null, status: LoadingType.IDLE, error: null },
  deleteFarm: { entities: null, status: LoadingType.IDLE, error: null },
  currentFarm: null,
};

  // ─── Helper interne ───────────────────────────────────────────────────────────
const toFarmArray = (value: unknown): Farm[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value as Farm[];
  return [value as Farm];
};
  export const FarmSlice = createSlice({
    name: "farms",
    initialState,
    reducers: {
      setCurrentFarm(state, action: PayloadAction<Farm>) {
        state.currentFarm = action.payload;
        localStorage.setItem("last_farm_id", action.payload.id.toString());
      },
      clearCurrentFarm(state) {
        state.currentFarm = null;
        localStorage.removeItem("last_farm_id");
      },
      resetFarmStatus(state) {
        state.farm.status = LoadingType.IDLE;
        state.farm.error = null;
      },
      resetCreateFarmStatus(state) {
        state.createFarm.status = LoadingType.IDLE;
        state.createFarm.error = null;
      },
      resetUpdateFarmStatus(state) {
        state.updateFarm.status = LoadingType.IDLE;
        state.updateFarm.error = null;
      },
      resetDeleteFarmStatus(state) {
        state.deleteFarm.status = LoadingType.IDLE;
        state.deleteFarm.error = null;
      },
      clearFarmList(state) {
        state.farmList.entities = null;
        state.pagination = null;
      },
    },
    extraReducers: (builder) => {
      // ── GET ALL FARMS ─────────────────────────────────────────────────────────
      // action retourne : { farms: Farm[], pagination: FarmPagination }
      builder
        .addCase(getAllFarms.pending, (state) => {
          state.farmList.status = LoadingType.PENDING;
          state.farmList.error = null;
        })
        .addCase(getAllFarms.fulfilled, (state, { payload }) => {
          state.farmList.status = LoadingType.SUCCESS;
          state.farmList.error = null;

          const farms = toFarmArray(payload.farms);
          state.farmList.entities = farms;
          state.pagination = payload.pagination ?? state.pagination;

          // ← Toujours définir currentFarm depuis getAllFarms
          if (farms.length > 0) {
            state.currentFarm = farms[0];
          }
        })
        .addCase(getAllFarms.rejected, (state, { payload }) => {
          state.farmList.status = LoadingType.REJECTED;
          state.farmList.error = payload;
        });

      // ── GET USER FARMS ────────────────────────────────────────────────────────
      // action retourne : ApiResponse<Farm> — payload.data peut être Farm | Farm[]
      builder
        .addCase(getUserFarms.pending, (state) => {
          state.farm.status = LoadingType.PENDING;
          state.farm.error = null;
        })
        .addCase(getUserFarms.fulfilled, (state, { payload }) => {
          state.farm.status = LoadingType.SUCCESS;
          state.farm.error = null;

          const farms = toFarmArray(payload.data);
          state.farmList.entities = farms;

          // ← Toujours mettre à jour currentFarm
          if (farms.length > 0) {
            state.currentFarm = farms[0];
          }
        })
        .addCase(getUserFarms.rejected, (state, { payload }) => {
          state.farm.status = LoadingType.REJECTED;
          state.farm.error = typeof payload === "string" ? payload : null;
        });

      // ── GET FARM BY ID ────────────────────────────────────────────────────────
      // action retourne : Farm
      builder
        .addCase(getFarmById.pending, (state) => {
          state.farm.status = LoadingType.PENDING;
          state.farm.error = null;
        })
        .addCase(getFarmById.fulfilled, (state, { payload }) => {
          state.farm.status = LoadingType.SUCCESS;
          state.farm.error = null;
          state.farm.entities = payload;
          // Mettre à jour currentFarm si c'est la même ferme
          if (state.currentFarm?.id === payload.id) {
            state.currentFarm = payload;
          }
        })
        .addCase(getFarmById.rejected, (state, { payload }) => {
          state.farm.status = LoadingType.REJECTED;
          state.farm.error = payload;
        });

      // ── CREATE FARM ───────────────────────────────────────────────────────────
      // action retourne : Farm
      builder
        .addCase(createFarm.pending, (state) => {
          state.createFarm.status = LoadingType.PENDING;
          state.createFarm.error = null;
        })
        .addCase(createFarm.fulfilled, (state, { payload }) => {
          state.createFarm.status = LoadingType.SUCCESS;
          state.createFarm.error = null;
          state.createFarm.entities = payload;

          // Ajouter la nouvelle ferme à la liste
          const current = toFarmArray(state.farmList.entities);
          state.farmList.entities = [...current, payload];

          // Définir comme ferme active si c'est la première
          if (!state.currentFarm) {
            state.currentFarm = payload;
          }

          if (state.pagination) {
            state.pagination.totalItems += 1;
          }
        })
        .addCase(createFarm.rejected, (state, { payload }) => {
          state.createFarm.status = LoadingType.REJECTED;
          state.createFarm.error = payload;
        });

      // ── UPDATE FARM ───────────────────────────────────────────────────────────
      // action retourne : Farm
      builder
        .addCase(updateFarm.pending, (state) => {
          state.updateFarm.status = LoadingType.PENDING;
          state.updateFarm.error = null;
        })
        .addCase(updateFarm.fulfilled, (state, { payload }) => {
          state.updateFarm.status = LoadingType.SUCCESS;
          state.updateFarm.error = null;
          state.updateFarm.entities = payload;

          // Mettre à jour la ferme dans la liste
          const current = toFarmArray(state.farmList.entities);
          state.farmList.entities = current.map((f) =>
            f.id === payload.id ? payload : f,
          );

          // Mettre à jour currentFarm si c'est elle qui a été modifiée
          if (state.currentFarm?.id === payload.id) {
            state.currentFarm = payload;
          }
        })
        .addCase(updateFarm.rejected, (state, { payload }) => {
          state.updateFarm.status = LoadingType.REJECTED;
          state.updateFarm.error = payload;
        });

      // ── DELETE FARM ───────────────────────────────────────────────────────────
      // action retourne : number (l'id supprimé)
      builder
        .addCase(deleteFarm.pending, (state) => {
          state.deleteFarm.status = LoadingType.PENDING;
          state.deleteFarm.error = null;
        })
        .addCase(deleteFarm.fulfilled, (state, { payload: deletedId }) => {
          state.deleteFarm.status = LoadingType.SUCCESS;
          state.deleteFarm.error = null;
          state.deleteFarm.entities = deletedId;

          // Retirer la ferme supprimée de la liste
          const current = toFarmArray(state.farmList.entities);
          state.farmList.entities = current.filter((f) => f.id !== deletedId);

          // Reset currentFarm si c'était elle qui a été supprimée
          if (state.currentFarm?.id === deletedId) {
            const remaining = toFarmArray(state.farmList.entities);
            state.currentFarm = remaining[0] ?? null;
          }

          if (state.pagination) {
            state.pagination.totalItems = Math.max(
              0,
              state.pagination.totalItems - 1,
            );
          }
        })
        .addCase(deleteFarm.rejected, (state, { payload }) => {
          state.deleteFarm.status = LoadingType.REJECTED;
          state.deleteFarm.error = payload;
        });
    },
  });

  // ─── Actions ──────────────────────────────────────────────────────────────────
  export const {
    setCurrentFarm,
    clearCurrentFarm,
    resetFarmStatus,
    resetCreateFarmStatus,
    resetUpdateFarmStatus,
    resetDeleteFarmStatus,
    clearFarmList,
  } = FarmSlice.actions;

  // ─── Sélecteurs ───────────────────────────────────────────────────────────────
  export const selectFarms = (state: RootState) => state.farms;
  export const selectFarmList = (state: RootState) => state.farms.farmList;
  export const selectFarmEntities = (state: RootState): Farm[] =>
    toFarmArray(state.farms.farmList.entities); // ← sélecteur normalisé direct
  export const selectCurrentFarm = (state: RootState) => state.farms.currentFarm;
  export const selectPagination = (state: RootState) => state.farms.pagination;
  export const selectFarm = (state: RootState) => state.farms.farm;
  export const selectCreateFarm = (state: RootState) => state.farms.createFarm;
  export const selectUpdateFarm = (state: RootState) => state.farms.updateFarm;
  export const selectDeleteFarm = (state: RootState) => state.farms.deleteFarm;

  export default FarmSlice;
