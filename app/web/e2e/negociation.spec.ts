import { expect, test, type Page, type Route } from '@playwright/test';

const exchangePayload = {
  exchange: {
    id: 'exchange-1',
    proposer: { id: 'u1', pseudonym: 'Intendante', avatar: 'https://picsum.photos/seed/u1/40/40' },
    accepter: { id: 'u2', pseudonym: 'Wanheda', avatar: 'https://picsum.photos/seed/u2/40/40' },
    proposer_articles: ['a1'],
    accepter_articles: ['b2'],
    status: 'pending',
    updated_at: '2026-03-19T10:00:00.000Z',
  },
};

const myArticlesPayload = {
  articles: [
    {
      id: 'a1',
      titre: 'Dune',
      description: 'd1',
      published_at: '2026-03-19T10:00:00.000Z',
      categories: ['Roman'],
      image: 'https://picsum.photos/seed/a1/96/96',
    },
    {
      id: 'a2',
      titre: 'Sapiens',
      description: 'd2',
      published_at: '2026-03-19T10:00:00.000Z',
      categories: ['Essai'],
      image: 'https://picsum.photos/seed/a2/96/96',
    },
  ],
};

const otherArticlesPayload = {
  articles: [
    {
      id: 'b1',
      titre: '1984',
      description: 'd3',
      published_at: '2026-03-19T10:00:00.000Z',
      categories: ['Roman'],
      image: 'https://picsum.photos/seed/b1/96/96',
    },
    {
      id: 'b2',
      titre: 'Le Mythe de Sisyphe',
      description: 'd4',
      published_at: '2026-03-19T10:00:00.000Z',
      categories: ['Essai'],
      image: 'https://picsum.photos/seed/b2/96/96',
    },
  ],
};

async function seedAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'token-e2e');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'u1',
        email: 'alice@test.com',
        pseudonym: 'Intendante',
        avatar: 'https://picsum.photos/seed/u1/40/40',
      }),
    );
  });
}

async function mockExchangeRoutes(
  page: Page,
  options?: { negotiationError?: boolean; captureNegotiation?: (payload: unknown) => void },
) {
  const negotiationError = options?.negotiationError ?? false;

  await page.route('**/api/exchanges/exchange-1', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(exchangePayload),
    });
  });

  await page.route('**/api/messages/exchange-1', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ messages: [] }),
    });
  });

  await page.route('**/api/messages/*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success' }),
    });
  });

  await page.route('**/api/users/me/articles', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(myArticlesPayload),
    });
  });

  await page.route('**/api/users/u2/articles', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(otherArticlesPayload),
    });
  });

  await page.route('**/api/negotiations', async (route: Route) => {
    const payload = route.request().postDataJSON();
    options?.captureNegotiation?.(payload);

    if (negotiationError) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'error' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        message: {
          id: 'msg-neg-1',
          exchange_id: 'exchange-1',
          user_id: 'u1',
          type: 'negotiation',
          content: 'ok',
          proposed_articles: ['a1'],
          requested_articles: ['b2'],
          is_read: true,
          created_at: '2026-03-19T10:00:00.000Z',
        },
      }),
    });
  });
}

test.describe('Négociation - parcours fonctionnel', () => {
  test('cas usuel: surbrillance initiale et envoi négociation', async ({ page }) => {
    let negotiationBody: unknown;

    await seedAuth(page);
    await mockExchangeRoutes(page, {
      captureNegotiation: (payload) => {
        negotiationBody = payload;
      },
    });

    await page.goto('/exchanges/exchange-1');

    await expect(page.getByText('Négociation de livres')).toBeVisible();
    await expect(page.locator('label[title="Dune"]')).toHaveClass(/ring-2/);
    await expect(page.locator('label[title="Le Mythe de Sisyphe"]')).toHaveClass(/ring-2/);

    await page.fill('#negotiation-content', 'Je propose une nouvelle négociation.');
    await page.getByRole('button', { name: 'Valider' }).click();

    expect(negotiationBody).toMatchObject({
      exchange_id: 'exchange-1',
      proposed_articles: ['a1'],
      requested_articles: ['b2'],
      content: 'Je propose une nouvelle négociation.',
    });
  });

  test('cas extrême: message de négociation très long', async ({ page }) => {
    await seedAuth(page);
    await mockExchangeRoutes(page);

    await page.goto('/exchanges/exchange-1');

    const veryLongMessage = 'N'.repeat(3000);
    await page.fill('#negotiation-content', veryLongMessage);
    await page.getByRole('button', { name: 'Valider' }).click();

    await expect(page.getByText('Négociation de livres')).toBeVisible();
  });

  test('cas erreur: échec API sur négociation', async ({ page }) => {
    await seedAuth(page);
    await mockExchangeRoutes(page, { negotiationError: true });

    await page.goto('/exchanges/exchange-1');

    await page.getByRole('button', { name: 'Valider' }).click();
    await expect(page.getByText(/status code 500|négociation impossible/i)).toBeVisible();
  });
});
