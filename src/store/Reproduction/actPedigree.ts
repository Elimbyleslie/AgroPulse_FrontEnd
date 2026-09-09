/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import { ApiResponse, ThunkApi } from "../../models/store";
import { FetchPedigree, CreatePedigreePayload, UpdatePedigreePayload } from "../../models/pedigree"; 

// ======================================================
// GET PEDIGREE BY ANIMAL ID
// ======================================================
export const fetchPedigreeById = createAsyncThunk<
  ApiResponse<FetchPedigree>,
  number,
  ThunkApi
>("reproduction/fetchPedigreeById", async (animalId, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(ROUTES.PEDIGREE_GET_BY_ID(animalId));
  } catch (error: any) {
    return rejectWithValue(
      error?.meta?.message || "Erreur lors de la récupération du pedigree",
    );
  }
});

// ======================================================
// CREATE PEDIGREE
// ======================================================
export const createPedigree = createAsyncThunk<
  ApiResponse<FetchPedigree>,
  CreatePedigreePayload,
  ThunkApi
>("reproduction/createPedigree", async (payload, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(ROUTES.PEDIGREE_CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error: any) {
    return rejectWithValue(
      error?.meta?.message || "Erreur lors de la création du pedigree",
    );
  }
});

// ======================================================
// UPDATE PEDIGREE
// ======================================================
export const updatePedigree = createAsyncThunk<
  ApiResponse<FetchPedigree>,
  { animalId: number; data: UpdatePedigreePayload },
  ThunkApi
>("reproduction/updatePedigree", async ({ animalId, data }, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(ROUTES.PEDIGREE_UPDATE(animalId), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return rejectWithValue(
      error?.meta?.message || "Erreur lors de la mise à jour du pedigree",
    );
  }
});

// ======================================================
// DELETE PEDIGREE
// ======================================================
export const deletePedigree = createAsyncThunk<
  ApiResponse<number>,
  number,
  ThunkApi
>("reproduction/deletePedigree", async (animalId, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(ROUTES.PEDIGREE_DELETE(animalId), {
      method: "DELETE",
    });
  } catch (error: any) {
    return rejectWithValue(
      error?.meta?.message || "Erreur lors de la suppression du pedigree",
    );
  }
});

// ======================================================
// GET GENEALOGY TREE
// ======================================================
export const fetchGenealogyTree = createAsyncThunk(
  "reproduction/fetchGenealogyTree",
  async (
    { animalId, generations = 3 }: { animalId: number; generations?: number },
    { rejectWithValue },
  ) => {
    try {
      return await fetchWithAuth(ROUTES.PEDIGREE_TREE(animalId, generations));
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la récupération de l'arbre généalogique",
      );
    }
  },
);

// ======================================================
// CHECK CONSANGUINITY
// ======================================================
export const checkConsanguinity = createAsyncThunk(
  "reproduction/checkConsanguinity",
  async (
    { animal1Id, animal2Id }: { animal1Id: number; animal2Id: number },
    { rejectWithValue },
  ) => {
    try {
      return await fetchWithAuth(
        ROUTES.PEDIGREE_CONSANGUINITY(animal1Id, animal2Id),
      );
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de l'analyse de consanguinité",
      );
    }
  },
);