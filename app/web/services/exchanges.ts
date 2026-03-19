import { CreateExchangeBody, CreateExchangeResponse, ExchangeResponse, ExchangesResponse } from "@/types/api";
import { createExchangeMock, getExchangeMock, getExchangesMock } from "@/services/mockDb";
// import { apiFetch } from "@/utils/api";

export function createExchange(body: CreateExchangeBody): Promise<CreateExchangeResponse> {
    // return apiFetch<CreateExchangeResponse>('/exchanges', {
    //     method: 'POST',
    //     data: body,
    // });
    return createExchangeMock(body);
}

export function getExchanges(): Promise<ExchangesResponse> {
    // return apiFetch<ExchangesResponse>('/exchanges');
    return getExchangesMock();
}

export function getExchange(exchangeId: string): Promise<ExchangeResponse> {
    // return apiFetch<ExchangeResponse>(`/exchanges/${exchangeId}`);
    return getExchangeMock(exchangeId);
}