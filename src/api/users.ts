import axios, { AxiosError } from 'axios';
import { User } from '../redux/slices/userSlice';
import { API_ENDPOINTS } from '../api/endpoints';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[] | null;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors: string[] | null;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: number;
  address: string;
  password: string;
  gender: string;
  email: string;
  role: string;
  speciality?: string;
  consultationFee?: number;
  bloodGroup?: string;
  emergencyContact?: string;
  departmentId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

// FIX: Removed useQuery from here. This should be a pure async function.
export const fetchPatientsByDoctorApi = async (token: string, doctorId: number): Promise<ApiResponse<User[]>> => {
  try {
    const res = await axios.get<ApiResponse<User[]>>(
      API_ENDPOINTS.users.patientsByDoctor(doctorId), 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; 
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    const errorMessage = err.response?.data?.message || 'Failed to fetch patients';
    throw new Error(errorMessage);
  }
};
export const fetchPatientsApi = async (token: string) => {
  try {
    const res = await axios.get<ApiResponse<User[]>>(API_ENDPOINTS.users.patients, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data ?? [];
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    const errorMessage = err.response?.data?.message || 'Failed to fetch patients';
    throw new Error(errorMessage);
  }
};
export const fetchUsersApi = async (token: string) => {
  try {
    const res = await axios.get<ApiResponse<User[]>>(API_ENDPOINTS.users.users, {
      headers: { Authorization: `Bearer ${token}` },
    });
    debugger;
    return res.data.data ?? [];
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    const errorMessage = err.response?.data?.message || 'Failed to fetch users';
    throw new Error(errorMessage);
  }
};

export const createUserApi = async (token: string, userData: CreateUserData) => {
  try {
    const res = await axios.post<ApiResponse<boolean>>(
      API_ENDPOINTS.users.create,
      userData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data ?? false;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    const errorMessage = err.response?.data?.message || "Unable to create user";
    throw new Error(errorMessage);
  }
};

export const updateUserApi = async (token: string, userId: string, userData: CreateUserData) => {
  try {
    const res = await axios.put<ApiResponse<boolean>>(
      `${API_ENDPOINTS.users.update}/${userId}`, 
      userData, 
      { headers: { Authorization: `Bearer ${token}` } }
    ); 
    return res.data.data ?? false;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    const errorMessage = err.response?.data?.message || "Unable to update user";
    throw new Error(errorMessage);
  }
};

export const deleteUserApi = async (token: string, userId: string) => {
  try {
    const res = await axios.delete<ApiResponse<boolean>>(
      `${API_ENDPOINTS.users.delete}/${userId}`, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data ?? false;
  } catch (error) { 
    const err = error as AxiosError<ApiErrorResponse>; 
    const errorMessage = err.response?.data?.message || "Unable to delete user"; 
    throw new Error(errorMessage); 
  }
};

export const fetchDoctorsApi = async (token: string) => {
  try {
    const res = await axios.get<ApiResponse<User[]>>(API_ENDPOINTS.users.doctors, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data ?? [];
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    const errorMessage = err.response?.data?.message || 'Failed to fetch doctors';
    throw new Error(errorMessage);
  }
};