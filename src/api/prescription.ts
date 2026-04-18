import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';
import { useAppSelector } from '@/src/redux/hooks';

interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[] | null;
}

export interface PrescriptionItem {
  id?: number;
  medicineId: number;
  medicineName?: string;
  quantity: number;
  dosage?: string;
  instructions?: string;
  priceAtIssue?: number;
}

export interface Prescription {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  doctorId: number;
  doctorName: string;
  prescriptionDate: string;
  instructions?: string;
  items: PrescriptionItem[];
}

export interface CreatePrescriptionData {
  patientId: number;
  prescriptionDate: string;
  instructions?: string;
  items: {
    medicineId: number;
    quantity: number;
    dosage?: string;
    instructions?: string;
  }[];
}

export const prescriptionKeys = {
  all: ['prescriptions'] as const,
  my: ['prescriptions', 'my'] as const,
  allPrescriptions: ['prescriptions', 'all'] as const,
};

export const useMyPrescriptions = () => {
  const { token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: prescriptionKeys.my,
    queryFn: async (): Promise<Prescription[]> => {
      const res = await axios.get<ApiResponse<Prescription[]>>(
        API_ENDPOINTS.prescriptions.list,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data.data ?? [];
    },
    enabled: !!token,
  });
};

export const useAllPrescriptions = () => {
  const { token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: prescriptionKeys.allPrescriptions,
    queryFn: async (): Promise<Prescription[]> => {
      const res = await axios.get<ApiResponse<Prescription[]>>(
        API_ENDPOINTS.prescriptions.all,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      debugger
      return res.data.data ?? [];
    },
    enabled: !!token,
  });
};
export const usePrescriptionDetail = (id: number) => {
  const queryClient = useQueryClient();
  const { token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: ['prescription', id],
    queryFn: async (): Promise<Prescription> => {
      const res = await axios.get<ApiResponse<Prescription>>(
        API_ENDPOINTS.prescriptions.detail(id),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data.data!;
    },
    enabled: !!token && !!id,
    // Optional: Pre-fill from the list cache for instant loading
    initialData: () => {
      return queryClient
        .getQueryData<Prescription[]>(prescriptionKeys.my)
        ?.find((p) => p.id === id);
    },
    initialDataUpdatedAt: () => 
      queryClient.getQueryState(prescriptionKeys.my)?.dataUpdatedAt,
  });
};
export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  const { token } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (data: CreatePrescriptionData): Promise<boolean> => {
      const res = await axios.post<ApiResponse<boolean>>(
        API_ENDPOINTS.prescriptions.create,
        data,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      return res.data.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.my });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.allPrescriptions });
    },
  });
};