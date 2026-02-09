// src/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { FlexibleLoginPayload, LoginFormData } from '../../types/auth/login';
import type { SignUpFormData, SignUpSuccessResponse } from '../../types/auth/signup';
import type { AuthUser, AuthState, UserRole } from '../../types/auth/common';
import { API_ENDPOINTS } from '../../api/endpoints';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk<
  FlexibleLoginPayload,
  LoginFormData,
  { rejectValue: { message: string } }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_ENDPOINTS.auth.login, credentials);
    return response.data;
  } catch (err: any) {
    const message = err.response?.data?.message || 'Login failed.';
    return rejectWithValue({ message });
  }
});

export const signup = createAsyncThunk<
  SignUpSuccessResponse,
  SignUpFormData,
  { rejectValue: { message: string } }
>('auth/signup', async (userData, { rejectWithValue }) => {
  try {
    debugger;
    const response = await axios.post(API_ENDPOINTS.auth.register, userData);
    return response.data;
  } catch (err: any) {
    debugger;
    const message = err.response?.data?.message || 'Signup failed.';
    return rejectWithValue({ message });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('hms_user');
        if (token && savedUser) {
          state.token = token;
          state.user = JSON.parse(savedUser);
          state.isAuthenticated = true;
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('hms_user');
        localStorage.removeItem('token_expiry');
      }
    },
  },
  extraReducers: (builder) => {
    const handleAuthSuccess = (state: AuthState, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      const payload = action.payload;
      const token = payload.token ?? payload.accessToken ?? payload.jwt ?? null;
      const rawUser = payload.user;

      if (rawUser) {
        const formattedUser: AuthUser = {
          id: rawUser.id ?? '',
          fullName: rawUser.fullName ?? 'User',
          email: rawUser.email ?? '',
          phone: rawUser.phone ?? '',
          role: rawUser.role as UserRole,
        };

        state.user = formattedUser;
        state.isAuthenticated = true;
        state.token = token;

        if (typeof window !== 'undefined') {
          if (token) localStorage.setItem('token', token);
          localStorage.setItem('hms_user', JSON.stringify(formattedUser));
        }
      }
    };

    builder
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, handleAuthSuccess)
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message ?? 'Login failed';
      })
      .addCase(signup.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(signup.fulfilled, handleAuthSuccess)
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message ?? 'Signup failed';
      });
  },
});

export const { logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;