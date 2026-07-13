import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";

 
export const fetchAnimalHistory = createAsyncThunk(
  "animal/fetchHistory",
  async (animalId: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`/animals/${animalId}/history`, {
        method: "GET",
      });

      return response.data; 
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);