import { createSlice } from "@reduxjs/toolkit";
import { FarmUser } from "../../models/farmUser";
import { getFarmUsers, addFarmUser, removeFarmUser } from "./farmUserAct";
import { AsyncState, LoadingType ,Pagination } from "../../models/store";
import { RootState } from "..";

interface FarmUserState {
  list: AsyncState<FarmUser[] | null>;
  pagination: Pagination | null;
}
const initialState: FarmUserState = {
  list: { entities: null, status: LoadingType.IDLE, error: null },
  pagination: null,
};

const toArray = (value: unknown): FarmUser[] =>
  Array.isArray(value) ? (value as FarmUser[]) : [];

export const FarmUserSlice = createSlice({
  name: "farmUsers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFarmUsers.pending, (state) => {
        state.list.status = LoadingType.PENDING;
        state.list.error = null;
      })
      .addCase(getFarmUsers.fulfilled, (state, { payload }) => {
        state.list.status = LoadingType.SUCCESS;
        state.list.entities = payload.items.filter((fu) => !!fu);
        state.list.pagination = payload.pagination;
      })
      .addCase(getFarmUsers.rejected, (state, { payload }) => {
        state.list.status = LoadingType.REJECTED;
        state.list.error = payload;
      });

    builder.addCase(addFarmUser.fulfilled, (state, { payload }) => {
      const current = toArray(state.list.entities);
      state.list.entities = [...current, payload];
    });

    builder.addCase(
      removeFarmUser.fulfilled,
      (state, { payload: deletedId }) => {
        const current = toArray(state.list.entities);
        state.list.entities = current.filter((fu) => fu.id !== deletedId);
      },
    );
  },
});

export const selectFarmUsers = (state: RootState): FarmUser[] =>
  toArray(state.farmUsers.list.entities);
export const selectFarmUsersState = (state: RootState) => state.farmUsers.list;

export default FarmUserSlice;
