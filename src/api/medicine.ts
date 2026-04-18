import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';
import { useAppSelector } from '@/src/redux/hooks';

export interface Medicine {
  id: number;
  name: string;
  genericName?: string;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
  expiryDate: string;
  isLowStock?: boolean;
  isExpired?: boolean;
}

export interface CreateMedicineData {
  name: string;
  genericName?: string;
  description?: string;
  unitPrice: number;
  initialStock: number;
  expiryDate: string;
}

export interface StockUpdateData {
  medicineId: number;
  quantity: number;
  reason?: string;
}

export const medicineKeys = {
  all: ['medicines'] as const,
  lowStock: () => [...medicineKeys.all, 'lowStock'] as const,
};

export const useMedicines = () => {
  const { token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: medicineKeys.all,
    queryFn: async (): Promise<Medicine[]> => {
      const res = await axios.get(API_ENDPOINTS.medicines.list, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data ?? [];
    },
    enabled: !!token,
  });
};

export const useLowStockMedicines = () => {
  const { token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: medicineKeys.lowStock(),
    queryFn: async (): Promise<Medicine[]> => {
      const res = await axios.get(API_ENDPOINTS.medicines.lowStock, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data ?? [];
    },
    enabled: !!token,
  });
};
export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();
  const { token } = useAppSelector((state) => state.auth);
  return useMutation({
    mutationFn: async (medicineId: number) => {
      const res = await axios.delete(`${API_ENDPOINTS.medicines.delete}/${medicineId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicineKeys.all });
    },
  });
};
export const useCreateMedicine = () => {
  const queryClient = useQueryClient();
  const { token } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (data: CreateMedicineData) => {
      const res = await axios.post(API_ENDPOINTS.medicines.create, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicineKeys.all });
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  const { token } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (data: StockUpdateData) => {
      const res = await axios.patch(API_ENDPOINTS.medicines.stock, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicineKeys.all });
    },
  });
};