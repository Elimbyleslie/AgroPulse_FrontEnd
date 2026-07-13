import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import {  ApiResponse,ThunkApi } from "../../models/store";
import { Consultation,FecthVaccination,FetchConsultation, Vaccination } from "../../models/health";
/* eslint-disable @typescript-eslint/no-explicit-any */


// Récupérer toutes les consultations
export const fetchConsultations = createAsyncThunk(
  "health/fetchConsultations",
  async (farmId: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`${ROUTES.LIST_CONSULTATIONS}?farmId=${farmId}`);
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

//Recuperer une consultations

export const fetchConsultationById = createAsyncThunk(
  "health/fetchConsultationById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`${ROUTES.GET_CONSULTATION_BY_ID}/${id}`);
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);


// Creer une consultation
export const createConsultation = createAsyncThunk<
  ApiResponse<FetchConsultation>,
  Consultation,
  ThunkApi
>("health/create-consultation", async (consultation, { rejectWithValue }) => {
  try {
    console.log("[ACTION createConsultation] Payload reçu:", consultation);
    console.log("[ACTION createConsultation] farmId présent?", consultation.farmId);
    
    return await fetchWithAuth(`${ROUTES.CREATE_CONSULTATION}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consultation),
    });
  } catch (error: any) {
    return rejectWithValue(error);
  }
});

// Modifier une consultation
export const updateConsultation = createAsyncThunk<
  ApiResponse<FetchConsultation>,
  { id: number ; data: Consultation},
  ThunkApi
>("health/update-consultation", async ({ id , data }, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(`${ROUTES.UPDATE_CONSULTATION(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return rejectWithValue(error);
  }
});

// supprimer une consultation
export const deleteConsultation = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  ThunkApi
>("health/delete-consultation", async ({ id }, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(`${ROUTES.DELETE_CONSULTATION(id)}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return rejectWithValue(error);
  }
});


///vaccination 

// Récupérer le calendrier vaccinal
export const fetchVaccination = createAsyncThunk(
  "health/fetchVaccinations",
  async (farmId: string, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`${ROUTES.ANIMAL_VACCINATION_LIST}?farmId=${farmId}`);
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
//Recuperer une vaccination
export const fetchVaccinationById = createAsyncThunk(
  "health/fetchVaccinationById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`${ROUTES.ANIMAL_VACCINATION_GET_BY_ID}/${id}`);
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

//Creer une vaccination

export  const createAnimalVaccination = createAsyncThunk<
  ApiResponse<FecthVaccination>, 
  Vaccination,
  ThunkApi
  >("health/create-vaccination", async (vaccination, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`${ROUTES.ANIMAL_VACCINATION_CREATE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vaccination),
      });
    } catch (error: any) {
      return rejectWithValue(error);
    }
  });

  // modifier une vaccination 

  export  const updateAnimalVaccination = createAsyncThunk<
  ApiResponse<FecthVaccination>,
  { id: number ; data: Vaccination},
  ThunkApi
  >("health/update-vaccination", async ({ id , data }, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`${ROUTES.ANIMAL_VACCINATION_UPDATE(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      return rejectWithValue(error);
    }
  });

  //Supprimer une vaccination
  export  const deleteAnimalVaccination = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  ThunkApi
  >("health/delete-vaccination", async ({ id }, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`${ROUTES.ANIMAL_VACCINATION_DELETE(id)}`, {
        method: "DELETE",
      });
    } catch (error: any) {
      return rejectWithValue(error);
    }
  });