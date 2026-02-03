import { createSlice } from "@reduxjs/toolkit";
import {
  createOrganization,
  fetchWithAuthOrganizations,
  fetchWithAuthOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "./action";
import { LoadingType, ApiError } from "../../models/store";
import { RootState } from "..";
import { organizationRes } from "../../models/organization";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface OrganizationState {
  organizationList: {
    entities: organizationRes[];
    pagination: Pagination | null;
    status: LoadingType;
    error: ApiError | null;
  };
  currentOrganization: {
    entity: organizationRes | null;
    status: LoadingType;
    error: ApiError | null;
  };
  createOrganization: { status: LoadingType; error: ApiError | null };
  updateOrganization: { status: LoadingType; error: ApiError | null };
  deleteOrganization: { status: LoadingType; error: ApiError | null };
}

const initialState: OrganizationState = {
  organizationList: { entities: [], pagination: null, status: LoadingType.IDLE, error: null },
  currentOrganization: { entity: null, status: LoadingType.IDLE, error: null },
  createOrganization: { status: LoadingType.IDLE, error: null },
  updateOrganization: { status: LoadingType.IDLE, error: null },
  deleteOrganization: { status: LoadingType.IDLE, error: null },
};

const OrganizationSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {
    resetOrganizationStatus: (state) => {
      state.createOrganization.status = LoadingType.IDLE;
      state.createOrganization.error = null;
      state.updateOrganization.status = LoadingType.IDLE;
      state.deleteOrganization.status = LoadingType.IDLE;
    },
    clearCurrentOrganization: (state) => {
      state.currentOrganization.entity = null;
    },
  },
  extraReducers: (builder) => {
    // 📋 FETCH ALL
    builder
      .addCase(fetchWithAuthOrganizations.pending, (state) => {
        state.organizationList.status = LoadingType.PENDING;
        state.organizationList.error = null;
      })
      .addCase(fetchWithAuthOrganizations.fulfilled, (state, { payload }) => {
        state.organizationList.status = LoadingType.SUCCESS;
        // 💡 SYNCHRONISATION : On vérifie les deux structures possibles (imbriquée ou plate)
        const rawData = payload.data?.data || payload.data || payload;
        state.organizationList.entities = Array.isArray(rawData) ? rawData : [];
        state.organizationList.pagination = payload.data?.pagination || payload.data.pagination || null;
      })
      .addCase(fetchWithAuthOrganizations.rejected, (state, { payload }) => {
        state.organizationList.status = LoadingType.REJECTED;
        state.organizationList.error = payload as ApiError;
      });

    // 📌 FETCH BY ID
    builder
      .addCase(fetchWithAuthOrganizationById.fulfilled, (state, { payload }) => {
        state.currentOrganization.status = LoadingType.SUCCESS;
        state.currentOrganization.entity = payload.data || payload;
      });

    // ➕ CREATE
    builder
      .addCase(createOrganization.pending, (state) => {
        state.createOrganization.status = LoadingType.PENDING;
        state.createOrganization.error = null;
      })
      .addCase(createOrganization.fulfilled, (state) => {
        state.createOrganization.status = LoadingType.SUCCESS;
      })
      .addCase(createOrganization.rejected, (state, { payload }) => {
        state.createOrganization.status = LoadingType.REJECTED;
        // On récupère l'objet d'erreur balancé par rejectWithValue(error) dans l'action
        state.createOrganization.error = payload as ApiError;
      });

    // Les autres cas (update/delete) suivent la même logique rejected
    builder
      .addCase(updateOrganization.rejected, (state, { payload }) => {
        state.updateOrganization.status = LoadingType.REJECTED;
        state.updateOrganization.error = payload as ApiError;
      })
      .addCase(deleteOrganization.rejected, (state, { payload }) => {
        state.deleteOrganization.status = LoadingType.REJECTED;
        state.deleteOrganization.error = payload as ApiError;
      });
  },
});

export const { resetOrganizationStatus, clearCurrentOrganization } = OrganizationSlice.actions;

// Sélecteurs... (identiques)
export const selectOrganizations = (state: RootState) => state.organizations.organizationList.entities;
export const selectOrganizationsStatus = (state: RootState) => state.organizations.organizationList.status;
export const selectCreateOrganizationStatus = (state: RootState) => state.organizations.createOrganization.status;

export default OrganizationSlice;