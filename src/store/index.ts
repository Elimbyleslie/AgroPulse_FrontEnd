import { combineReducers, configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./auth/slice";

const rootReducer = combineReducers({
  
 [AuthSlice.name]: AuthSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  // devTools: `${env.NODE_ENV}` !== "production" || `${env.NODE_ENV}` !== "test" ,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
