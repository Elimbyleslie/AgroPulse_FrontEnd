/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { FarmTask, FarmTaskPagination } from "../../models/farmTask";
import {
  getFarmTasks,
  createFarmTask,
  updateFarmTask,
  deleteFarmTask,
  updateFarmTaskStatus,
} from "./farmTaskAct";
import { AsyncState, LoadingType } from "../../models/store";
import { RootState } from "..";

interface FarmTaskState {
  taskList: AsyncState<FarmTask[] | null>;
  pagination: FarmTaskPagination | null;
  createState: { status: LoadingType; error: any };
  updateState: { status: LoadingType; error: any };
  deleteState: { status: LoadingType; error: any };
}

const initialState: FarmTaskState = {
  taskList: { entities: null, status: LoadingType.IDLE, error: null },
  pagination: null,
  createState: { status: LoadingType.IDLE, error: null },
  updateState: { status: LoadingType.IDLE, error: null },
  deleteState: { status: LoadingType.IDLE, error: null },
};

const toTaskArray = (value: unknown): FarmTask[] =>
  Array.isArray(value) ? (value as FarmTask[]) : [];

export const FarmTaskSlice = createSlice({
  name: "farmTasks",
  initialState,
  reducers: {
    resetFarmTaskCreateState(state) {
      state.createState = { status: LoadingType.IDLE, error: null };
    },
    resetFarmTaskUpdateState(state) {
      state.updateState = { status: LoadingType.IDLE, error: null };
    },
    resetFarmTaskDeleteState(state) {
      state.deleteState = { status: LoadingType.IDLE, error: null };
    },
  },
  extraReducers: (builder) => {
    // ── LIST ──
    builder
      .addCase(getFarmTasks.pending, (state) => {
        state.taskList.status = LoadingType.PENDING;
        state.taskList.error = null;
      })
      .addCase(getFarmTasks.fulfilled, (state, { payload }) => {
        state.taskList.status = LoadingType.SUCCESS;
        state.taskList.entities = toTaskArray(payload.data);
        state.pagination = payload.pagination ?? null;
      })
      .addCase(getFarmTasks.rejected, (state, { payload }) => {
        state.taskList.status = LoadingType.REJECTED;
        state.taskList.error = payload;
      });

    // ── CREATE ──
    builder
      .addCase(createFarmTask.pending, (state) => {
        state.createState = { status: LoadingType.PENDING, error: null };
      })
      .addCase(createFarmTask.fulfilled, (state, { payload }) => {
        state.createState.status = LoadingType.SUCCESS;
        const current = toTaskArray(state.taskList.entities);
        state.taskList.entities = [payload, ...current];
      })
      .addCase(createFarmTask.rejected, (state, { payload }) => {
        state.createState.status = LoadingType.REJECTED;
        state.createState.error = payload;
      });

    // ── UPDATE ──
    builder
      .addCase(updateFarmTask.pending, (state) => {
        state.updateState = { status: LoadingType.PENDING, error: null };
      })
      .addCase(updateFarmTask.fulfilled, (state, { payload }) => {
        state.updateState.status = LoadingType.SUCCESS;
        const current = toTaskArray(state.taskList.entities);
        state.taskList.entities = current.map((t) => (t.id === payload.id ? payload : t));
      })
      .addCase(updateFarmTask.rejected, (state, { payload }) => {
        state.updateState.status = LoadingType.REJECTED;
        state.updateState.error = payload;
      });

    // ── QUICK STATUS UPDATE (même logique que UPDATE) ──
    builder.addCase(updateFarmTaskStatus.fulfilled, (state, { payload }) => {
      const current = toTaskArray(state.taskList.entities);
      state.taskList.entities = current.map((t) => (t.id === payload.id ? payload : t));
    });

    // ── DELETE ──
    builder
      .addCase(deleteFarmTask.pending, (state) => {
        state.deleteState = { status: LoadingType.PENDING, error: null };
      })
      .addCase(deleteFarmTask.fulfilled, (state, { payload: deletedId }) => {
        state.deleteState.status = LoadingType.SUCCESS;
        const current = toTaskArray(state.taskList.entities);
        state.taskList.entities = current.filter((t) => t.id !== deletedId);
      })
      .addCase(deleteFarmTask.rejected, (state, { payload }) => {
        state.deleteState.status = LoadingType.REJECTED;
        state.deleteState.error = payload;
      });
  },
});

export const {
  resetFarmTaskCreateState,
  resetFarmTaskUpdateState,
  resetFarmTaskDeleteState,
} = FarmTaskSlice.actions;

export const selectFarmTaskList = (state: RootState) => state.farmTasks.taskList;
export const selectFarmTaskEntities = (state: RootState): FarmTask[] =>
  toTaskArray(state.farmTasks.taskList.entities);
export const selectFarmTaskPagination = (state: RootState) => state.farmTasks.pagination;
export const selectFarmTaskCreateState = (state: RootState) => state.farmTasks.createState;
export const selectFarmTaskUpdateState = (state: RootState) => state.farmTasks.updateState;
export const selectFarmTaskDeleteState = (state: RootState) => state.farmTasks.deleteState;

export default FarmTaskSlice;