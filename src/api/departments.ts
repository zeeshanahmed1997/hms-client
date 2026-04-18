import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '../api/endpoints';

export interface Department {
  id: number;
  name: string;
}

export const fetchDepartmentsApi = async (token: string): Promise<Department[]> => {
  try {
    const response = await axios.get(API_ENDPOINTS.departments.list, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle cases where the API might return { data: [...] } or just [...]
    const data = response.data;
    return Array.isArray(data) ? data : (data.departments || data.data || []);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch departments');
    }
    throw new Error('An unexpected error occurred while fetching departments');
  }
};