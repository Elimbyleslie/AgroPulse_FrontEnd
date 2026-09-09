/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import { ApiResponse, ThunkApi } from "../../models/store";
import {
  Consultation,
  FecthVaccination,
  FetchConsultation,
  Vaccination,
  Treatment,
  FetchTreatment,
} from "../../models/health";

// ======================================================
// CONSULTATIONS
// ======================================================

export const fetchConsultations = createAsyncThunk(
  "health/fetchConsultations",
  async (farmId: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(
        `${ROUTES.LIST_CONSULTATIONS}?farmId=${farmId}`,
      );
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
);

export const fetchConsultationById = createAsyncThunk(
  "health/fetchConsultationById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`${ROUTES.GET_CONSULTATION_BY_ID}/${id}`);
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
);

export const createConsultation = createAsyncThunk<
  ApiResponse<FetchConsultation>,
  Consultation,
  ThunkApi
>("health/create-consultation", async (consultation, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(`${ROUTES.CREATE_CONSULTATION}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consultation),
    });
  } catch (error: any) {
    return rejectWithValue(error);
  }
});

export const updateConsultation = createAsyncThunk<
  ApiResponse<FetchConsultation>,
  { id: number; data: Consultation },
  ThunkApi
>("health/update-consultation", async ({ id, data }, { rejectWithValue }) => {
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

// ======================================================
// VACCINATIONS
// ======================================================

export const fetchVaccination = createAsyncThunk(
  "health/fetchVaccinations",
  async (
    params: {
      farmId?: number | string;
      animalId?: number;
      lotId?: number;
      page?: number;
      limit?: number;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const query = new URLSearchParams();
      if (params.farmId) query.append("farmId", String(params.farmId));
      if (params.animalId) query.append("animalId", String(params.animalId));
      if (params.lotId) query.append("lotId", String(params.lotId));
      if (params.page) query.append("page", String(params.page));
      if (params.limit) query.append("limit", String(params.limit));

      const qs = query.toString();
      return await fetchWithAuth(
        `${ROUTES.ANIMAL_VACCINATION_LIST}${qs ? `?${qs}` : ""}`,
      );
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
);

export const fetchVaccinationById = createAsyncThunk(
  "health/fetchVaccinationById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(
        `${ROUTES.ANIMAL_VACCINATION_GET_BY_ID}/${id}`,
      );
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
);

export const createAnimalVaccination = createAsyncThunk<
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

export const updateAnimalVaccination = createAsyncThunk<
  ApiResponse<FecthVaccination>,
  { id: number; data: Vaccination },
  ThunkApi
>("health/update-vaccination", async ({ id, data }, { rejectWithValue }) => {
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

export const deleteAnimalVaccination = createAsyncThunk<
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

// ======================================================
// TREATMENTS
// ======================================================

export const fetchTreatments = createAsyncThunk(
  "health/fetchTreatments",
  async (
    params: {
      farmId?: number | string;
      animalId?: number;
      lotId?: number;
      page?: number;
      limit?: number;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const query = new URLSearchParams();
      if (params.farmId) query.append("farmId", String(params.farmId));
      if (params.animalId) query.append("animalId", String(params.animalId));
      if (params.lotId) query.append("lotId", String(params.lotId));
      if (params.page) query.append("page", String(params.page));
      if (params.limit) query.append("limit", String(params.limit));

      const qs = query.toString();
      return await fetchWithAuth(
        `${ROUTES.ANIMAL_TREATMENT_LIST}${qs ? `?${qs}` : ""}`,
      );
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
);

export const fetchTreatmentById = createAsyncThunk(
  "health/fetchTreatmentById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`${ROUTES.ANIMAL_TREATMENT_GET_BY_ID}/${id}`);
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
);

export const createAnimalTreatment = createAsyncThunk<
  ApiResponse<FetchTreatment>,
  Treatment,
  ThunkApi
>("health/create-treatment", async (treatment, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(`${ROUTES.ANIMAL_TREATMENT_CREATE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(treatment),
    });
  } catch (error: any) {
    return rejectWithValue(error);
  }
});

export const updateAnimalTreatment = createAsyncThunk<
  ApiResponse<FetchTreatment>,
  { id: number; data: Treatment },
  ThunkApi
>("health/update-treatment", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(`${ROUTES.ANIMAL_TREATMENT_UPDATE(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return rejectWithValue(error);
  }
});

export const deleteAnimalTreatment = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  ThunkApi
>("health/delete-treatment", async ({ id }, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(`${ROUTES.ANIMAL_TREATMENT_DELETE(id)}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return rejectWithValue(error);
  }
});

// ======================================================
// CONFIRMATIONS
// ======================================================

export const confirmAnimalVaccination = createAsyncThunk<
  ApiResponse<FecthVaccination>,
  { id: number },
  ThunkApi
>("health/confirm-vaccination", async ({ id }, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(`${ROUTES.ANIMAL_VACCINATION_UPDATE(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vaccinated: true }),
    });
  } catch (error: any) {
    return rejectWithValue(error);
  }
});

export const confirmAnimalTreatment = createAsyncThunk<
  ApiResponse<FetchTreatment>,
  { id: number },
  ThunkApi
>("health/confirm-treatment", async ({ id }, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(`${ROUTES.ANIMAL_TREATMENT_UPDATE(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ treated: true }),
    });
  } catch (error: any) {
    return rejectWithValue(error);
  }
});
