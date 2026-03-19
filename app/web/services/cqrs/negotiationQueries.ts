import {
  ExchangeResponse,
  ExchangesResponse,
  MessagesResponse,
} from '@/types/api';
import { apiFetch } from '@/utils/api';
import { Exchange, Message } from '@/types/base';

export interface NegotiationQueryService {
  getNegotiationDetail(exchangeId: string): Promise<ExchangeResponse>;
  getNegotiationHistory(exchangeId: string): Promise<MessagesResponse>;
  getNegotiationsByUser(userId: string): Promise<Exchange[]>;
  getNegotiationsByArticle(articleId: string): Promise<Exchange[]>;
  getMessagesByType(exchangeId: string, type: Message['type']): Promise<Message[]>;
}

export const negotiationQueries: NegotiationQueryService = {
  getNegotiationDetail(exchangeId) {
    return apiFetch<ExchangeResponse>(`/exchanges/${exchangeId}`);
  },

  getNegotiationHistory(exchangeId) {
    return apiFetch<MessagesResponse>(`/messages/${exchangeId}`);
  },

  async getNegotiationsByUser(userId) {
    const response = await apiFetch<ExchangesResponse>('/exchanges');
    const exchanges = response.exchanges ?? [];

    return exchanges.filter(
      (entry) => entry.proposer.id === userId || entry.accepter.id === userId,
    );
  },

  async getNegotiationsByArticle(articleId) {
    const response = await apiFetch<ExchangesResponse>('/exchanges');
    const exchanges = response.exchanges ?? [];

    return exchanges.filter(
      (entry) =>
        entry.proposer_articles.includes(articleId) ||
        entry.accepter_articles.includes(articleId),
    );
  },

  async getMessagesByType(exchangeId, type) {
    const response = await apiFetch<MessagesResponse>(`/messages/${exchangeId}`);
    const messages = response.messages ?? [];

    return messages.filter((message) => message.type === type);
  },
};
