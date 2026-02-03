import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Farm, FarmPagination } from "../../models/farm"; 
import {
  getAllFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  getUserFarms
} from './action';
import { AsyncState, LoadingType } from "../../models/store";
import { RootState } from "..";

interface FarmState {
  farmList: AsyncState<Farm[]> ; 
  pagination: FarmPagination | null; 
  farm: AsyncState<Farm | null>; 
  createFarm: AsyncState<Farm | null>;
  updateFarm: AsyncState<Farm | null>;
  deleteFarm: AsyncState<number | null>;
  currentFarm: Farm | null;
}

const initialState: FarmState = {
  farmList: {
    entities: [],
    status: LoadingType.IDLE,
    error: null,
  },
  pagination: null,
  farm: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  createFarm: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  updateFarm: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  deleteFarm: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  currentFarm: null,
};

export const FarmSlice = createSlice({
  name: "farms",
  initialState,
  reducers: {
    setCurrentFarm(state, action: PayloadAction<Farm>) {
      state.currentFarm = action.payload;
    },

    clearCurrentFarm(state) {
      state.currentFarm = null;
    },
    
    resetFarmStatus: (state) => {
      state.farm.status = LoadingType.IDLE;
      state.farm.error = null;
    },
    
    resetCreateFarmStatus: (state) => {
      state.createFarm.status = LoadingType.IDLE;
      state.createFarm.error = null;
    },
    
    resetUpdateFarmStatus: (state) => {
      state.updateFarm.status = LoadingType.IDLE;
      state.updateFarm.error = null;
    },
    
    resetDeleteFarmStatus: (state) => {
      state.deleteFarm.status = LoadingType.IDLE;
      state.deleteFarm.error = null;
    },
    
    clearFarmList: (state) => {
      state.farmList.entities = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    // ✅ GET ALL FARMS
    builder
      .addCase(getAllFarms.pending, (state) => {
        state.farmList.status = LoadingType.PENDING;
        state.farmList.error = null;
      })
      .addCase(getAllFarms.fulfilled, (state, { payload }) => {
        state.farmList.status = LoadingType.SUCCESS;
        state.farmList.error = null;
        const farms = Array.isArray(payload?.farms)
          ? payload.farms
          : payload?.farms
          ? [payload.farms]
          : [];
        state.farmList.entities = farms;
        state.pagination = payload?.pagination ?? state.pagination;
      })
      .addCase(getAllFarms.rejected, (state, { payload }) => {
        state.farmList.status = LoadingType.REJECTED;
        state.farmList.error = payload;
      });

    // ✅ GET USER FARMS
    builder
      .addCase(getUserFarms.pending, (state) => {
        state.farm.status = LoadingType.PENDING;
        state.farm.error = null;
      })
      .addCase(getUserFarms.fulfilled, (state, { payload }) => {
        state.farm.status = LoadingType.SUCCESS;
        state.farm.error = null;
       
        if (Array.isArray(payload.data)) {
          state.farmList.entities = payload.data;
          
        
          if (!state.currentFarm && payload.data.length > 0) {
            state.currentFarm = payload.data[0];
          }
        } else {
          
          state.farm.entities = payload.data;
        }
      })
      .addCase(getUserFarms.rejected, (state) => {
        state.farm.status = LoadingType.REJECTED;
        state.farm.error = null;
      });

    // ✅ GET FARM BY ID
    builder
      .addCase(getFarmById.pending, (state) => {
        state.farm.status = LoadingType.PENDING;
        state.farm.error = null;
      })
      .addCase(getFarmById.fulfilled, (state, { payload }) => {
        state.farm.status = LoadingType.SUCCESS;
        state.farm.error = null;
        state.farm.entities = payload;
      })
      .addCase(getFarmById.rejected, (state, { payload }) => {
        state.farm.status = LoadingType.REJECTED;
        state.farm.error = payload;
      });

    // ✅ CREATE FARM
    builder
      .addCase(createFarm.pending, (state) => {
        state.createFarm.status = LoadingType.PENDING;
        state.createFarm.error = null;
      })
      .addCase(createFarm.fulfilled, (state, { payload }) => {
        state.createFarm.status = LoadingType.SUCCESS;
        state.createFarm.error = null;
        state.createFarm.entities = payload;
        
        // ✅ Ajouter à la liste
        state.farmList.entities.unshift(payload);
        
        // ✅ Définir comme ferme actuelle si c'est la première
        if (!state.currentFarm) {
          state.currentFarm = payload;
        }
        
        // ✅ Mettre à jour la pagination
        if (state.pagination) {
          state.pagination.totalItems += 1;
        }
      })
      .addCase(createFarm.rejected, (state, { payload }) => {
        state.createFarm.status = LoadingType.REJECTED;
        state.createFarm.error = payload;
      });

    // ✅ UPDATE FARM
    builder
      .addCase(updateFarm.pending, (state) => {
        state.updateFarm.status = LoadingType.PENDING;
        state.updateFarm.error = null;
      })
      .addCase(updateFarm.fulfilled, (state, { payload }) => {
        state.updateFarm.status = LoadingType.SUCCESS;
        state.updateFarm.error = null;
        state.updateFarm.entities = payload;
        
        // ✅ Mettre à jour dans la liste
        const index = state.farmList.entities.findIndex(
          (farm) => farm.id === payload.id
        );
        if (index !== -1) {
          state.farmList.entities[index] = payload;
        }
        
        // ✅ Mettre à jour si c'est la ferme sélectionnée
        if (state.farm.entities?.id === payload.id) {
          state.farm.entities = payload;
        }
        
        // ✅ Mettre à jour currentFarm si c'est la même
        if (state.currentFarm?.id === payload.id) {
          state.currentFarm = payload;
        }
      })
      .addCase(updateFarm.rejected, (state, { payload }) => {
        state.updateFarm.status = LoadingType.REJECTED;
        state.updateFarm.error = payload;
      });

    // ✅ DELETE FARM
    builder
      .addCase(deleteFarm.pending, (state) => {
        state.deleteFarm.status = LoadingType.PENDING;
        state.deleteFarm.error = null;
      })
      .addCase(deleteFarm.fulfilled, (state, { payload }) => {
        state.deleteFarm.status = LoadingType.SUCCESS;
        state.deleteFarm.error = null;
        state.deleteFarm.entities = payload;
        
        // ✅ Supprimer de la liste
        state.farmList.entities = state.farmList.entities.filter(
          (farm) => farm.id !== payload
        );
        
        // ✅ Clear si c'est la ferme sélectionnée
        if (state.farm.entities?.id === payload) {
          state.farm.entities = null;
        }
        
        // ✅ Clear currentFarm si c'est la même
        if (state.currentFarm?.id === payload) {
          state.currentFarm = null;
        }
        
        // ✅ Mettre à jour la pagination
        if (state.pagination) {
          state.pagination.totalItems -= 1;
        }
      })
      .addCase(deleteFarm.rejected, (state, { payload }) => {
        state.deleteFarm.status = LoadingType.REJECTED;
        state.deleteFarm.error = payload;
      });
  },
});

export const { 
  setCurrentFarm, // ✅ CORRECTION: Exporter l'action
  clearCurrentFarm,
  resetFarmStatus,
  resetCreateFarmStatus,
  resetUpdateFarmStatus,
  resetDeleteFarmStatus,
  clearFarmList,
} = FarmSlice.actions;

// ✅ Sélecteurs
export const selectFarms = (state: RootState) => state.farms;

export const selectFarmList = (state: RootState) => state.farms.farmList;

export const selectCurrentFarm = (state: RootState) => state.farms.currentFarm; 

export const selectPagination = (state: RootState) => state.farms.pagination;

export const selectFarm = (state: RootState) => state.farms.farm;

export const selectCreateFarm = (state: RootState) => state.farms.createFarm;

export const selectUpdateFarm = (state: RootState) => state.farms.updateFarm;

export const selectDeleteFarm = (state: RootState) => state.farms.deleteFarm;

export default FarmSlice;