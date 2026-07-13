
import { createSlice } from "@reduxjs/toolkit";
import { fetchAnimalHistory } from "./action";

interface AnimalEvent {
  date: string;
  type: string;
  title: string;
  description: string;
}

interface HistoryState {
  events: AnimalEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: HistoryState = {
  events: [],
  loading: false,
  error: null,
};

const historySlice = createSlice({
  name: "animalHistory",
  initialState,
  reducers: {
    resetHistory: (state) => {
      state.events = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnimalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnimalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload; 
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(fetchAnimalHistory.rejected, (state, action:any) => {
        state.loading = false;
        state.error = action.payload?.meta?.message || "Erreur inconnue";
      });
  },
});

export const { resetHistory } = historySlice.actions;

export default historySlice;