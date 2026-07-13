/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { Inventory, FeedUsage, AnimalFeeding, FeedingPlan } from "../../models/alimentation";
import { handleApiResult } from "../../lib/handleApiResult";
import { ROUTES } from "../../constants/apiRoutes";

export const fecthInventory = createAsyncThunk<
  ApiResponse<Inventory>,
  number, // ← farmId en paramètre
  { rejectValue: ApiError }
>("Inventory/list", async (farmId, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.INVENTORY_LIST}?farmId=${farmId}`, 
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    if (!result) return apiThunk.rejectWithValue({ meta: { message: "Aucune réponse du serveur", status: 500 } });
    const error = handleApiResult(result, "Stock introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createInventory = createAsyncThunk<
  ApiResponse<Inventory>,
  Inventory,
  { rejectValue: ApiError }
>("Inventory/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.INVENTORY_CREATE, {
      method: "POST",
     body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la creation");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getInventoryById = createAsyncThunk<
  ApiResponse<Inventory>,
  number,
  { rejectValue: ApiError }
>("Inventory/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.GET_INVENTORY_BY_ID}/${id}`);
    const error = handleApiResult(result, "Stock introuvables");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateInventory = createAsyncThunk<
  ApiResponse<Inventory>,
  { id: number; data:Inventory },
  { rejectValue: ApiError }
>("Inventory/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.INVENTORY_UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Stock introuvables");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const deleteInventory = createAsyncThunk<
  ApiResponse<Inventory>,
  { id: number },
  { rejectValue: ApiError }
>("Inventory/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.INVENTORY_DELETE(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Stock introuvables");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const fecthFeedUsage = createAsyncThunk<
  ApiResponse<FeedUsage>,
  number,
  { rejectValue: ApiError }
>("feedUsage/list", async (farmId, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.FEED_USAGE_LIST}?farmId=${farmId}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    const error = handleApiResult(result, "Usage introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});


export const createFeedUsage = createAsyncThunk<
  ApiResponse<FeedUsage>,
  FeedUsage,
  { rejectValue: ApiError }
>("feedasage/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.FEED_USAGE_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Usage introuvables");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const deleteFeedUsage = createAsyncThunk<
  ApiResponse<FeedUsage>,
  number,
  { rejectValue: ApiError }
>("feedUsage/delete", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.FEED_USAGE_DELETE(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Usage introuvables");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updateFeedUsage = createAsyncThunk<
  ApiResponse<FeedUsage>,
  { id: number; data: FeedUsage },
  { rejectValue: ApiError }
>("feedUsage/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.FEED_USAGE_UPDATE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Usage introuvables");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getFeedUsageById = createAsyncThunk<
  ApiResponse<FeedUsage[]>,
  number,
  { rejectValue: ApiError }
>("feedUsage/getByInventoryId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.FEED_USAGE_GET_BY_ID}/${id}`, {
      method: "GET",
    });
    const error = handleApiResult(result, "Usage introuvables");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const FecthAnimalFeeding = createAsyncThunk<
  ApiResponse<AnimalFeeding>,
  void,
  { rejectValue: ApiError }
>("animalFeeding/list", async (_, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.ANIMAL_FEEDING_LIST, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const error = handleApiResult(result, "Usage introuvables");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createAnimalFeeding = createAsyncThunk<
  ApiResponse<AnimalFeeding>,
  AnimalFeeding,
  { rejectValue: ApiError }
>("animalFeeding/create ", async (_, apithunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.ANIMAL_FEEDING_CREATE, {
      method: "POST",
      body: JSON.stringify(_),
    });
    const error = handleApiResult(result, "Usage introuvables");
    if (error) {
      return apithunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apithunk.rejectWithValue(extractApiError(error));
  }
});

export const updateAnimalFeeding = createAsyncThunk<
  ApiResponse<AnimalFeeding>,
  { id: number; data: AnimalFeeding },
  { rejectValue: ApiError }
>("animalFeeding/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.ANIMAL_FEEDING_UPDATE}/${id}`,
      {
        method: "put",
        body: JSON.stringify(data),
      },
    );
    const error = handleApiResult(result, "animalFeeding introuvables");

    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const deleteAnimalFeeding = createAsyncThunk<
  ApiResponse<AnimalFeeding>,
  { id: number },
  { rejectValue: ApiError }
>("animalFeeding/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.ANIMAL_FEEDING_DELETE}/${id}`,
      {
        method: "delete",
      },
    );
    const error = handleApiResult(result, "AnimalFeeding introuvables");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getAnimalFeedingById = createAsyncThunk<
  ApiResponse<AnimalFeeding>,
  { id: number },
  { rejectValue: ApiError }
>("AnimalFeeding/getOne", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.ANIMAL_FEEDING_GET_BY_ID}/${id}`,
      {
        method: "get",
      },
    );
    const error = handleApiResult(result, "animalFeeding introuvables");
    if (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});


export const fetchFeedingPlan = createAsyncThunk<
  ApiResponse<FeedingPlan>,
  number,
  { rejectValue: ApiError }
>("feedingPlan/list", async (farmId, apiThunk) => {
  try {
    const result = await fetchWithAuth(
      `${ROUTES.FEEDING_PLAN_LIST}?farmId=${farmId}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    console.log("voici ca :", farmId)
    const error = handleApiResult(result, "Plan introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const createFeedingPlan = createAsyncThunk<
ApiResponse<FeedingPlan>,
FeedingPlan,
{rejectValue: ApiError}
>("feedingPlan/create ", async (_, apithunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.FEEDING_PLAN_CREATE, {
            method: "POST",
            body: JSON.stringify(_),
        });
        const error = handleApiResult(result, "Usage introuvables");
        if (error) {
            return apithunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    }catch(error){
        return apithunk.rejectWithValue(extractApiError(error));
    }
})

export const getFeedingPlanById = createAsyncThunk<
ApiResponse<FeedingPlan>,
{ id: number },
{rejectValue: ApiError}
>("FeedingPlan/getOne", async ({ id }, apiThunk) => {
    try {
        const result = await fetchWithAuth(
            `${ROUTES.FEEDING_PLAN_GET_BY_ID}/${id}`,
            {
                method: "get",
            },
        );
        const error = handleApiResult(result, "FeedingPlan introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    }catch(error){
        return apiThunk.rejectWithValue(extractApiError(error));
    }
})


export const updateFeedingPlan = createAsyncThunk<
ApiResponse<FeedingPlan>,
{ id: number; data: FeedingPlan },
{rejectValue: ApiError}
>("FeedingPlan/update", async ({ id, data }, apiThunk) => {
    try {
        const result = await fetchWithAuth(ROUTES.FEEDING_PLAN_UPDATE(id),
            {
                method: "put",
                body: JSON.stringify(data),
            },
        );
        const error = handleApiResult(result, "FeedingPlan introuvables");
        if (error) {
            return apiThunk.rejectWithValue(extractApiError(error));
        }
        return result!;
    }catch(error){
        return apiThunk.rejectWithValue(extractApiError(error));
    }});

 export const deleteFeedingPlan = createAsyncThunk<
 ApiResponse<FeedingPlan>,
 {id: number},
 {rejectValue : ApiError}
 > ("FedingPlan/delete" , async ({id}, apiThunk) => {
    try{
    const result = await fetchWithAuth(ROUTES.FEEDING_PLAN_DELETE(id), {
    method: 'DELETE',
     } );

     const error =  handleApiResult(result, "feedingPlan introuvables");
     if (error){
        return apiThunk.rejectWithValue(extractApiError(error));
     }
     return result!;
    }catch(error){
        return apiThunk.rejectWithValue(extractApiError(error));
    }
 }

 )

// Crée un type qui reflète ce que le backend retourne réellement
type DistributeResult = {
  updatedPlan:  FeedingPlan;
  updatedStock: Inventory;
  conversion:   { from: any; to: any } | null;
};

export const distributeFeedingPlan = createAsyncThunk<
  ApiResponse<DistributeResult>,  // ← corrigé
  number,
  { rejectValue: ApiError }
>("feedingPlan/distribute", async (planId, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.FEEDING_PLAN_DISTRIBUTE(planId), {
      method: "POST",
    });
    const error = handleApiResult(result, "Erreur de distribution");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});