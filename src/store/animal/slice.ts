import { createSlice } from "@reduxjs/toolkit";
import { LoadingType, AsyncState } from "../../models/store";
import {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  unassignAnimal,
  assignAnimal,
} from "./action";
import { Animal } from "../../models/animal";
import { RootState } from "..";

export interface AnimalState {
  animalist: AsyncState<Animal[] | null>;
  selectedAnimal: AsyncState<Animal | null>;
  createAnimal: AsyncState<Animal | null>;
  updateAnimal: AsyncState<Animal | null>;
  deleteAnimal: AsyncState<Animal | null>;
  assignAnimal: AsyncState<Animal | null>;
  unassignAnimal: AsyncState<Animal | null>;
}

const initialState: AnimalState = {
  animalist: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  selectedAnimal: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  createAnimal: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  updateAnimal: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  deleteAnimal: {
    entities: null,
    error: null,
    status: LoadingType.IDLE,
  },
  assignAnimal: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  unassignAnimal: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
};

export const AnimalSlice = createSlice({
  name: "animal",
  initialState,
  reducers: {
    resetAnimalStatus: (state) => {
      state.selectedAnimal.status = LoadingType.IDLE;
      state.selectedAnimal.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAnimals.pending, (state) => {
        state.animalist.status = LoadingType.PENDING;
        state.animalist.error = null;
      })
      .addCase(getAllAnimals.fulfilled, (state, { payload }) => {
        state.animalist.status = LoadingType.SUCCESS;
        state.animalist.error = null;
        state.animalist.entities = payload.data.animals;
        state.animalist.pagination = payload.data.pagination;
      })
      .addCase(getAllAnimals.rejected, (state, { payload }) => {
        state.animalist.status = LoadingType.REJECTED;
        state.animalist.error = typeof payload === "string" ? payload : JSON.stringify(payload);
      });

    builder
      .addCase(getAnimalById.pending, (state) => {
        state.selectedAnimal.status = LoadingType.PENDING;
        state.selectedAnimal.error = null;
      })
      .addCase(getAnimalById.fulfilled, (state, { payload }) => {
        state.selectedAnimal.status = LoadingType.SUCCESS;
        state.selectedAnimal.error = null;
        state.selectedAnimal.entities = payload.data;
      })
      .addCase(getAnimalById.rejected, (state, { payload }) => {
        state.selectedAnimal.status = LoadingType.REJECTED;
        state.selectedAnimal.error = payload;
      });

    builder
      .addCase(createAnimal.pending, (state) => {
        state.createAnimal.status = LoadingType.PENDING;
        state.createAnimal.error = null;
      })
      .addCase(createAnimal.fulfilled, (state, { payload }) => {
        state.createAnimal.status = LoadingType.SUCCESS;
        state.createAnimal.error = null;
        state.createAnimal.entities = payload.data;
      })
      .addCase(createAnimal.rejected, (state, { payload }) => {
        state.createAnimal.status = LoadingType.REJECTED;
        state.createAnimal.error = payload;
      });

    builder
      .addCase(updateAnimal.pending, (state) => {
        state.updateAnimal.status = LoadingType.PENDING;
        state.updateAnimal.error = null;
      })
      .addCase(updateAnimal.fulfilled, (state, { payload }) => {
        state.updateAnimal.status = LoadingType.SUCCESS;
        state.updateAnimal.error = null;
        state.updateAnimal.entities = payload.data;
      })
      .addCase(updateAnimal.rejected, (state, { payload }) => {
        state.updateAnimal.status = LoadingType.REJECTED;
        state.updateAnimal.error = payload;
      });

    builder
      .addCase(deleteAnimal.pending, (state) => {
        state.deleteAnimal.status = LoadingType.PENDING;
        state.deleteAnimal.error = null;
      })
      .addCase(deleteAnimal.fulfilled, (state, { payload }) => {
        state.deleteAnimal.status = LoadingType.SUCCESS;
        state.deleteAnimal.error = null;
        state.deleteAnimal.entities = payload.data;
      })
      .addCase(deleteAnimal.rejected, (state, { payload }) => {
        state.deleteAnimal.status = LoadingType.REJECTED;
        state.deleteAnimal.error = payload;
      });

    builder
      .addCase(unassignAnimal.pending, (state) => {
        state.updateAnimal.status = LoadingType.PENDING;
        state.updateAnimal.error = null;
      })
      .addCase(unassignAnimal.fulfilled, (state, { payload }) => {
        state.updateAnimal.status = LoadingType.SUCCESS;
        state.updateAnimal.error = null;
        state.updateAnimal.entities = payload.data;
      })
      .addCase(unassignAnimal.rejected, (state, { payload }) => {
        state.updateAnimal.status = LoadingType.REJECTED;
        state.updateAnimal.error = typeof payload === "string" ? payload : JSON.stringify(payload);
      });
    builder
      .addCase(assignAnimal.pending, (state) => {
        state.updateAnimal.status = LoadingType.PENDING;
        state.updateAnimal.error = null;
      } )
      .addCase(assignAnimal.fulfilled, (state, { payload }) => {
        state.updateAnimal.status = LoadingType.SUCCESS;
        state.updateAnimal.error = null;
        state.updateAnimal.entities = payload.data;
      })
      .addCase(assignAnimal.rejected, (state, { payload }) => {
        state.updateAnimal.status = LoadingType.REJECTED;
        state.updateAnimal.error = typeof payload === "string" ? payload : JSON.stringify(payload);
      });
  },
});

export const { resetAnimalStatus } = AnimalSlice.actions;

export const selectgetAllAnimals = (state: RootState) =>
  state.animal.animalist;
export const selectgetAnimalById = (state: RootState) =>
  state.animal.selectedAnimal;
export const selectcreateAnimal = (state: RootState) =>
  state.animal.createAnimal;
export const selectupdateAnimal = (state: RootState) =>
  state.animal.updateAnimal;
export const selectdeleteAnimal = (state: RootState) =>
  state.animal.deleteAnimal;
export const selectAnimalQRCode = ( state:RootState) =>
state.animal.createAnimal.entities?.qrcode;


export default AnimalSlice;
