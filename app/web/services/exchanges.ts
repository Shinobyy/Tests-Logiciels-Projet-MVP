import { CreateExchangeBody, CreateExchangeResponse, ExchangeResponse, ExchangesResponse } from "@/types/api";
import { apiFetch } from "@/utils/api";

export function createExchange(body: CreateExchangeBody): Promise<CreateExchangeResponse> {
    return apiFetch<CreateExchangeResponse>('/exchanges', {
        method: 'POST',
        data: body,
    });
}

export function getExchanges(): Promise<ExchangesResponse> {
    return apiFetch<ExchangesResponse>('/exchanges');
}

export function getExchange(exchangeId: string): Promise<ExchangeResponse> {
    return apiFetch<ExchangeResponse>(`/exchanges/${exchangeId}`);
}