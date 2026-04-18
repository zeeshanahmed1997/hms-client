import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';

// 1. Align this interface exactly with your C# DashboardStatsResponse properties
interface AdminStatsResponse {
    totalPatients: number;
    activeDoctors: number;
    revenue: number;
    pendingBills: number;
    success: boolean;
    message: string | null;
}

// 2. Pure Fetcher Function using Axios (to match your previous API style)
const fetchAdminStats = async (token: string): Promise<AdminStatsResponse> => {
    try {
        const res = await axios.get<AdminStatsResponse>(API_ENDPOINTS.dashboard.adminStats, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        // Throwing allows React Query to catch the error
        const message = error.response?.data?.message || 'Failed to fetch clinical stats';
        throw new Error(message);
    }
};

// 3. The Hook with proper "enabled" logic and try-catch behavior
export const useAdminStats = (token: string | undefined | null) => {
    return useQuery({
        queryKey: ['adminStats', token],
        queryFn: async () => {
            // Manual check before calling the API
            if (!token) throw new Error("No authorization token provided");
            
            console.log("🚀 Fetching Admin Dashboard Stats...");
            return await fetchAdminStats(token);
        },
        // CRITICAL: Only run the API if the token exists to avoid 401 errors
        enabled: !!token, 
        staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
        retry: 1, 
    });
};