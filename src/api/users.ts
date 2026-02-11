// api/users.ts
import axios from 'axios';
import { User } from '../redux/slices/userSlice';
import { API_ENDPOINTS } from '../api/endpoints';

interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[] | null;
}

export const fetchUsersApi = async (token: string): Promise<User[]> => {
  try {
    // The axios generic should be the full ApiResponse, not just User[]
    const res = await axios.get<ApiResponse<User[]>>(API_ENDPOINTS.users.users, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data ?? [];
    
  } catch (error: any) {
    // Access the message from your ApiResponse error factory
    const errorMessage = error.response?.data?.message || 'Failed to fetch users';
    throw new Error(errorMessage);
  }
};