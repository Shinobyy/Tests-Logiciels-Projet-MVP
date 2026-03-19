import {
  CreateExchangeBody,
  CreateExchangeResponse,
  CreateMessageResponse,
  CreateNegotiationBody,
  CreateNegotiationResponse,
  UpdateMessageBody,
} from '@/types/api';
import { apiFetch } from '@/utils/api';

export interface NegotiationCommandService {
  proposeNegotiation(body: CreateExchangeBody): Promise<CreateExchangeResponse>;
  sendComment(exchangeId: string, content: string): Promise<CreateMessageResponse>;
  sendCounterProposal(body: CreateNegotiationBody): Promise<CreateNegotiationResponse>;
  acceptNegotiation(exchangeId: string): Promise<CreateMessageResponse>;
  refuseNegotiation(exchangeId: string): Promise<CreateMessageResponse>;
  markMessageAsRead(messageId: string): Promise<{ status: 'success' }>;
}

export const negotiationCommands: NegotiationCommandService = {
  proposeNegotiation(body) {
    return apiFetch<CreateExchangeResponse>('/exchanges', {
      method: 'POST',
      data: body,
    });
  },

  sendComment(exchangeId, content) {
    return apiFetch<CreateMessageResponse>('/messages', {
      method: 'POST',
      data: {
        exchange_id: exchangeId,
        type: 'message',
        content,
        proposed_articles: null,
        requested_articles: null,
      },
    });
  },

  sendCounterProposal(body) {
    return apiFetch<CreateNegotiationResponse>('/negotiations', {
      method: 'POST',
      data: body,
    });
  },

  acceptNegotiation(exchangeId) {
    return apiFetch<CreateMessageResponse>('/messages', {
      method: 'POST',
      data: {
        exchange_id: exchangeId,
        type: 'accepted',
        content: 'Échange accepté',
        proposed_articles: null,
        requested_articles: null,
      },
    });
  },

  refuseNegotiation(exchangeId) {
    return apiFetch<CreateMessageResponse>('/messages', {
      method: 'POST',
      data: {
        exchange_id: exchangeId,
        type: 'refused',
        content: 'Échange refusé',
        proposed_articles: null,
        requested_articles: null,
      },
    });
  },

  markMessageAsRead(messageId) {
    return apiFetch<{ status: 'success' }>(`/messages/${messageId}`, {
      method: 'PUT',
      data: { is_read: true } satisfies UpdateMessageBody,
    });
  },
};
