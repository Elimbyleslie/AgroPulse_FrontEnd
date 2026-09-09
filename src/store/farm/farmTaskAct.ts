import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiError, ThunkApi } from "../../models/store";
import { ROUTES } from "../../constants/apiRoutes";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import {
  FarmTask,
  FarmTaskCreateInput,
  FarmTaskUpdateInput,
  FetchFarmTasksArgs,
  FarmTaskPagination,
} from "../../models/farmTask";

type FarmTaskListData = {
  data: FarmTask[];
  pagination: FarmTaskPagination | null;
};

// ── LIST ──────────────────────────────────────────────────────────────────
export const getFarmTasks = createAsyncThunk<
  FarmTaskListData,
  FetchFarmTasksArgs | void,
  ThunkApi
>("farmTask/list", async (args, apiThunk) => {
  try {
  
const params = args ?? {};
const qs = new URLSearchParams();
qs.set("page", String(params.page ?? 1));
qs.set("limit", String(params.limit ?? 50));
if (params.farmId) qs.set("farmId", String(params.farmId));
if (params.status) qs.set("status", params.status);
if (params.search) qs.set("search", params.search);
if (params.assignedTo) qs.set("assignedTo", String(params.assignedTo)); 

   const result = await fetchWithAuth(`${ROUTES.FARM_TASK_LIST}?${qs}`);

if (!result || result.meta?.status !== 200) {
  return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
}
return {
  data: result.data?.tasks ?? [],
  pagination: result.data?.pagination ?? null,
};
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ── CREATE ────────────────────────────────────────────────────────────────
export const createFarmTask = createAsyncThunk<
  FarmTask,
  FarmTaskCreateInput,
  ThunkApi
>("farmTask/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.FARM_TASK_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!result || (result.meta?.status !== 200 && result.meta?.status !== 201)) {
      return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
    }
    if (!result.data) {
      return apiThunk.rejectWithValue({
        meta: { message: "Tâche introuvable après création", status: 404 },
      } as ApiError);
    }
    return result.data;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ── UPDATE ────────────────────────────────────────────────────────────────
export const updateFarmTask = createAsyncThunk<
  FarmTask,
  FarmTaskUpdateInput,
  ThunkApi
>("farmTask/update", async (data, apiThunk) => {
  try {
    const { id, ...updateData } = data;
    const result = await fetchWithAuth(ROUTES.FARM_TASK_UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(updateData),
    });

    if (!result || result.meta?.status !== 200) {
      return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
    }
    if (!result.data) {
      return apiThunk.rejectWithValue({
        meta: { message: "Tâche introuvable", status: 404 },
      } as ApiError);
    }
    return result.data;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// ── DELETE ────────────────────────────────────────────────────────────────
export const deleteFarmTask = createAsyncThunk<number, number, ThunkApi>(
  "farmTask/delete",
  async (id, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.FARM_TASK_DELETE(id), {
        method: "DELETE",
      });

      if (!result || result.meta?.status !== 200) {
        return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
      }
      return id;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  },
);

// ── QUICK STATUS UPDATE (helper pratique pour le calendrier/liste) ─────────
export const updateFarmTaskStatus = createAsyncThunk<
  FarmTask,
  { id: number; status: FarmTask["status"] },
  ThunkApi
>("farmTask/updateStatus", async ({ id, status }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.FARM_TASK_UPDATE(id), {
      method: "PUT",
      body: JSON.stringify({ status }),
    });

    if (!result || result.meta?.status !== 200) {
      return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
    }
    return result.data;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});