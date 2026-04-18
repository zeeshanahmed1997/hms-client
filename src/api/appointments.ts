import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '../api/endpoints';

// Standardized Response Wrappers
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

// Data Interfaces
export interface Appointment {
  id?: string; // Added optional ID if your DB uses a unique AppointmentId
  appointmentDate: string;
  reason: string;
  status: string | number;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  reason: string;
  status?: string | number;
}

// API Methods
export const fetchAppointmentsApi = async (token: string): Promise<Appointment[]> => {
  try {
    const res = await axios.get<ApiResponse<Appointment[]>>(API_ENDPOINTS.appointments.list, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data ?? [];
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    const errorMessage = err.response?.data?.message || 'Failed to fetch appointments';
    throw new Error(errorMessage);
  }
};
export const fetchAllAppointmentsApi = async (token: string): Promise<Appointment[]> => {
  try {
    const res = await axios.get<ApiResponse<Appointment[]>>(API_ENDPOINTS.appointments.all, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data ?? [];
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    const errorMessage = err.response?.data?.message || 'Failed to fetch all appointments';
    throw new Error(errorMessage);
  }
};
export const editAppointmentApi = async (token: string, id: string, data: any): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.appointments.update}?appointmentId=${id}`;
    const res = await axios.patch<ApiResponse<boolean>>(
      url, 
      data, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data ?? false;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    throw new Error(err.response?.data?.message || "Unable to update appointment");
  }
};
export const createAppointmentApi = async (token: string, data: CreateAppointmentData): Promise<boolean> => {
  try {
    debugger;
    const res = await axios.post<ApiResponse<boolean>>(
      API_ENDPOINTS.appointments.create,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data ?? false;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    const errorMessage = err.response?.data?.message || "Unable to schedule appointment";
    throw new Error(errorMessage);
  }
};

export const deleteAppointmentApi = async (token: string, id: string): Promise<boolean> => {
  try {
    // FIX: Added empty {} body as second argument to ensure headers are sent correctly
    const res = await axios.patch<ApiResponse<boolean>>(
      `${API_ENDPOINTS.appointments.delete}/${id}`,
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data ?? false;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    throw new Error(err.response?.data?.message || "Unable to cancel appointment");
  }
};