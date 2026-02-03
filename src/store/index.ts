import { combineReducers, configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./auth/slice";
import OrganizationSlice from "./organization/slice";
import FarmSlice from "./farm/slice";
import AnimalSlice from "./animal/slice";
import speciesSlice from "./espece&Race/slice";
import breedSlice from './espece&Race/sliceBreed'
import lotSlice from "./lot/slice";
import herdSlice from "./herd/slice";
import barnSlice from "./barn/slice";
import penSlice from "./pen/slice";
const rootReducer = combineReducers({   
  [AuthSlice.name]: AuthSlice.reducer,
  [OrganizationSlice.name]: OrganizationSlice.reducer,
  [FarmSlice.name]: FarmSlice.reducer,
  [AnimalSlice.name]: AnimalSlice.reducer,
  [speciesSlice.name]:speciesSlice.reducer,
  [breedSlice.name]:breedSlice.reducer,
  [lotSlice.name]: lotSlice.reducer,
  [herdSlice.name]: herdSlice.reducer,
  [barnSlice.name]: barnSlice.reducer,
  [penSlice.name]: penSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  // devTools: `${env.NODE_ENV}` !== "production" || `${env.NODE_ENV}` !== "test" ,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
