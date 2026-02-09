import { AuthUser } from "./common";


// src/types/auth/login.ts
export interface LoginFormData {
  email: string;
  password: string;
  // rememberMe?: boolean;    // optional – if you want to add later
}

export interface LoginSuccessResponse {
  success: true;
  user: AuthUser;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;         // in seconds
  message?: string;
}
export interface FlexibleLoginPayload {
  success?: boolean;
  message?: string;
  token?: string;
  access_token?: string;
  expiresIn?: number;
  expiration?: string;
  user?: {
    id?: string;
    fullname?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    roles?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}
export interface LoginErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>; // e.g. { email: ["Invalid email"] }
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;