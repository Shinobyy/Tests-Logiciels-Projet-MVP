import { beforeEach, describe, expect, it, vi } from 'vitest';

import { negotiationQueries } from '@/services/cqrs/negotiationQueries';
import { apiFetch } from '@/utils/api';

vi.mock('@/utils/api', () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

describe('negotiationQueries', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it('getNegotiationDetail lit le détail d’une négociation', async () => {
    apiFetchMock.mockResolvedValueOnce({
      exchange: {
        id: 'ex-1',
        proposer: { id: 'u-1', pseudonym: 'Alice', avatar: 'a' },
        accepter: { id: 'u-2', pseudonym: 'Bob', avatar: 'b' },
        proposer_articles: ['a-1'],
        accepter_articles: ['a-2'],
        status: 'pending',
        updated_at: '2026-03-19T10:00:00.000Z',
      },
    });

    const result = await negotiationQueries.getNegotiationDetail('ex-1');

    expect(apiFetchMock).toHaveBeenCalledWith('/exchanges/ex-1');
    expect(result.exchange.id).toBe('ex-1');
  });

  it('getNegotiationHistory lit les messages', async () => {
    apiFetchMock.mockResolvedValueOnce({
      messages: [{
        id: 'm-1',
        exchange_id: 'ex-1',
        user: { id: 'u-1', pseudonym: 'Alice', avatar: 'a' },
        type: 'message',
        content: 'Bonjour',
        proposed_articles: null,
        requested_articles: null,
        is_read: false,
        created_at: '2026-03-19T10:00:00.000Z',
      }],
    });

    const result = await negotiationQueries.getNegotiationHistory('ex-1');

    expect(apiFetchMock).toHaveBeenCalledWith('/messages/ex-1');
    expect(result.messages).toHaveLength(1);
  });

  it('getNegotiationsByUser filtre correctement', async () => {
    apiFetchMock.mockResolvedValueOnce({
      exchanges: [
        {
          id: 'ex-1',
          proposer: { id: 'u-1', pseudonym: 'Alice', avatar: 'a' },
          accepter: { id: 'u-2', pseudonym: 'Bob', avatar: 'b' },
          proposer_articles: ['a-1'],
          accepter_articles: ['a-2'],
          status: 'pending',
          updated_at: '2026-03-19T10:00:00.000Z',
        },
        {
          id: 'ex-2',
          proposer: { id: 'u-3', pseudonym: 'Cara', avatar: 'c' },
          accepter: { id: 'u-4', pseudonym: 'Dan', avatar: 'd' },
          proposer_articles: ['a-3'],
          accepter_articles: ['a-4'],
          status: 'pending',
          updated_at: '2026-03-19T10:00:00.000Z',
        },
      ],
    });

    const result = await negotiationQueries.getNegotiationsByUser('u-1');

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('ex-1');
  });

  it('getNegotiationsByArticle couvre cas extrême tableau vide', async () => {
    apiFetchMock.mockResolvedValueOnce({ exchanges: undefined });

    const result = await negotiationQueries.getNegotiationsByArticle('a-1');

    expect(result).toEqual([]);
  });

  it('getMessagesByType filtre par type', async () => {
    apiFetchMock.mockResolvedValueOnce({
      messages: [
        {
          id: 'm-1',
          exchange_id: 'ex-1',
          user: { id: 'u-1', pseudonym: 'Alice', avatar: 'a' },
          type: 'message',
          content: 'Bonjour',
          proposed_articles: null,
          requested_articles: null,
          is_read: false,
          created_at: '2026-03-19T10:00:00.000Z',
        },
        {
          id: 'm-2',
          exchange_id: 'ex-1',
          user: { id: 'u-2', pseudonym: 'Bob', avatar: 'b' },
          type: 'negotiation',
          content: 'Je propose autre chose',
          proposed_articles: ['a-2'],
          requested_articles: ['a-1'],
          is_read: false,
          created_at: '2026-03-19T10:01:00.000Z',
        },
      ],
    });

    const result = await negotiationQueries.getMessagesByType('ex-1', 'negotiation');

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('m-2');
  });

  it('propage les erreurs API (cas erreur)', async () => {
    apiFetchMock.mockRejectedValueOnce(new Error('status code 500'));

    await expect(negotiationQueries.getNegotiationDetail('ex-1')).rejects.toThrow('status code 500');
  });
});
