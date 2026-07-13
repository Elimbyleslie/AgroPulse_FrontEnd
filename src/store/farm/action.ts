// store/farm/action.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiError, ThunkApi } from "../../models/store";
import { ROUTES } from "../../constants/apiRoutes";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { 
  FarmCreateInput,
  FarmUpdateInput,
  Farm, 
  FetchFarmsArgs, 
  FarmPagination,
  BackendFarmResponse 
} from "../../models/farm";
import { ApiResponse } from '../../models/store'

type FarmListData = {
  farms: Farm;
  pagination: FarmPagination;
};

export const createFarm = createAsyncThunk<
  Farm,        
  FarmCreateInput,     
  ThunkApi             
>("farm/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      ROUTES.FARM_CREATE,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    // Vérifier le statut HTTP
    if (!result || (result.meta.status !== 200 && result.meta.status !== 201)) {
      return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
    }

   
    if (result.error) {
      return apiThunk.rejectWithValue(extractApiError(result.error) as ApiError);
    }

  
    if (!result.data) {
      return apiThunk.rejectWithValue({
      meta:{
        message: "Ferme introuvable",
        status: 404
      }
      } as ApiError);
    }

    // ✅ Retourner la ferme créée
    return result.data;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ✅ UPDATE FARM - Utilise FarmUpdateInput
export const updateFarm = createAsyncThunk<
  Farm,
  FarmUpdateInput,
  ThunkApi
>("farm/update", async (data, apiThunk) => {
  try {
    const { id, ...updateData } = data;
    
    const result = await fetchWithAuth(
      `${ROUTES.FARM_UPDATE}/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!result || result.meta.status !== 200) {
      return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
    }

    if (result.error) {
      return apiThunk.rejectWithValue(extractApiError(result.error) as ApiError);
    }

    if (!result.data) {
      return apiThunk.rejectWithValue({
      meta:{
        message: "Ferme introuvable",
        status: 404
      }
      } as ApiError);
    }

    return result.data;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ✅ GET ALL FARMS
export const getAllFarms = createAsyncThunk<
  FarmListData,
  FetchFarmsArgs,
  ThunkApi
>("farm/list", async (args, apiThunk) => {
  try {
    const searchParam = args.search ? `&search=${encodeURIComponent(args.search)}` : '';
    const result: BackendFarmResponse<FarmListData> = await fetchWithAuth(
      `${ROUTES.FARM_LIST}?limit=${args.limit}&page=${args.page || 1}${searchParam}`
    );

    if (!result || result.meta.status !== 200) {
      return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
    }

    if (result.error) {
      return apiThunk.rejectWithValue(extractApiError(result.error) as ApiError);
    }

    if (!result.data) {
      return apiThunk.rejectWithValue({
    meta: {
      message: "Donnees introuvables",
      status: 404
    }
      } as ApiError);
    }

    return result.data;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ✅ GET FARM BY ID
export const getFarmById = createAsyncThunk<
  Farm,
  number,
  ThunkApi
>("farm/get", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.FARM_GET_BY_ID}/${id}`
    );

    if (!result || result.meta.status !== 200) {
      return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
    }

    if (result.error) {
      return apiThunk.rejectWithValue(extractApiError(result.error) as ApiError);
    }

    if (!result.data) {
      return apiThunk.rejectWithValue({
     meta:{
      message: "Ferme introuvable",
      status: 404
     }
      } as ApiError);
    }

    return result.data;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ✅ DELETE FARM
export const deleteFarm = createAsyncThunk<
  number,
  number,
  ThunkApi
>("farm/delete", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.FARM_DELETE}/${id}`,
      { method: "DELETE" }
    );

    if (!result || result.meta.status !== 200) {
      return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
    }

    if (result.error) {
      return apiThunk.rejectWithValue(extractApiError(result.error) as ApiError);
    }

    return id;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getUserFarms = createAsyncThunk<
  ApiResponse<Farm>,
  void
>(
  "farms/getUserFarms",
  async (_, thunkApi) => {
    try {
      return await fetchWithAuth(`${ROUTES.MY_FARMS}`);
    } catch (err) {
      return thunkApi.rejectWithValue(err);
    }
  }
);