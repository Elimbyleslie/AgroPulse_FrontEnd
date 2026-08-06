/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { ApiError } from "../../models/store";
import { Invitation, InvitationValidation } from "../../models/invitations";
import { RootState } from "..";
import {
  createInvitation,
  getOrganizationInvitations,
  deleteInvitation,
  validateInvitation,
} from "./inviteAction";

interface DomainState {
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

const domainInit = (): DomainState => ({ loading: false, error: null, success: false });

interface InvitationState {
  invitations: Invitation[];
  lastCreated: Invitation | null;
  validation: InvitationValidation | null;
  listState: DomainState;
  createState: DomainState;
  validateState: DomainState;
}

const initialState: InvitationState = {
  invitations: [],
  lastCreated: null,
  validation: null,
  listState: domainInit(),
  createState: domainInit(),
  validateState: domainInit(),
};

const invitationSlice = createSlice({
  name: "invitations",
  initialState,
  reducers: {
    resetInvitationCreateState(state) {
      state.createState = domainInit();
      state.lastCreated = null;
    },
    resetInvitationValidateState(state) {
      state.validateState = domainInit();
      state.validation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInvitation.pending, (state) => {
        state.createState = { loading: true, error: null, success: false };
      })
      .addCase(createInvitation.fulfilled, (state, action) => {
        state.createState.loading = false;
        state.createState.success = true;
        const created = action.payload.data as Invitation;
        state.lastCreated = created;
        state.invitations.unshift(created);
      })
      .addCase(createInvitation.rejected, (state, action) => {
        state.createState.loading = false;
        state.createState.error = action.payload ?? null;
      });

    builder
      .addCase(getOrganizationInvitations.pending, (state) => {
        state.listState.loading = true;
        state.listState.error = null;
      })
      .addCase(getOrganizationInvitations.fulfilled, (state, action) => {
        state.listState.loading = false;
        state.invitations = (action.payload.data as Invitation[]) ?? [];
      })
      .addCase(getOrganizationInvitations.rejected, (state, action) => {
        state.listState.loading = false;
        state.listState.error = action.payload ?? null;
      });

    builder.addCase(deleteInvitation.fulfilled, (state, action) => {
      const deletedId = action.meta.arg;
      state.invitations = state.invitations.filter((i) => i.id !== deletedId);
    });

    builder
      .addCase(validateInvitation.pending, (state) => {
        state.validateState = { loading: true, error: null, success: false };
        state.validation = null;
      })
      .addCase(validateInvitation.fulfilled, (state, action) => {
        state.validateState.loading = false;
        state.validateState.success = true;
        state.validation = action.payload.data as InvitationValidation;
      })
      .addCase(validateInvitation.rejected, (state, action) => {
        state.validateState.loading = false;
        state.validateState.error = action.payload ?? null;
      });
  },
});

export const { resetInvitationCreateState, resetInvitationValidateState } = invitationSlice.actions;

export const selectInvitations = (s: RootState) => s.invitations.invitations;
export const selectInvitationListState = (s: RootState) => s.invitations.listState;
export const selectInvitationCreateState = (s: RootState) => s.invitations.createState;
export const selectLastCreatedInvitation = (s: RootState) => s.invitations.lastCreated;
export const selectInvitationValidation = (s: RootState) => s.invitations.validation;
export const selectInvitationValidateState = (s: RootState) => s.invitations.validateState;

export default invitationSlice;