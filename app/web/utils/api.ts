import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export function apiFetch<T>(endpoint: string, options?: Parameters<typeof apiClient.request>[0]): Promise<T> {
    return apiClient.request<T>({
        url: endpoint,
        ...options,
    }).then(res => res.data);
}
