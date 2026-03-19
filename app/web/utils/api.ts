import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export function apiFetch<T>(endpoint: string, options?: Parameters<typeof apiClient.request>[0]): Promise<T> {
    const headers = {
        ...(options?.headers as Record<string, string> | undefined),
    };

    const hasAuthorizationHeader = headers.Authorization || headers.authorization;
    let token: string | null = null;
    try {
        token = globalThis.localStorage.getItem('token');
    } catch {
        token = null;
    }

    if (token && !hasAuthorizationHeader) {
        headers.Authorization = `Bearer ${token}`;
    }

    return apiClient.request<T>({
        url: endpoint,
        headers,
        ...options,
    }).then(res => res.data);
}
