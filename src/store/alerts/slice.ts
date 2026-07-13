/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FetchAlert } from "../../models/alerts";
import {
  createAlert, fetchAlertsByFarmId,
  updateAlert, deleteAlert, fetchAlertById,
} from "./action";
import { ApiResponse } from "../../models/store";
interface AlertsState {
  alerts: FetchAlert[];
  alert: FetchAlert | null;
  loading: boolean;
  error: string | null;
}

const initialState: AlertsState = {
  alerts: [],
  alert: null,
  loading: false,
  error: null,
};

export const alertsSlice = createSlice({
  name: "alerts",
  initialState,
 reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.error = null;
    },
    clearSelectedAlert: (state) => {
      state.alert = null;
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(createAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = [...state.alerts, action.payload.data];
      })
      .addCase(createAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.meta?.message || "Erreur inconnue";
      });

    builder
      .addCase(fetchAlertsByFarmId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlertsByFarmId.fulfilled,
  (state, action: PayloadAction<ApiResponse<any>>) => {
    state.loading = false;
    state.error = null;
    const data = action.payload.data as any;
    // ✅ Extrait le tableau quel que soit la forme de la réponse
    state.alerts = Array.isArray(data)
      ? data
      : Array.isArray(data?.alerts)
        ? data.alerts
        : [];
  }
)
      .addCase(fetchAlertsByFarmId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.meta?.message || "Erreur inconnue";
       });

    builder
      .addCase(updateAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
       })
      .addCase(updateAlert.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAlert = action.payload.data;
        state.alerts = state.alerts.map((alert) =>
          alert.id === updatedAlert.id ? updatedAlert : alert,
        );
      })
      .addCase(updateAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.meta?.message || "Erreur inconnue";
       });

    builder
      .addCase(deleteAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = state.alerts.filter(
            (alert) => alert.id !== (action.meta.arg as number),
        );
      })
      .addCase(deleteAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.meta?.message || "Erreur inconnue";
      });

    builder
    .addCase(fetchAlertById.fulfilled, (state, action) => {
      state.loading = false;
      state.alert = action.payload.data;
    })
    .addCase(fetchAlertById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.meta?.message || "Erreur inconnue";
    })
    .addCase(fetchAlertById.pending, (state) => {
      state.loading = true;
      state.error = null;    
    });
  },
});

  export  const { clearError, clearSuccess, clearSelectedAlert } = alertsSlice.actions;

  


export default alertsSlice;

