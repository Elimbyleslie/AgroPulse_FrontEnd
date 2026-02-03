import { createSlice } from "@reduxjs/toolkit";
import { getBreedsList } from "./breed";
import { Breed } from "../../models/breed";
import { ApiError, LoadingType } from "../../models/store";
import { RootState } from "..";

interface BreedState {
  data: Breed[];
  loading: LoadingType;
  error: ApiError | null;
}

const initialState: BreedState = {
  data: [],
  loading: LoadingType.IDLE,
  error: null,
};

const breedSlice = createSlice({
  name: "breeds",
  initialState,
  reducers: {
    clearBreedError: (state) => {
      state.error = null;
    },
    resetBreeds: (state) => {
      state.data = [];
      state.loading = LoadingType.IDLE;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBreedsList.pending, (state) => {
        state.loading = LoadingType.PENDING;
        state.error = null;
      })
      .addCase(getBreedsList.fulfilled, (state, action) => {
        state.loading = LoadingType.SUCCESS;
        state.data = action.payload?.data.breeds || [];
        state.error = null;
      })
      .addCase(getBreedsList.rejected, (state, action) => {
        state.loading = LoadingType.REJECTED;
        state.error = action.payload || {
            meta:{
          message: "Erreur lors du chargement des races",
          status: 500
        }
        }
      });
  },
});

export const { clearBreedError, resetBreeds } = breedSlice.actions;

// ✅ Selectors
export const selectBreeds = (state: RootState) => state.breeds.data;
export const selectBreedsLoading = (state: RootState) => state.breeds.loading;
export const selectBreedsError = (state: RootState) => state.breeds.error;

export default breedSlice;
