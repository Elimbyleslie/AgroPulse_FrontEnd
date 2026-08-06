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
import historySlice from "./AnimalHistory/slice";
import healthSlice from "./health/slice";
import alertsSlice from "./alerts/slice"
import reproductionSlice from "./Reproduction/slice";
import alimentationSlice from "./alimentations/slice";
import birthSlice from "./birth/slice";
import FinanceSlice from "./gestionFinanciere/slice";
import productionSlice from "./production/slice";
import clientSlice from "./Client/slice";
import stockMovementSlice from "./stockMovement/slice";
import  supplierSlice from "./achats&fournisseur/slice";
import equipmentSlice from "./equipments/slice";
import purchaseSlice from "./achats&fournisseur/purchaseSlice";
import feedStockSlice from "./alimentations/sliceStock";
import subscriptionSlice from "./Abonnement&Facturation/slice";
import paymentSlice from "./Abonnement&Facturation/historySlice";
import invoiceSlice from "./Abonnement&Facturation/sliceInvoice";
import rbacSlice from "./Role&Permission/slice";
import adminSlice from "./administration/slice";
import userSlice from "./auth/userSlice";
import settingsSlice from "./administration/sliceSetting";
import invitationSlice from "./administration/inviteSlice";

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
  [historySlice.name]: historySlice.reducer,
  [healthSlice.name]: healthSlice.reducer,
  [alertsSlice.name]: alertsSlice.reducer,
  [reproductionSlice.name]:reproductionSlice.reducer,
  [alimentationSlice.name]:alimentationSlice.reducer,
  [birthSlice.name]: birthSlice.reducer,
  [FinanceSlice.name]: FinanceSlice.reducer,
  [productionSlice.name]: productionSlice.reducer,
  [clientSlice.name]: clientSlice.reducer,
  [stockMovementSlice.name]: stockMovementSlice.reducer,
  [supplierSlice.name]: supplierSlice.reducer,
  [equipmentSlice.name]: equipmentSlice.reducer,
  [purchaseSlice.name]: purchaseSlice.reducer,
  [feedStockSlice.name]: feedStockSlice.reducer,
  [subscriptionSlice.name]: subscriptionSlice.reducer,
  [paymentSlice.name]: paymentSlice.reducer,
  [invoiceSlice.name]: invoiceSlice.reducer,
  [rbacSlice.name]: rbacSlice.reducer,
  [adminSlice.name]: adminSlice.reducer,
  [userSlice.name]: userSlice.reducer,
  [settingsSlice.name]: settingsSlice.reducer,
  [invitationSlice.name]:invitationSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  // devTools: `${env.NODE_ENV}` !== "production" || `${env.NODE_ENV}` !== "test" ,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
