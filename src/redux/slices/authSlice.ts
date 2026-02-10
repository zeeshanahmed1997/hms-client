import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/endpoints';

import type { AuthState, AuthUser, UserRole } from '../../types/auth/common';
import type { LoginFormData } from '../../types/auth/login';
import type { SignUpFormData } from '../../types/auth/signup';

// ────────────────────────────────────────────────
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ────────────────────────────────────────────────
// Normalize different possible backend response shapes
// ────────────────────────────────────────────────
const normalizeAuthResponse = (payload: any): { token: string | null; user: AuthUser | null } => {
  const token = payload.token ?? payload.accessToken ?? payload.jwt ?? null;

  const rawUser = payload.user ?? payload.data?.user ?? {};
  if (!rawUser.id) return { token, user: null };

  return {
    token,
    user: {
      id: rawUser.id,
      fullName: rawUser.fullName ?? rawUser.name ?? 'User',
      email: rawUser.email ?? '',
      phone: rawUser.phone ?? '',
      role: (rawUser.roles[0] ?? 'patient') as UserRole,
    },
  };
};

// ────────────────────────────────────────────────
// Thunks
// ────────────────────────────────────────────────
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginFormData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_ENDPOINTS.auth.login, credentials);
       
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: SignUpFormData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_ENDPOINTS.auth.register, userData);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Signup failed');
    }
  }
);

// ────────────────────────────────────────────────
// Slice
// ────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('hms_user');
        localStorage.removeItem('token_expiry');
      }
    },

    initializeAuth: (state) => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('hms_user');

      if (token && savedUser) {
        try {
          state.token = token;
          state.user = JSON.parse(savedUser);
          state.isAuthenticated = true;
        } catch {
          // silent fail — corrupted storage
        }
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ─── Login ────────────────────────────────────────
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        const { token, user } = normalizeAuthResponse(action.payload);
 
        if (user && token) {
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
          state.error = null;

          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('hms_user', JSON.stringify(user));
          }
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? 'Login failed';
      })

      // ─── Signup ───────────────────────────────────────
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        const { token, user } = normalizeAuthResponse(action.payload);

        if (user && token) {
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
          state.error = null;

          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('hms_user', JSON.stringify(user));
          }
        }
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? 'Signup failed';
      });
  },
});

export const { logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;