import { beforeEach, describe, expect, it, vi } from 'vitest';

import { negotiationCommands } from '@/services/cqrs/negotiationCommands';
import { apiFetch } from '@/utils/api';

vi.mock('@/utils/api', () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

describe('negotiationCommands', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it('proposeNegotiation envoie la commande de création', async () => {
    apiFetchMock.mockResolvedValueOnce({ status: 'success', exchange_id: 'ex-1' });

    await negotiationCommands.proposeNegotiation({
      accepter_id: 'u-2',
      proposer_articles: ['a-1'],
      accepter_articles: ['a-2'],
      message: 'Je propose un échange de livres.',
    });

    expect(apiFetchMock).toHaveBeenCalledWith('/exchanges', {
      method: 'POST',
      data: {
        accepter_id: 'u-2',
        proposer_articles: ['a-1'],
        accepter_articles: ['a-2'],
        message: 'Je propose un échange de livres.',
      },
    });
  });

  it('sendComment envoie un message standard', async () => {
    apiFetchMock.mockResolvedValueOnce({ status: 'success' });

    await negotiationCommands.sendComment('ex-1', 'Contre-proposition possible ?');

    expect(apiFetchMock).toHaveBeenCalledWith('/messages', {
      method: 'POST',
      data: {
        exchange_id: 'ex-1',
        type: 'message',
        content: 'Contre-proposition possible ?',
        proposed_articles: null,
        requested_articles: null,
      },
    });
  });

  it('sendCounterProposal envoie la commande de négociation', async () => {
    apiFetchMock.mockResolvedValueOnce({ status: 'success' });

    await negotiationCommands.sendCounterProposal({
      exchange_id: 'ex-1',
      proposed_articles: ['a-1', 'a-3'],
      requested_articles: ['a-2'],
      content: 'Je propose un lot de deux livres.',
    });

    expect(apiFetchMock).toHaveBeenCalledWith('/negotiations', {
      method: 'POST',
      data: {
        exchange_id: 'ex-1',
        proposed_articles: ['a-1', 'a-3'],
        requested_articles: ['a-2'],
        content: 'Je propose un lot de deux livres.',
      },
    });
  });

  it('acceptNegotiation envoie une acceptation', async () => {
    apiFetchMock.mockResolvedValueOnce({ status: 'success' });

    await negotiationCommands.acceptNegotiation('ex-1');

    expect(apiFetchMock).toHaveBeenCalledWith('/messages', {
      method: 'POST',
      data: {
        exchange_id: 'ex-1',
        type: 'accepted',
        content: 'Échange accepté',
        proposed_articles: null,
        requested_articles: null,
      },
    });
  });

  it('refuseNegotiation envoie un refus', async () => {
    apiFetchMock.mockResolvedValueOnce({ status: 'success' });

    await negotiationCommands.refuseNegotiation('ex-1');

    expect(apiFetchMock).toHaveBeenCalledWith('/messages', {
      method: 'POST',
      data: {
        exchange_id: 'ex-1',
        type: 'refused',
        content: 'Échange refusé',
        proposed_articles: null,
        requested_articles: null,
      },
    });
  });

  it('markMessageAsRead envoie la commande de lecture', async () => {
    apiFetchMock.mockResolvedValueOnce({ status: 'success' });

    await negotiationCommands.markMessageAsRead('msg-42');

    expect(apiFetchMock).toHaveBeenCalledWith('/messages/msg-42', {
      method: 'PUT',
      data: { is_read: true },
    });
  });

  it('propage les erreurs API (cas erreur)', async () => {
    apiFetchMock.mockRejectedValueOnce(new Error('status code 500'));

    await expect(
      negotiationCommands.sendCounterProposal({
        exchange_id: 'ex-1',
        proposed_articles: ['a-1'],
        requested_articles: ['a-2'],
        content: 'Erreur backend',
      }),
    ).rejects.toThrow('status code 500');
  });
});
