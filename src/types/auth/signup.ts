import { AuthUser } from "./common";

// src/types/auth/signup.ts
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string; // Used for client-side check
  firstName: string;
  lastName: string;
  gender: string;
  role: string;
  age: number;
  department: string;
  address: string;
  phoneNumber: string;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  // hospitalCode?: string;
}

export interface SignUpSuccessResponse {
  success: true;
  user: AuthUser;
  message?: string;
  // auto-login token sometimes returned
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface SignUpErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type SignUpResponse = SignUpSuccessResponse | SignUpErrorResponse;