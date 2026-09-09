/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import { ApiResponse, ThunkApi } from "../../models/store";
import { AnimalHealthRecord } from "../../models/health";
import extractApiError from "../../lib/errorextrator";

// ======================================================
// GET ALL
// ======================================================
export const fetchAnimalHealthRecords = createAsyncThunk<
  ApiResponse<{ records: AnimalHealthRecord[]; pagination?: any }>,
  { farmId: number; animalId?: number; lotId?: number; page?: number; limit?: number },
  ThunkApi
>("animalHealthRecord/getAll", async (params, thunkAPI) => {
  try {
    const query = new URLSearchParams();
    query.append("farmId", String(params.farmId));
    if (params.animalId) query.append("animalId", String(params.animalId));
    if (params.lotId) query.append("lotId", String(params.lotId));
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));

    const response = await fetchWithAuth(
      `${ROUTES.ANIMAL_HEALTH_RECORD}?${query.toString()}`,
      { method: "GET" },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ======================================================
// GET BY ID
// ======================================================
export const getAnimalHealthRecordById = createAsyncThunk<
  ApiResponse<AnimalHealthRecord>,
  { id: number },
  ThunkApi
>("animalHealthRecord/getById", async ({ id }, thunkAPI) => {
  try {
    const response = await fetchWithAuth(
      `${ROUTES.ANIMAL_HEALTH_RECORD}/${id}`,
      { method: "GET" },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ======================================================
// CREATE
// ======================================================
export const createAnimalHealthRecord = createAsyncThunk<
  ApiResponse<AnimalHealthRecord>,
  AnimalHealthRecord & { farmId: number },
  ThunkApi
>("animalHealthRecord/create", async (payload, thunkAPI) => {
  try {
    const response = await fetchWithAuth(`${ROUTES.ANIMAL_HEALTH_RECORD}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ======================================================
// UPDATE
// ======================================================
export const updateAnimalHealthRecord = createAsyncThunk<
  ApiResponse<AnimalHealthRecord>,
  { id: number; data: Partial<AnimalHealthRecord> },
  ThunkApi
>("animalHealthRecord/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await fetchWithAuth(
      `${ROUTES.ANIMAL_HEALTH_RECORD}/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    const dataResponse = await response.json();
    return dataResponse;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ======================================================
// DELETE
// ======================================================
export const deleteAnimalHealthRecord = createAsyncThunk<
  ApiResponse<null>,
  { id: number },
  ThunkApi
>("animalHealthRecord/delete", async ({ id }, thunkAPI) => {
  try {
    const response = await fetchWithAuth(
      `${ROUTES.ANIMAL_HEALTH_RECORD_DELETE(id)}`,
      { method: "DELETE" },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});