import {
  Plan,
  Subscription,
  SubscriptionWithPlan,
  RenewalType,
} from "../../models/abonnementFacturation";
import { ApiError, ApiResponse, Pagination } from "../../models/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import { ROUTES, SUBSCRIPTION_ROUTES } from "../../constants/apiRoutes";
import { handleApiResult } from "../../lib/handleApiResult";
import extractApiError from "../../lib/errorextrator";


// ── Abonnements ──────────────────────────────────────────────────────────

export const fetchSubscriptions = createAsyncThunk<
  ApiResponse<SubscriptionWithPlan[]>,
  { organizationId: number; page?: number; limit?: number; status?: string; search?: string },
  { rejectValue: ApiError }
>("subscription/list", async (params, thunkAPI) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.status) query.append("status", params.status);
    if (params.search) query.append("search", params.search);

    const url = SUBSCRIPTION_ROUTES.LIST_BY_ORGANIZATION(params.organizationId);;

    const result = await fetchWithAuth(url, { method: "GET" });

    const error = handleApiResult(result, "Abonnements introuvables");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// Récupérer un abonnement par ID
export const getSubscriptionById = createAsyncThunk<
  ApiResponse<SubscriptionWithPlan>,
  number,
  { rejectValue: ApiError }
>("subscription/byId", async (id, thunkAPI) => {
  try {
    const result = await fetchWithAuth(
      SUBSCRIPTION_ROUTES.GET_BY_ID(id),
      { method: "GET" }
    );

    const error = handleApiResult(result, "Abonnement introuvable");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// Créer un abonnement
export const createSubscription = createAsyncThunk<
  ApiResponse<SubscriptionWithPlan>,
  { organizationId: number; planId: number; renewalType: RenewalType },
  { rejectValue: ApiError }
>("subscription/create", async (data, thunkAPI) => {
  try {
    const result = await fetchWithAuth(SUBSCRIPTION_ROUTES.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur lors de la création de l'abonnement");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// Mettre à jour un abonnement
export const updateSubscription = createAsyncThunk<
  ApiResponse<SubscriptionWithPlan>,
  { id: number; data: { planId?: number; renewalType?: RenewalType } },
  { rejectValue: ApiError }
>("subscription/update", async ({ id, data }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(SUBSCRIPTION_ROUTES.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const error = handleApiResult(result, "Erreur lors de la mise à jour");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// Annuler un abonnement
export const cancelSubscription = createAsyncThunk<
  ApiResponse<Subscription>,
  { id: number },
  { rejectValue: ApiError }
>("subscription/cancel", async ({ id }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(SUBSCRIPTION_ROUTES.CANCEL(id), {
      method: "POST",
    });

    const error = handleApiResult(result, "Erreur lors de l'annulation");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// Supprimer un abonnement
export const deleteSubscription = createAsyncThunk<
  ApiResponse<Subscription>,
  { id: number },
  { rejectValue: ApiError }
>("subscription/delete", async ({ id }, thunkAPI) => {
  try {
    const result = await fetchWithAuth(SUBSCRIPTION_ROUTES.DELETE(id), {
      method: "DELETE",
    });

    const error = handleApiResult(result, "Erreur lors de la suppression");
    if (error) return thunkAPI.rejectWithValue(extractApiError(error));

    return result!;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractApiError(error));
  }
});

// ── Plans ────────────────────────────────────────────────────────────────

export const fetchPlans = createAsyncThunk<
  ApiResponse<{ plans: Plan[]; pagination: Pagination }>,
  { page?: number; limit?: number },
  { rejectValue: ApiError }
>("plan/list", async (params, apiThunk) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());

    const result = await fetchWithAuth(
      `${ROUTES.LIST_PLANS}?${query.toString()}`,
      { method: "GET" },
    );
    if (!result)
      return apiThunk.rejectWithValue({
        meta: { message: "Aucune réponse du serveur", status: 500 },
      });
    const error = handleApiResult(result, "Plans introuvables");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const getPlanById = createAsyncThunk<
  ApiResponse<Plan>,
  number,
  { rejectValue: ApiError }
>("plan/byId", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(`${ROUTES.GET_PLAN_BY_ID}/${id}`, {
      method: "GET",
    });
    const error = handleApiResult(result, "Plan introuvable");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// CRUD plans (admin) — inclus pour complétude, non utilisé par le dashboard
// "Mon abonnement" qui ne fait que lister/choisir un plan.
export const createPlan = createAsyncThunk<
  ApiResponse<Plan>,
  Partial<Plan>,
  { rejectValue: ApiError }
>("plan/create", async (data, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.CREATE_PLAN, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const updatePlan = createAsyncThunk<
  ApiResponse<Plan>,
  { id: number; data: Partial<Plan> },
  { rejectValue: ApiError }
>("plan/update", async ({ id, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.UPDATE_PLAN(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la mise à jour");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

export const deletePlan = createAsyncThunk<
  ApiResponse<Plan>,
  { id: number },
  { rejectValue: ApiError }
>("plan/delete", async ({ id }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.DELETE_PLAN(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Erreur lors de la suppression");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});