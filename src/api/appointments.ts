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

// ==================== DATA INTERFACES ====================
export interface Appointment {
  id?: string;
  appointmentDate: string;
  reason: string;
  status: string | number;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  
  // Token & Queue System Fields
  tokenNumber?: string;
  queueStatus?: string;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  reason: string;
  status?: string | number;
}

// ==================== BASE URL FROM .env ====================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7186';

// ==================== EXISTING METHODS (UNTOUCHED) ====================

export const fetchAppointmentsApi = async (token: string): Promise<Appointment[]> => {
  try {
    const res = await axios.get<ApiResponse<Appointment[]>>(API_ENDPOINTS.appointments.list, {
      headers: { Authorization: `Bearer ${token}` },
    });
    debugger;
    return res.data.data ?? [];
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    throw new Error(err.response?.data?.message || 'Failed to fetch appointments');
  }
};

export const fetchAllAppointmentsApi = async (token: string): Promise<Appointment[]> => {
  try {
    const res = await axios.get<ApiResponse<Appointment[]>>(API_ENDPOINTS.appointments.all, {
      headers: { Authorization: `Bearer ${token}` },
    });
    debugger;
    return res.data.data ?? [];
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    throw new Error(err.response?.data?.message || 'Failed to fetch all appointments');
  }
};

export const createAppointmentApi = async (token: string, data: CreateAppointmentData): Promise<boolean> => {
  try {
    const res = await axios.post<ApiResponse<boolean>>(
      API_ENDPOINTS.appointments.create,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    debugger;
    return res.data.data ?? false;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    throw new Error(err.response?.data?.message || "Unable to schedule appointment");
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

export const deleteAppointmentApi = async (token: string, id: string): Promise<boolean> => {
  try {
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

// ==================== NEW TOKEN & QUEUE SYSTEM METHODS ====================

export const generateTokenApi = async (token: string, appointmentId: string): Promise<any> => {
  try {
    const res = await axios.post<ApiResponse<any>>(
      `${API_BASE_URL}${API_ENDPOINTS.appointments.generateToken}/${appointmentId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data ?? {};
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    console.error("Generate Token Error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Failed to generate token");
  }
};

export const updateQueueStatusApi = async (token: string, appointmentId: string, status: string): Promise<boolean> => {
  try {
    const res = await axios.patch<ApiResponse<boolean>>(
      `${API_BASE_URL}${API_ENDPOINTS.appointments.updateQueueStatus}/${appointmentId}`,
      status,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.success ?? false;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    console.error("Update Queue Status Error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Failed to update queue status");
  }
};

export const fetchTodayQueueApi = async (token: string): Promise<Appointment[]> => {
  try {
    const res = await axios.get<ApiResponse<Appointment[]>>(`${API_BASE_URL}${API_ENDPOINTS.appointments.todayQueue}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data ?? [];
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    throw new Error(err.response?.data?.message || "Failed to fetch today's queue");
  }
};