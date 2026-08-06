/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiResponse, ApiError } from "../../models/store";
import { fetchWithAuth } from "../../lib/fetchwithAuth";
import extractApiError from "../../lib/errorextrator";
import { handleApiResult } from "../../lib/handleApiResult";
import { ROUTES } from "../../constants/apiRoutes";
import { Invitation, InvitationValidation, InvitationCreateInput } from "../../models/invitations";

//  Générer un lien d'invitation (owner)
export const createInvitation = createAsyncThunk<
  ApiResponse<Invitation>,
  { organizationId: number; data: InvitationCreateInput },
  { rejectValue: ApiError }
>("invitations/create", async ({ organizationId, data }, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.INVITATION_CREATE(organizationId), {
      method: "POST",
      body: JSON.stringify(data),
    });
    const error = handleApiResult(result, "Erreur lors de la création de l'invitation");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// Lister les invitations d'une organisation
export const getOrganizationInvitations = createAsyncThunk<
  ApiResponse<Invitation[]>,
  number,
  { rejectValue: ApiError }
>("invitations/list", async (organizationId, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.INVITATION_LIST(organizationId), {
      method: "GET",
    });
    const error = handleApiResult(result, "Erreur lors de la récupération des invitations");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// Révoquer une invitation
export const deleteInvitation = createAsyncThunk<
  ApiResponse<null>,
  number,
  { rejectValue: ApiError }
>("invitations/delete", async (id, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.INVITATION_DELETE(id), {
      method: "DELETE",
    });
    const error = handleApiResult(result, "Erreur lors de la révocation");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});

// Valider un token d'invitation (public, appelé depuis la page d'inscription)
export const validateInvitation = createAsyncThunk<
  ApiResponse<InvitationValidation>,
  string,
  { rejectValue: ApiError }
>("invitations/validate", async (token, apiThunk) => {
  try {
    const result = await fetchWithAuth(ROUTES.INVITATION_VALIDATE(token), {
      method: "GET",
    });
    const error = handleApiResult(result, "Lien d'invitation invalide");
    if (error) return apiThunk.rejectWithValue(extractApiError(error));
    return result!;
  } catch (error) {
    return apiThunk.rejectWithValue(extractApiError(error));
  }
});