// src/types/auth/common.ts
export type UserRole =
  | 'Admin'
  | 'Doctor'
  | 'Nurse'
  | 'Receptionist'
  | 'patient'
  | 'Staff'
  | 'Pharmacist'
  | 'Lab_technician';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  hospitalId?: string;
  phone?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;       // JWT / access token
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}