import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiError, ThunkApi,Pagination } from "../../models/store";
import { ROUTES } from "../../constants/apiRoutes";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { FarmUser, FarmUserCreateInput, FetchFarmUsersArgs } from "../../models/farmUser";


export const getFarmUsers = createAsyncThunk<
  { items: FarmUser[]; pagination: Pagination },
  FetchFarmUsersArgs,
  ThunkApi
>(
  "farmUser/list",
  async ({ farmId }, apiThunk) => {
    try {
      const result = await fetchWithAuth(`${ROUTES.FARM_USER_LIST}?farmId=${farmId}`);
      if (!result || result.meta?.status !== 200) {
        return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
      }
      return result.data ?? { items: [], pagination: null };
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  },
);

export const addFarmUser = createAsyncThunk<FarmUser, FarmUserCreateInput, ThunkApi>(
  "farmUser/create",
  async (data, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.FARM_USER_CREATE, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!result || (result.meta?.status !== 200 && result.meta?.status !== 201)) {
        return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
      }
      return result.data;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  },
);

export const removeFarmUser = createAsyncThunk<number, number, ThunkApi>(
  "farmUser/delete",
  async (id, apiThunk) => {
    try {
      const result = await fetchWithAuth(ROUTES.FARM_USER_DELETE(id), { method: "DELETE" });
      if (!result || result.meta?.status !== 200) {
        return apiThunk.rejectWithValue(extractApiError(result) as ApiError);
      }
      return id;
    } catch (error) {
      return apiThunk.rejectWithValue(extractApiError(error));
    }
  },
);