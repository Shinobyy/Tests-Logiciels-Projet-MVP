import { expect, test, type Page, type Route } from '@playwright/test';

type MockArticle = {
  id: string;
  titre: string;
  description: string;
  published_at: string;
  categories: string[];
  image: string;
  user: { id: string; pseudonym: string; avatar: string };
};

const categories = [
  { id: 'cat-roman', nom: 'Roman' },
  { id: 'cat-essai', nom: 'Essai' },
];

const baseArticles: MockArticle[] = [
  {
    id: 'art-1',
    titre: 'L\'étranger',
    description: 'Roman classique',
    published_at: '2026-03-19T10:00:00.000Z',
    categories: ['Roman'],
    image: 'https://picsum.photos/seed/art-1/96/96',
    user: { id: 'u2', pseudonym: 'Wanheda', avatar: 'https://picsum.photos/seed/u2/40/40' },
  },
  {
    id: 'art-2',
    titre: 'Le Deuxième Sexe',
    description: 'Essai philosophique',
    published_at: '2026-03-18T10:00:00.000Z',
    categories: ['Essai'],
    image: 'https://picsum.photos/seed/art-2/96/96',
    user: { id: 'u3', pseudonym: 'Asura', avatar: 'https://picsum.photos/seed/u3/40/40' },
  },
];

async function mockLoginAndCatalogue(page: Page, options?: { largeList?: boolean; articlesError?: boolean }) {
  const largeList = options?.largeList ?? false;
  const articlesError = options?.articlesError ?? false;

  const articles = largeList
    ? Array.from({ length: 60 }).map((_, index) => ({
        id: `art-${index + 1}`,
        titre: `Article ${index + 1}`,
        description: `Description ${index + 1}`,
        published_at: '2026-03-19T10:00:00.000Z',
        categories: [index % 2 === 0 ? 'Roman' : 'Essai'],
        image: `https://picsum.photos/seed/art-${index + 1}/96/96`,
        user: { id: 'u2', pseudonym: 'Wanheda', avatar: 'https://picsum.photos/seed/u2/40/40' },
      }))
    : baseArticles;

  await page.route('**/api/auth/login', async (route: Route) => {
    const body = route.request().postDataJSON() as { email?: string; password?: string };

    if (body.email === 'alice@test.com' && body.password === 'password123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          token: 'token-e2e',
          user: {
            id: 'u1',
            email: 'alice@test.com',
            pseudonym: 'Intendante',
            avatar: 'https://picsum.photos/seed/u1/40/40',
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid credentials' }),
    });
  });

  await page.route('**/api/categories', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ categories }),
    });
  });

  await page.route('**/api/articles**', async (route: Route) => {
    if (articlesError) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server exploded' }),
      });
      return;
    }

    const requestUrl = new URL(route.request().url());
    const categoryId = requestUrl.searchParams.get('category');

    let filtered = articles;
    if (categoryId === 'cat-roman') {
      filtered = articles.filter((article) => article.categories.includes('Roman'));
    } else if (categoryId === 'cat-essai') {
      filtered = articles.filter((article) => article.categories.includes('Essai'));
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ articles: filtered }),
    });
  });
}

test.describe('Catalogue - parcours fonctionnel', () => {
  test('cas usuel: login puis filtrage catalogue', async ({ page }) => {
    await mockLoginAndCatalogue(page);

    await page.goto('/auth/login');
    await page.fill('#email', 'alice@test.com');
    await page.fill('#password', 'password123');
    await page.getByRole('button', { name: 'SE CONNECTER' }).click();

    await expect(page).toHaveURL(/\/articles$/);
    await expect(page.getByText('Catalogue de livres')).toBeVisible();

    await page.getByRole('button', { name: 'Roman' }).click();
    await expect(page.getByText('Filtre actif: Roman')).toBeVisible();
    await expect(page.getByText("L'étranger")).toBeVisible();
    await expect(page.getByText('Le Deuxième Sexe')).not.toBeVisible();
  });

  test('cas extrême: catalogue volumineux', async ({ page }) => {
    await mockLoginAndCatalogue(page, { largeList: true });

    await page.goto('/auth/login');
    await page.fill('#email', 'alice@test.com');
    await page.fill('#password', 'password123');
    await page.getByRole('button', { name: 'SE CONNECTER' }).click();

    await expect(page).toHaveURL(/\/articles$/);
    await expect(page.locator('a:has-text("Echanger")')).toHaveCount(60);
  });

  test('cas erreur: backend articles indisponible', async ({ page }) => {
    await mockLoginAndCatalogue(page, { articlesError: true });

    await page.goto('/auth/login');
    await page.fill('#email', 'alice@test.com');
    await page.fill('#password', 'password123');
    await page.getByRole('button', { name: 'SE CONNECTER' }).click();

    await expect(page).toHaveURL(/\/articles$/);
    await expect(page.getByText(/status code 500|failed/i)).toBeVisible();
  });
});
