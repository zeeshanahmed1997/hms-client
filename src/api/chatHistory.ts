import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';

// Aligning with your SQL Table & DTO
export interface ChatMessage {
    id: number;
    senderId: number;
    receiverId: number;
    messageText: string;
    sentAt: string;
    isRead: boolean;
    senderName?: string; // Populated by the SQL Join in Dapper
}

const fetchChatHistory = async (userId: number, token: string): Promise<ChatMessage[]> => {
    const res = await axios.get(API_ENDPOINTS.chat.history(userId), {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const useChatHistory = (userId: number | undefined, token: string | null) => {
    return useQuery({
        queryKey: ['chatHistory', userId],
        queryFn: () => fetchChatHistory(userId!, token!),
        enabled: !!userId && !!token,
        staleTime: 1000 * 60 * 10, // Chat history is fine to cache for 10 mins
        refetchOnWindowFocus: false, // Don't refetch history every time user tabs back
    });
};