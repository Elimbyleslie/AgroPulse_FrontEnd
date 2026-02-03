import { createSlice } from "@reduxjs/toolkit";
import { getSpeciesList } from "./species";
import { Species } from "../../models/species";
import { ApiError, LoadingType } from "../../models/store";
import { RootState } from "..";

interface SpeciesState {
  data: Species[];
  loading: LoadingType;
  error: ApiError | null;
}

const initialState: SpeciesState = {
  data: [],
  loading: LoadingType.IDLE,
  error: null,
};

const speciesSlice = createSlice({
  name: "species",
  initialState,
  reducers: {
    clearSpeciesError: (state) => {
      state.error = null;
    },
    resetSpecies: (state) => {
      state.data = [];
      state.loading = LoadingType.IDLE;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSpeciesList.pending, (state) => {
        state.loading = LoadingType.PENDING;
        state.error = null;
      })
      .addCase(getSpeciesList.fulfilled, (state, action) => {
        state.loading = LoadingType.SUCCESS;
          state.data = action.payload?.data.species || [];
        state.error = null;
      })
      .addCase(getSpeciesList.rejected, (state, action) => {
        state.loading = LoadingType.REJECTED;
        state.error = action.payload || {
          meta: {
            message: "Erreur lors du chargement des espèces",
            status: 500,
          },
        };
      });
  },
});

export const { clearSpeciesError, resetSpecies } = speciesSlice.actions;

// ✅ Selectors
export const selectSpecies = (state: RootState) => state.species.data;
export const selectSpeciesLoading = (state: RootState) => state.species.loading;
export const selectSpeciesError = (state: RootState) => state.species.error;

export default speciesSlice;
