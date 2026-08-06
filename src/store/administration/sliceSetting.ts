/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { ApiError } from "../../models/store";
import { Settings } from "../../models/administration";
import { RootState } from "..";
import {
  fetchSettings,
  getSettingsById,
  getSettingsByFarmId,
  createSettings,
  updateSettings,
  deleteSettings,
} from "./actionSetting";

interface Pagination {
  currentPage: number;
  previousPage?: number | null;
  nextPage?: number | null;
  totalItems: number;
  totalPages: number;
}

interface DomainState {
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

interface SettingsState {
  settingsList: Settings[];
  currentSettings: Settings | null; // settings de la ferme active
  settingsPagination: Pagination | null;
  settingsState: DomainState;
}

const domainInit = (): DomainState => ({
  loading: false,
  error: null,
  success: false,
});

const initialState: SettingsState = {
  settingsList: [],
  currentSettings: null,
  settingsPagination: null,
  settingsState: domainInit(),
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    resetSettingsState(state) {
      state.settingsState = domainInit();
    },
    clearCurrentSettings(state) {
      state.currentSettings = null;
    },
    /** Mettre à jour localement sans refetch (ex: après changement de thème) */
    patchCurrentSettings(state, action: { payload: Partial<Settings> }) {
      if (state.currentSettings) {
        state.currentSettings = {
          ...state.currentSettings,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    // LIST
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.settingsState.loading = true;
        state.settingsState.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settingsState.loading = false;
        const payload = action.payload.data as any;
        state.settingsList =
          payload?.items ?? payload?.settings ?? payload ?? [];
        state.settingsPagination = payload?.pagination ?? null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.settingsState.loading = false;
        state.settingsState.error = action.payload ?? null;
      });

    // GET BY ID
    builder
      .addCase(getSettingsById.pending, (state) => {
        state.settingsState.loading = true;
        state.currentSettings = null;
      })
      .addCase(getSettingsById.fulfilled, (state, action) => {
        state.settingsState.loading = false;
        state.currentSettings = action.payload.data as Settings;
      })
      .addCase(getSettingsById.rejected, (state, action) => {
        state.settingsState.loading = false;
        state.settingsState.error = action.payload ?? null;
      });

    // GET BY FARM
    builder
      .addCase(getSettingsByFarmId.pending, (state) => {
        state.settingsState.loading = true;
      })
      .addCase(getSettingsByFarmId.fulfilled, (state, action) => {
        state.settingsState.loading = false;
        const payload = action.payload.data as any;
        // backend peut renvoyer { items: [settings] } ou directement settings
        if (Array.isArray(payload)) {
          state.currentSettings = payload[0] ?? null;
        } else if (payload?.items && Array.isArray(payload.items)) {
          state.currentSettings = payload.items[0] ?? null;
        } else {
          state.currentSettings = payload as Settings;
        }
      })
      .addCase(getSettingsByFarmId.rejected, (state, action) => {
        state.settingsState.loading = false;
        state.settingsState.error = action.payload ?? null;
      });

    // CREATE
    builder
      .addCase(createSettings.pending, (state) => {
        state.settingsState = { loading: true, error: null, success: false };
      })
      .addCase(createSettings.fulfilled, (state, action) => {
        state.settingsState.loading = false;
        state.settingsState.success = true;
        const created = action.payload.data as Settings;
        state.settingsList.unshift(created);
        state.currentSettings = created;
      })
      .addCase(createSettings.rejected, (state, action) => {
        state.settingsState.loading = false;
        state.settingsState.error = action.payload ?? null;
      });

    // UPDATE
    builder
      .addCase(updateSettings.pending, (state) => {
        state.settingsState = { loading: true, error: null, success: false };
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settingsState.loading = false;
        state.settingsState.success = true;
        const updated = action.payload.data as Settings;
        state.settingsList = state.settingsList.map((s) =>
          s.id === updated.id ? updated : s,
        );
        if (state.currentSettings?.id === updated.id) {
          state.currentSettings = updated;
        }
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.settingsState.loading = false;
        state.settingsState.error = action.payload ?? null;
      });

    // DELETE
    builder
      .addCase(deleteSettings.pending, (state) => {
        state.settingsState = { loading: true, error: null, success: false };
      })
      .addCase(deleteSettings.fulfilled, (state, action) => {
        state.settingsState.loading = false;
        state.settingsState.success = true;
        const deletedId = action.meta.arg.id;
        state.settingsList = state.settingsList.filter(
          (s) => s.id !== deletedId,
        );
        if (state.currentSettings?.id === deletedId) {
          state.currentSettings = null;
        }
      })
      .addCase(deleteSettings.rejected, (state, action) => {
        state.settingsState.loading = false;
        state.settingsState.error = action.payload ?? null;
      });
  },
});

export const {
  resetSettingsState,
  clearCurrentSettings,
  patchCurrentSettings,
} = settingsSlice.actions;

// Selectors
export const selectSettingsList = (s: RootState) => s.settings.settingsList;
export const selectCurrentSettings = (s: RootState) =>
  s.settings.currentSettings;
export const selectSettingsState = (s: RootState) => s.settings.settingsState;
export const selectSettingsPagination = (s: RootState) =>
  s.settings.settingsPagination;

// Helpers pratiques
export const selectCurrency = (s: RootState) =>
  s.settings.currentSettings?.currency ?? "XOF";
export const selectLanguage = (s: RootState) =>
  s.settings.currentSettings?.language ?? "fr";
export const selectTimezone = (s: RootState) =>
  s.settings.currentSettings?.timezone ?? "Africa/Dakar";
export const selectPrimaryColor = (s: RootState) =>
  s.settings.currentSettings?.primaryColor ?? "#1e40af";

export default settingsSlice;