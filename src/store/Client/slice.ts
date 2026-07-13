/* eslint-disable @typescript-eslint/no-explicit-any */
// store/client/slice.ts
import { createSlice } from "@reduxjs/toolkit";
import { AsyncState, LoadingType } from "../../models/store";
import { Client } from "../../models/client";
import {
  fetchClients,
  fetchClientById,
  createClient,
  updateClient,
  deleteClient,
} from "./action";

interface ClientListState extends AsyncState<Client[]> {
  pagination: any | null;
}

interface ClientState {
  list: ClientListState;
  current: AsyncState<Client | null>;
  operationStatus: LoadingType;
  operationError: string | null;
}

const initialState: ClientState = {
  list: {
    entities: [],
    pagination: null,
    status: LoadingType.IDLE,
    error: null,
  },
  current: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
  },
  operationStatus: LoadingType.IDLE,
  operationError: null,
};

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    resetClientList: (state) => {
      state.list = { ...initialState.list };
    },
    resetCurrentClient: (state) => {
      state.current = { ...initialState.current };
    },
    clearOperationError: (state) => {
      state.operationError = null;
      state.operationStatus = LoadingType.IDLE;
    },
    resetClientState: () => initialState,
  },
  extraReducers: (builder) => {
    // ====================== FETCH ALL ======================
    builder
      .addCase(fetchClients.pending, (state) => {
        state.list.status = LoadingType.PENDING;
        state.list.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        console.log("✅ fetchClients fulfilled - payload complet :", action.payload); // Debug

        state.list.status = LoadingType.SUCCESS;
        state.list.error = null;

        // Extraction ultra-défensive
        const payloadData: any = (action.payload as any)?.data || (action.payload as any);
        state.list.entities = payloadData?.clients ?? [];
        state.list.pagination = payloadData?.pagination ?? null;

        console.log("📊 Clients stockés dans Redux :", state.list.entities.length);
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.list.status = LoadingType.REJECTED;
        state.list.error = action.payload?.meta?.message || action.error?.message || "Erreur de chargement";
        console.error("❌ fetchClients rejected :", action.payload);
      })

      // ====================== FETCH BY ID ======================
      .addCase(fetchClientById.pending, (state) => {
        state.current.status = LoadingType.PENDING;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.current.status = LoadingType.SUCCESS;
        state.current.entities = action.payload?.data ?? null;
      })
      .addCase(fetchClientById.rejected, (state) => {
        state.current.status = LoadingType.REJECTED;
      })

      // ====================== CREATE ======================
      .addCase(createClient.fulfilled, (state, action) => {
        state.operationStatus = LoadingType.SUCCESS;
        const newClient = action.payload?.data;
        if (newClient) {
          state.list.entities.unshift(newClient);
        }
      })

      // ====================== UPDATE ======================
      .addCase(updateClient.fulfilled, (state, action) => {
        state.operationStatus = LoadingType.SUCCESS;
        const updated = action.payload?.data;
        if (updated) {
          const index = state.list.entities.findIndex((c) => c.id === updated.id);
          if (index !== -1) state.list.entities[index] = updated;
        }
      })

      // ====================== DELETE ======================
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.operationStatus = LoadingType.SUCCESS;
        const deletedId = action.meta.arg;
        state.list.entities = state.list.entities.filter((c) => c.id !== deletedId);
      });
  },
});

export const {
  resetClientList,
  resetCurrentClient,
  clearOperationError,
  resetClientState,
} = clientSlice.actions;

export default clientSlice;