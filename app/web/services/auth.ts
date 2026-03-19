import { LoginBody, LoginResponse, RegisterBody, RegisterResponse } from "@/types/api";
// import { loginMock, registerMock } from "@/services/mockDb";
import { apiFetch } from "@/utils/api";

export function register(body: RegisterBody): Promise<RegisterResponse> {
    return apiFetch<RegisterResponse>('/auth/register', {
        method: 'POST',
        data: body,
    });
    // return registerMock(body);
}

export function login(body: LoginBody): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        data: body,
    });
    // return loginMock(body);
}
