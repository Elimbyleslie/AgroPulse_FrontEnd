/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES } from "../../constants/apiRoutes";
import type {
  ReproductionCycleQuery,
  GestationQuery,
  CreateReproductionCyclePayload,
  UpdateReproductionCyclePayload,
  CreateGestationPayload,
  UpdateGestationPayload,
  CreateGestationCheckupPayload,
  UpdateGestationCheckupPayload,
  CreateGeneticPerformancePayload,
  UpdateGeneticPerformancePayload,
  CreatePedigreePayload,
  UpdatePedigreePayload,
} from "../../models/reproduction";


// ==================== REPRODUCTION CYCLES ====================

export const fetchReproductionCycles = createAsyncThunk(
  "reproduction/fetchCycles",
  async (params: ReproductionCycleQuery, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) query.append(key, String(val));
      });
      const result = await fetchWithAuth(
        `${ROUTES.REPRODOCTIONCYCLE_LIST}?${query}`,
      );
      console.log("API RAW result:", result); // ← ajoute ça
      return result;
    } catch (error: any) {
      return rejectWithValue(error?.meta?.message || "Erreur");
    }
  },
);

export const fetchReproductionCycleById = createAsyncThunk(
  "reproduction/fetchCycleById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.REPRODUCTIONCYCLE_GET_BY_ID(id));
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la récupération du cycle",
      );
    }
  },
);

export const createReproductionCycle = createAsyncThunk(
  "reproduction/createCycle",
  async (payload: CreateReproductionCyclePayload, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.REPRODUCTIONCYCLE_CREATE, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la création du cycle",
      );
    }
  },
);

export const updateReproductionCycle = createAsyncThunk(
  "reproduction/updateCycle",
  async (
    { id, ...payload }: UpdateReproductionCyclePayload,
    { rejectWithValue },
  ) => {
    try {
      return await fetchWithAuth(ROUTES.REPRODUCTIONCYCLE_UPDATE(id), {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la mise à jour du cycle",
      );
    }
  },
);

export const deleteReproductionCycle = createAsyncThunk(
  "reproduction/deleteCycle",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.REPRODUCTIONCYCLE_DELETE(id), {
        method: "DELETE",
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la suppression du cycle",
      );
    }
  },
);

// ==================== GESTATIONS ====================

export const fetchGestations = createAsyncThunk(
  "reproduction/fetchGestations",
  async (params: GestationQuery, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) query.append(key, String(val));
      });
      return await fetchWithAuth(`${ROUTES.GESTATIONLIST}?${query}`);
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la récupération des gestations",
      );
    }
  },
);

export const fetchGestationById = createAsyncThunk(
  "reproduction/fetchGestationById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.GESTATIONGETBYID(id));
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message ||
          "Erreur lors de la récupération de la gestation",
      );
    }
  },
);

export const createGestation = createAsyncThunk(
  "reproduction/createGestation",
  async (payload: CreateGestationPayload, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.GESTATIONCREATE, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la création de la gestation",
      );
    }
  },
);

export const updateGestation = createAsyncThunk(
  "reproduction/updateGestation",
  async ({ id, ...payload }: UpdateGestationPayload, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.GESTATIONUPDATE(id), {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la mise à jour de la gestation",
      );
    }
  },
);

export const deleteGestation = createAsyncThunk(
  "reproduction/deleteGestation",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.GESTATIONDELETE(id), {
        method: "DELETE",
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la suppression de la gestation",
      );
    }
  },
);

// ==================== GESTATION CHECKUPS ====================

export const fetchGestationCheckups = createAsyncThunk(
  "reproduction/fetchCheckups",
  async (
    {
      gestationId,
      page = 1,
      limit = 20,
    }: { gestationId: number; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      return await fetchWithAuth(
        `${ROUTES.GESTATION_CHECKUPS_LIST}?gestationId=${gestationId}&${query}`,
      );
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la récupération des contrôles",
      );
    }
  },
);

export const fetchGestationCheckupById = createAsyncThunk(
  "reproduction/fetchCheckupById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.GESTATION_CHECKUP_GET_BY_ID(id));
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la récupération du contrôle",
      );
    }
  },
);

export const createGestationCheckup = createAsyncThunk(
  "reproduction/createCheckup",
  async (payload: CreateGestationCheckupPayload, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.GESTATION_CHECKUP_CREATE, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la création du contrôle",
      );
    }
  },
);

export const updateGestationCheckup = createAsyncThunk(
  "reproduction/updateCheckup",
  async (
    { id, ...payload }: UpdateGestationCheckupPayload,
    { rejectWithValue },
  ) => {
    try {
      return await fetchWithAuth(ROUTES.GESTATION_CHECKUP_UPDATE(id), {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la mise à jour du contrôle",
      );
    }
  },
);

export const deleteGestationCheckup = createAsyncThunk(
  "reproduction/deleteCheckup",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.GESTATION_CHECKUP_DELETE(id), {
        method: "DELETE",
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la suppression du contrôle",
      );
    }
  },
);

// ==================== GENETIC PERFORMANCES ====================

  export const fetchGeneticPerformances = createAsyncThunk(
    "reproduction/fetchGeneticPerformances",
    async (
      args: { limit?: number; page?: number; farmId: number },
      apiThunk,
    ) => {
      try {
        const query = new URLSearchParams({
          farmId: String(args.farmId),
          page: String(args.page || 1),
          limit: String(args.limit || 20),
        });
        return await fetchWithAuth(`${ROUTES.GENETIC_PERFORMANCES_LIST}?${query}`);
      } catch (error: any) {
        return apiThunk.rejectWithValue(
          error?.meta?.message || "Erreur lors de la récupération des performances génétiques",
        );
      }

    },
  );

  export const fetchGeneticPerformanceById = createAsyncThunk(
    "reproduction/fetchGeneticPerformanceById",
    async (id: number, { rejectWithValue }) => {
      try {
        return await fetchWithAuth(ROUTES.GENETIC_PERFORMANCE_GET_BY_ID(id));
      } catch (error: any) {
        return rejectWithValue(
          error?.meta?.message ||
            "Erreur lors de la récupération de la performance génétique",
        );
      }
    },
  );

  export const createGeneticPerformance = createAsyncThunk(
    "reproduction/createGeneticPerformance",
    async (payload: CreateGeneticPerformancePayload, { rejectWithValue }) => {
        console.log("📦 Payload envoyé :", payload); // 
      try {
        return await fetchWithAuth(ROUTES.GENETIC_PERFORMANCE_CREATE, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch (error: any) {
        return rejectWithValue(
          error?.meta?.message ||
            "Erreur lors de la création de la performance génétique",
        );
      }
    },
  );

  export const updateGeneticPerformance = createAsyncThunk(
    "reproduction/updateGeneticPerformance",
    async (
      { id, ...payload }: UpdateGeneticPerformancePayload,
      { rejectWithValue },
    ) => {
      try {
        return await fetchWithAuth(ROUTES.GENETIC_PERFORMANCE_UPDATE(id), {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } catch (error: any) {
        return rejectWithValue(
          error?.meta?.message ||
            "Erreur lors de la mise à jour de la performance génétique",
        );
      }
    },
  );

  // Synchronisation automatique des performances d'un animal (Upsert)
  export const syncGeneticPerformance = createAsyncThunk(
    "reproduction/syncGeneticPerformance",
    async (animalId: number, { rejectWithValue }) => {
      try {
        // On passe l'animalId dans l'URL comme défini dans ton backend (req.params)
        const response = await fetchWithAuth(
          ROUTES.GENETIC_PERFORMANCE_SYNC(animalId),
          { method: "POST" },
        );
        return response.data; // Retourne l'objet performance mis à jour
      } catch (error: any) {
        return rejectWithValue(
          error?.meta?.message || "Erreur lors de la synchronisation génétique",
        );
      }
    },
  );

  // Récupération des statistiques globales de la ferme
  export const fetchGeneticStats = createAsyncThunk(
    "reproduction/fetchGeneticStats",
    async (farmId: number, { rejectWithValue }) => {
      try {
        // On passe le farmId en query param (req.query)
        const response = await fetchWithAuth(
          `${ROUTES.GENETIC_PERFORMANCE_STATS}?farmId=${farmId}`,
          { method: "GET" },
        );
        return response.data; // Retourne l'objet { total, averages, max, min, ... }
      } catch (error: any) {
        return rejectWithValue(
          error?.meta?.message || "Erreur lors du chargement des statistiques",
        );
      }
    },
  );

  export const deleteGeneticPerformance = createAsyncThunk(
    "reproduction/deleteGeneticPerformance",
    async (id: number, { rejectWithValue }) => {
      try {
        return await fetchWithAuth(ROUTES.GENETIC_PERFORMANCE_DELETE(id), {
          method: "DELETE",
        });
      } catch (error: any) {
        return rejectWithValue(
          error?.meta?.message ||
            "Erreur lors de la suppression de la performance génétique",
        );
      }
    },
  );

// ==================== PEDIGREE ====================

export const fetchPedigrees = createAsyncThunk(
  "reproduction/fetchPedigrees",
  async (
    {
      farmId,
      page = 1,
      limit = 20,
    }: { farmId: number; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const query = new URLSearchParams({
        farmId: String(farmId),
        page: String(page),
        limit: String(limit),
      });
      return await fetchWithAuth(`${ROUTES.PEDIGREE_LIST}?${query}`);
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la récupération des pedigrees",
      );
    }
  },
);

export const fetchPedigreeById = createAsyncThunk(
  "reproduction/fetchPedigreeById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.PEDIGREE_GET_BY_ID(id));
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la récupération du pedigree",
      );
    }
  },
);

export const createPedigree = createAsyncThunk(
  "reproduction/createPedigree",
  async (payload: CreatePedigreePayload, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.PEDIGREE_CREATE, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la création du pedigree",
      );
    }
  },
);

export const updatePedigree = createAsyncThunk(
  "reproduction/updatePedigree",
  async ({ id, ...payload }: UpdatePedigreePayload, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.PEDIGREE_UPDATE(id), {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la mise à jour du pedigree",
      );
    }
  },
);

export const deletePedigree = createAsyncThunk(
  "reproduction/deletePedigree",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(ROUTES.PEDIGREE_DELETE(id), {
        method: "DELETE",
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.meta?.message || "Erreur lors de la suppression du pedigree",
      );
    }
  },
);
