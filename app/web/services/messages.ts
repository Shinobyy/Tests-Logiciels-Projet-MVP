import { CreateMessageBody, CreateMessageResponse, MessagesResponse, UpdateMessageBody } from "@/types/api";
import { apiFetch } from "@/utils/api";

export function createMessage(body: CreateMessageBody): Promise<CreateMessageResponse> {
    return apiFetch<CreateMessageResponse>('/messages', {
        method: 'POST',
        data: body,
    });
}

export function getMessages(exchangeId: string): Promise<MessagesResponse> {
    return apiFetch<MessagesResponse>(`/messages/${exchangeId}`);
}

export function markMessageAsRead(messageId: string): Promise<{ status: "success" }> {
    return apiFetch<{ status: "success" }>(`/messages/${messageId}`, {
        method: 'PUT',
        data: { is_read: true } satisfies UpdateMessageBody,
    });
}