import {Equipement , EquipmentMaintenance, CreateEquipmentDto, CreateEquipmentMaintenanceDto} from "../../models/equipement&maintenance.js";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiError, ApiResponse } from "../../models/store.js";
import { ROUTES } from "../../constants/apiRoutes.js";
import { fetchWithAuth } from "../../lib/fetchwithAuth.js";
import extractApiError from "../../lib/errorextrator.js";
import { handleApiResult } from "../../lib/handleApiResult.js";


export const fetchEquipements = createAsyncThunk<
    ApiResponse<Equipement[]>,
    { page?: number; limit?: number },
    { rejectValue: ApiError }
>("equipement/list", async ({ page, limit }, apiThunk) => {
    try {
        const result = await fetchWithAuth(
            `${ROUTES.EQUIPMENT_LIST}?page=${page}&limit=${limit}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        if (!result) return apiThunk.rejectWithValue({ meta: { message: "Aucune réponse du serveur", status: 500 } });
        const error = handleApiResult(result, "Equipement introuvables");
        if (error) return apiThunk.rejectWithValue(extractApiError(error));
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});

export const createEquipement = createAsyncThunk<
    ApiResponse<Equipement>,
    CreateEquipmentDto,
    { rejectValue: ApiError }
>("equipement/create", async (data, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.EQUIPMENT_CREATE, {
            method: "POST",
            body: JSON.stringify(data),
        });
        const error = handleApiResult(result, "Equipement introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});

export const updateEquipement = createAsyncThunk<
    ApiResponse<Equipement>,
    { id: number; data: Equipement },
    { rejectValue: ApiError }
>("equipement/update", async ({ id, data }, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.EQUIPMENT_UPDATE(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
        const error = handleApiResult(result, "Equipement introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});

export const deleteEquipement = createAsyncThunk<
    ApiResponse<Equipement>,
    { id: number },
    { rejectValue: ApiError }
>("equipement/delete", async ({ id }, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.EQUIPMENT_DELETE(id), {
            method: "DELETE",
        });
        const error = handleApiResult(result, "Equipement introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});

export const fetchEquipementById = createAsyncThunk<
    ApiResponse<Equipement>,
    { id: number },
    { rejectValue: ApiError }   
>("equipement/fetchById", async ({ id }, apiThunk) => {
    try {
        const result = await fetchWithAuth(`${ROUTES.EQUIPMENT_GET_BY_ID}/${id}`, {
            method: "GET",
        });
        const error = handleApiResult(result, "Equipement introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});


export const fetchEquipementMaintenances = createAsyncThunk<
    ApiResponse<EquipmentMaintenance[]>,
    { page?: number; limit?: number },
    { rejectValue: ApiError }
>("equipementMaintenance/list", async ({ page, limit }, apiThunk) => {
    try {
        const result = await fetchWithAuth(
            `${ROUTES.EQUIPMENT_MAINTENANCE_LIST}?page=${page}&limit=${limit}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        if (!result) return apiThunk.rejectWithValue({ meta: { message: "Aucune réponse du serveur", status: 500 } });
        const error = handleApiResult(result, "Equipement introuvables");
        if (error) return apiThunk.rejectWithValue(extractApiError(error));
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});


export const createEquipementMaintenance = createAsyncThunk<
    ApiResponse<EquipmentMaintenance>,
    CreateEquipmentMaintenanceDto,
    { rejectValue: ApiError }
>("equipementMaintenance/create", async (data, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.EQUIPMENT_MAINTENANCE_CREATE, {
            method: "POST",
            body: JSON.stringify(data),
        });
        const error = handleApiResult(result, "Equipement introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});

export const updateEquipementMaintenance = createAsyncThunk<
    ApiResponse<EquipmentMaintenance>,
    { id: number; data: EquipmentMaintenance },
    { rejectValue: ApiError }
>("equipementMaintenance/update", async ({ id, data }, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.EQUIPMENT_MAINTENANCE_UPDATE(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
        const error = handleApiResult(result, "Equipement introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});

export const deleteEquipementMaintenance = createAsyncThunk<
    ApiResponse<EquipmentMaintenance>,
    { id: number },
    { rejectValue: ApiError }
>("equipementMaintenance/delete", async ({ id }, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.EQUIPMENT_MAINTENANCE_DELETE(id), {
            method: "DELETE",
        });
        const error = handleApiResult(result, "Equipement introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});

export const fetchEquipementMaintenanceById = createAsyncThunk<
    ApiResponse<EquipmentMaintenance>,
    { id: number },
    { rejectValue: ApiError }
>("equipementMaintenance/fetchById", async ({ id }, apiThunk) => {
    try {
        const result = await fetchWithAuth(`${ROUTES.EQUIPMENT_MAINTENANCE_GET_BY_ID}/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!result) return apiThunk.rejectWithValue({ meta: { message: "Aucune réponse du serveur", status: 500 } });
        const error = handleApiResult(result, "Equipement introuvables");
        if (error) return apiThunk.rejectWithValue(extractApiError(error));
        return result!;
    } catch (error) {
        return apiThunk.rejectWithValue(extractApiError(error));
    }
});