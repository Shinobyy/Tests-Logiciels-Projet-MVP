import { LoginBody, LoginResponse, RegisterBody, RegisterResponse } from "@/types/api";
import { apiFetch } from "@/utils/api";

export function register(body: RegisterBody): Promise<RegisterResponse> {
    return apiFetch<RegisterResponse>('/auth/register', {
        method: 'POST',
        data: body,
    });
}

export function login(body: LoginBody): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        data: body,
    });
}
