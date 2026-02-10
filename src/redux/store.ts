import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice'; // <-- Added this import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer, // Successfully registered the user slice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// These exports allow your hooks to provide correct TypeScript suggestions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;