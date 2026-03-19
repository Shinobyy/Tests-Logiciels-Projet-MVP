import { CreateMessageBody, CreateMessageResponse, MessagesResponse, UpdateMessageBody } from "@/types/api";
// import { createMessageMock, getMessagesMock, markMessageAsReadMock } from "@/services/mockDb";
import { apiFetch } from "@/utils/api";

export function createMessage(body: CreateMessageBody): Promise<CreateMessageResponse> {
    return apiFetch<CreateMessageResponse>('/messages', {
        method: 'POST',
        data: body,
    });
    // return createMessageMock(body);
}

export function getMessages(exchangeId: string): Promise<MessagesResponse> {
    return apiFetch<MessagesResponse>(`/messages/${exchangeId}`);
    // return getMessagesMock(exchangeId);
}

export function markMessageAsRead(messageId: string): Promise<{ status: "success" }> {
    return apiFetch<{ status: "success" }>(`/messages/${messageId}`, {
        method: 'PUT',
        data: { is_read: true } satisfies UpdateMessageBody,
    });
    // return markMessageAsReadMock(messageId);
}