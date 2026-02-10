// api/users.ts
import axios from 'axios';
import { User } from '../redux/slices/userSlice';
import { API_ENDPOINTS } from '../api/endpoints';

export const fetchUsersApi = async (token: string): Promise<Array<User>> => {
  const res = await axios.get<User[]>(API_ENDPOINTS.users.users, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch((error) => {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  });
  return res.data;
};