import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ThunkApi } from "../../models/store";
import { CreateAlert,FetchAlert } from "../../models/alerts";
import { ROUTES } from "../../constants/apiRoutes";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { handleApiResult } from "../../lib/handleApiResult";


// --- create Alerte ---
export const createAlert = createAsyncThunk<
  ApiResponse<FetchAlert>,
    CreateAlert,
    ThunkApi
  >("alerts/create", async (data, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.ALERT_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const error = handleApiResult(result, "Erreur de création de l'alerte");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));

      return result!;
    } catch (err) {
      return apiThunk.rejectWithValue(extractApiError(err));
    }
  });

  // getAllAlertes by farmId
export const fetchAlertsByFarmId = createAsyncThunk<
    ApiResponse<FetchAlert[]>,
    number,
    ThunkApi    
  >("alerts/getByFarmId", async (farmId, apiThunk) => {
    try {
      const result = await fetchWithAuth(`${ROUTES.ALERT_LIST}?farmId=${farmId}`, {
        method: "GET",
      });

      const error = handleApiResult(result, "Alertes introuvables");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));

      return result!;
    } catch (err) {
      return apiThunk.rejectWithValue(extractApiError(err));
    }
  });

  // update Alerte
export const updateAlert = createAsyncThunk<
  ApiResponse<FetchAlert>,
  { id: number; data: Partial<CreateAlert> },
  ThunkApi
  >("alerts/update", async ({ id, data }, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.ALERT_UPDATE(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const error = handleApiResult(result, "Erreur de mise à jour de l'alerte");
      if (error) return apiThunk.rejectWithValue(extractApiError(error));

      return result!;
    } catch (err) {
      return apiThunk.rejectWithValue(extractApiError(err));
    }
  });   

  // delete Alerte
export const deleteAlert = createAsyncThunk<
  ApiResponse<null>,
    number,
    ThunkApi
    >("alerts/delete", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.ALERTE_DELETE(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Erreur de suppression de l'alerte");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  } 
});

// get Alerte by id
export const fetchAlertById = createAsyncThunk<
  ApiResponse<FetchAlert>,
  number,
  ThunkApi
>("alerts/getById", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.ALERTE_GET_BY_ID}/${id}`, {
      method: "GET",
    });

    const error = handleApiResult(result, "Alerte introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));

    return result!;
  } catch (err) {
    return apiThunk.rejectWithValue(extractApiError(err));
  }
});