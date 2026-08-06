/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  OrganizationInput,
  organizationRes,
  OrganizationUpdateInput,
} from "../../models/organization";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "..";
import { ROUTES } from "../../constants/apiRoutes";
import { fetchWithAuth } from "../../lib/fetchwithAuth"; 
import { ApiError, ApiResponse } from "../../models/store";

// 📋 Types
interface PaginationParams {
  page?: number;
  limit?: number;
}

interface OrganizationsResponse {
  message: string;
  status: number;
  data: {
    data: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// 1. Récupération globale
export const fetchWithAuthOrganizations = createAsyncThunk<
  OrganizationsResponse,
  PaginationParams | undefined,
  { state: RootState; rejectValue: ApiError }
>(
  "organizations/fetchWithAuthAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const url = queryParams.toString()
        ? `${ROUTES.ORGANIZATION_LIST}?${queryParams.toString()}`
        : ROUTES.ORGANIZATION_LIST;

      // fetchWithAuth gère déjà le token et le .json()
      return await fetchWithAuth(url);
    } catch (error: any) {
      // error est déjà formaté par fetchWithAuth : { meta: { message, status } }
      return rejectWithValue(error as ApiError);
    }
  }
);

// 2. Création + Refresh
export const createOrganization = createAsyncThunk<
  ApiResponse<organizationRes>,
  OrganizationInput,
  { state: RootState; rejectValue: ApiError }
>(
  "organizations/create",
  async (organizationData, { rejectWithValue, dispatch }) => {
    try {
      const data = await fetchWithAuth(`${ROUTES.ORGANIZATION_CREATE}`, {
        method: "POST",
        body: JSON.stringify(organizationData),
      });

      // On rafraîchit la liste immédiatement
      await dispatch(fetchWithAuthOrganizations({ page: 1, limit: 10 }));

      return data;
    } catch (error: any) {
      return rejectWithValue(error as ApiError);
    }
  }
);

// 3. Récupération par ID
export const fetchWithAuthOrganizationById = createAsyncThunk<
  any,
  number,
  { state: RootState; rejectValue: ApiError }
>("organizations/fetchWithAuthById", async (id, { rejectWithValue }) => {
  try {
    return await fetchWithAuth(ROUTES.ORGANIZATION_GET_BY_ID(id));
  } catch (error: any) {
    return rejectWithValue(error as ApiError);
  }
});

// 4. Update
export const updateOrganization = createAsyncThunk<
  any,
  { id: number; data: OrganizationUpdateInput },
  { state: RootState; rejectValue: ApiError }
>(
  "organizations/update",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const responseData = await fetchWithAuth(`${ROUTES.ORGANIZATION_UPDATE}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      dispatch(fetchWithAuthOrganizations());
      return responseData;
    } catch (error: any) {
      return rejectWithValue(error as ApiError);
    }
  }
);

// 5. Delete
export const deleteOrganization = createAsyncThunk<
  { id: number },
  number,
  { state: RootState; rejectValue: ApiError }
>(
  "organizations/delete",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await fetchWithAuth(`${ROUTES.ORGANIZATION_DELETE}/${id}`, {
        method: "DELETE",
      });

      dispatch(fetchWithAuthOrganizations());
      return { id };
    } catch (error: any) {
      return rejectWithValue(error as ApiError);
    }
  }
);