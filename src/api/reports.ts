import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '../api/endpoints';

// ==================== RESPONSE WRAPPERS ====================
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
export interface RevenueByMonth {
  month: string;
  amount: number;
  count: number;
}

export interface DoctorPerformance {
  doctorName: string;
  totalAppointments: number;
  completedAppointments: number;
  totalPrescriptions: number;
}

export interface PatientVisit {
  patientName: string;
  patientEmail: string;
  lastVisit: string;
  totalVisits: number;
}

export interface AdminReport {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  confirmedAppointments: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  revenueByMonth: RevenueByMonth[];
  totalPrescriptions: number;
  totalMedicinesDispensed: number;
  doctorPerformance: DoctorPerformance[];
  totalPatients: number;
  uniquePatients: number;
  recentPatientVisits: PatientVisit[];
}

export interface DoctorReport {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  confirmedAppointments: number;
  totalPrescriptions: number;
  totalMedicinesDispensed: number;
  uniquePatients: number;
  recentPatientVisits: PatientVisit[];
  appointmentsByMonth: RevenueByMonth[];
}

// ==================== API METHODS ====================

export const fetchAdminReportApi = async (token: string): Promise<AdminReport> => {
  try {
    const res = await axios.get<ApiResponse<AdminReport>>(API_ENDPOINTS.reports.admin, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.data.data) throw new Error(res.data.message || 'No report data returned');
    return res.data.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    throw new Error(err.response?.data?.message || 'Failed to fetch admin report');
  }
};

export const fetchDoctorReportApi = async (token: string): Promise<DoctorReport> => {
  try {
    const res = await axios.get<ApiResponse<DoctorReport>>(API_ENDPOINTS.reports.doctor, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.data.data) throw new Error(res.data.message || 'No report data returned');
    return res.data.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    throw new Error(err.response?.data?.message || 'Failed to fetch doctor report');
  }
};