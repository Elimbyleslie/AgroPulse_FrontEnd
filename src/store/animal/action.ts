/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ThunkApi, ApiError } from "../../models/store";
import { ROUTES } from "../../constants/apiRoutes";
import { Animal } from "../../models/animal";
import { handleApiResult } from "../../lib/handleApiResult";

// GET ALL DE TOUT LES ANIMAUX WITH PAGINATION ET SEARCH
export const getAllAnimals = createAsyncThunk(
  "animal/list",
  async (args: { limit?: number; page?: number; farmId: number }, apiThunk) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", args.limit?.toString() || "10");
      params.append("page", (args.page || 1).toString());

      if (args.farmId) {
        params.append("farmId", args.farmId.toString());
      } else {
        return apiThunk.rejectWithValue("farmId obligatoire");
      }

      const result = await fetchWithAuth(
        `${ROUTES.ANIMAL_LIST}?${params.toString()}`,
      );

      return result;
    } catch (error) {
      return apiThunk.rejectWithValue(error);
    }
  },
);

//GET BY ID DE ANIMAL

export const getAnimalById = createAsyncThunk<
  ApiResponse<Animal>,
  number,
  ThunkApi
>("animal/get", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.ANIMAL_GET_BY_ID}/${id}`);

    const error = handleApiResult(result, "Animal introuvable");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

// CREATE ANIMAL

export const createAnimal = createAsyncThunk<
  ApiResponse<Animal>,
  FormData,
  ThunkApi
>("animal/create", async (formData, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.ANIMAL_CREATE, {
      method: "POST",
      body: formData,
    });
    const error = handleApiResult(result, "Erreur lors de la creation");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);
    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

// UPDATE ANIMAL

export const updateAnimal = createAsyncThunk<
  ApiResponse<Animal>,
  { id: number; data: any },
  ThunkApi
>("animal/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.ANIMAL_UPDATE(id)}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur lors de la modification");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});
// DELETE ANIMAL

export const deleteAnimal = createAsyncThunk<
  ApiResponse<null>,
  number,
  ThunkApi
>("animal/delete", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.ANIMAL_DELETE(id)}`, {
      method: "DELETE",
    });

    const error = handleApiResult(result, "Erreur lors de la suppression");
    if (error)
      return apiThunk.rejectWithValue(extractApiError(error) as ApiError);

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});

export const assignAnimal = createAsyncThunk(
  'animal/assign',
  async ({ id, data }: { id: number; data: { lotId?: number; herdId?: number; penId?: number } }, { rejectWithValue }) => {
    try {
      // Passer l'ID dans l'URL
      const result = await fetchWithAuth(`${ROUTES.ASSIGNANIMALTOLPH}/${id}`, {
        method: "POST",
        body: JSON.stringify(data), // Seulement lotId, herdId, penId
      });
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const unassignAnimal = createAsyncThunk(
  'animal/unassign',
  async (id: number, { rejectWithValue }) => {
    try {
      // Passer l'ID dans l'URL, pas dans le body
      const result = await fetchWithAuth(`${ROUTES.UNASSIGNANIMALFROMLPH}/${id}`, {
        method: "POST",
        // Pas de body nécessaire
      });
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
