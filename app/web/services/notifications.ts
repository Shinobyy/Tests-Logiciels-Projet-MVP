import { CreateNegotiationBody, CreateNegotiationResponse } from "@/types/api";
import { apiFetch } from "@/utils/api";

export function createNegotiation(body: CreateNegotiationBody): Promise<CreateNegotiationResponse> {
    return apiFetch<CreateNegotiationResponse>('/negotiations', {
        method: 'POST',
        data: body,
    });
}