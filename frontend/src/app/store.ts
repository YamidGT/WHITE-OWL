import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "../features/map/mapSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    map: mapReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
