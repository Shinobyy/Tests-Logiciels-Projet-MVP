import {
    Article,
    Category,
    Exchange,
    ExchangeStatus,
    Message,
    MessageType,
    User,
    UserSummary,
} from "@/types/base";
import {
    ArticleResponse,
    ArticlesResponse,
    CategoriesResponse,
    CreateArticleBody,
    CreateArticleResponse,
    CreateExchangeBody,
    CreateExchangeResponse,
    CreateMessageBody,
    CreateMessageResponse,
    CreateNegotiationBody,
    CreateNegotiationResponse,
    ExchangeResponse,
    ExchangesResponse,
    LoginBody,
    LoginResponse,
    MessagesResponse,
    RegisterBody,
    RegisterResponse,
    UpdateArticleBody,
} from "@/types/api";

type PublicUser = Pick<User, "id" | "email" | "pseudonym" | "avatar">;

type DbUser = User & { password: string };

type DbArticle = {
    id: string;
    titre: string;
    description: string;
    published_at: string;
    user_id: string;
    image: string;
    exchanged: boolean;
    exchanged_at: string | null;
    categories: string[];
};

type DbExchange = {
    id: string;
    proposer_id: string;
    accepter_id: string;
    proposer_articles: string[];
    accepter_articles: string[];
    status: ExchangeStatus;
    updated_at: string;
};

type DbMessage = {
    id: string;
    exchange_id: string;
    user_id: string;
    type: MessageType;
    content: string;
    proposed_articles: string[] | null;
    requested_articles: string[] | null;
    is_read: boolean;
    created_at: string;
};

type DbState = {
    users: DbUser[];
    categories: Category[];
    articles: DbArticle[];
    exchanges: DbExchange[];
    messages: DbMessage[];
};

const DB_KEY = "lbc_mock_db_v1";

const seedCategories: Category[] = [
    { id: "cat-books", nom: "Livres" },
    { id: "cat-games", nom: "Jeux" },
    { id: "cat-tech", nom: "Tech" },
    { id: "cat-sports", nom: "Sports" },
];

const seedUsers: DbUser[] = [
    {
        id: "user-1",
        email: "alice@test.com",
        pseudonym: "Alice",
        avatar: "https://i.pravatar.cc/80?img=1",
        rating: 4.7,
        password: "password123",
    },
    {
        id: "user-2",
        email: "bob@test.com",
        pseudonym: "Bob",
        avatar: "https://i.pravatar.cc/80?img=2",
        rating: 4.2,
        password: "password123",
    },
    {
        id: "user-3",
        email: "charlie@test.com",
        pseudonym: "Charlie",
        avatar: "https://i.pravatar.cc/80?img=3",
        rating: 4.5,
        password: "password123",
    },
];

const seedArticles: DbArticle[] = [
    {
        id: "article-1",
        titre: "Nintendo Switch Lite",
        description: "Très bon état, peu utilisée.",
        published_at: new Date().toISOString(),
        user_id: "user-2",
        image: "https://picsum.photos/seed/switch/400/250",
        exchanged: false,
        exchanged_at: null,
        categories: ["cat-games", "cat-tech"],
    },
    {
        id: "article-2",
        titre: "Vélo de ville",
        description: "Parfait pour trajets quotidiens.",
        published_at: new Date().toISOString(),
        user_id: "user-3",
        image: "https://picsum.photos/seed/velo/400/250",
        exchanged: false,
        exchanged_at: null,
        categories: ["cat-sports"],
    },
    {
        id: "article-3",
        titre: "Collection Harry Potter",
        description: "7 tomes en très bon état.",
        published_at: new Date().toISOString(),
        user_id: "user-1",
        image: "https://picsum.photos/seed/hp/400/250",
        exchanged: false,
        exchanged_at: null,
        categories: ["cat-books"],
    },
];

let db: DbState | null = null;

function delay(ms = 120): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function createSeedState(): DbState {
    return {
        users: [...seedUsers],
        categories: [...seedCategories],
        articles: [...seedArticles],
        exchanges: [],
        messages: [],
    };
}

function canUseLocalStorage(): boolean {
    return typeof window !== "undefined";
}

function saveDbState(): void {
    if (!db || !canUseLocalStorage()) return;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function loadDbState(): DbState {
    if (!canUseLocalStorage()) {
        return createSeedState();
    }

    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
        const seeded = createSeedState();
        localStorage.setItem(DB_KEY, JSON.stringify(seeded));
        return seeded;
    }

    try {
        const parsed = JSON.parse(raw) as DbState;
        if (!parsed.users || !parsed.categories || !parsed.articles || !parsed.exchanges || !parsed.messages) {
            const seeded = createSeedState();
            localStorage.setItem(DB_KEY, JSON.stringify(seeded));
            return seeded;
        }
        return parsed;
    } catch {
        const seeded = createSeedState();
        localStorage.setItem(DB_KEY, JSON.stringify(seeded));
        return seeded;
    }
}

function getDb(): DbState {
    if (!db) {
        db = loadDbState();
    }
    return db;
}

function tokenFromUser(userId: string): string {
    return `mock-token-${userId}`;
}

function userIdFromToken(token: string): string | null {
    if (!token.startsWith("mock-token-")) return null;
    return token.replace("mock-token-", "");
}

function getCurrentToken(): string | null {
    if (!canUseLocalStorage()) return null;
    return localStorage.getItem("token");
}

function getCurrentUserOrThrow(): DbUser {
    const token = getCurrentToken();
    if (!token) throw new Error("Utilisateur non authentifié");

    const userId = userIdFromToken(token);
    if (!userId) throw new Error("Token invalide");

    const state = getDb();
    const user = state.users.find((entry) => entry.id === userId);
    if (!user) throw new Error("Utilisateur introuvable");

    return user;
}

function toPublicUser(user: DbUser): PublicUser {
    return {
        id: user.id,
        email: user.email,
        pseudonym: user.pseudonym,
        avatar: user.avatar,
    };
}

function toUserSummary(user: DbUser): UserSummary {
    return {
        id: user.id,
        pseudonym: user.pseudonym,
        avatar: user.avatar,
    };
}

function articleToApi(article: DbArticle): Article {
    const owner = getDb().users.find((entry) => entry.id === article.user_id);
    if (!owner) {
        throw new Error("Propriétaire de l'article introuvable");
    }

    const categoryMap = new Map(getDb().categories.map((entry) => [entry.id, entry.nom]));

    return {
        id: article.id,
        titre: article.titre,
        description: article.description,
        published_at: article.published_at,
        categories: article.categories.map((entry) => categoryMap.get(entry) ?? entry),
        image: article.image,
        exchanged: article.exchanged,
        exchanged_at: article.exchanged_at,
        user: toUserSummary(owner),
    };
}

function exchangeToApi(exchange: DbExchange): Exchange {
    const state = getDb();
    const proposer = state.users.find((entry) => entry.id === exchange.proposer_id);
    const accepter = state.users.find((entry) => entry.id === exchange.accepter_id);

    if (!proposer || !accepter) {
        throw new Error("Utilisateurs de l'échange introuvables");
    }

    return {
        id: exchange.id,
        proposer: toUserSummary(proposer),
        accepter: toUserSummary(accepter),
        proposer_articles: [...exchange.proposer_articles],
        accepter_articles: [...exchange.accepter_articles],
        status: exchange.status,
        updated_at: exchange.updated_at,
    };
}

function messageToApi(message: DbMessage): Message {
    const author = getDb().users.find((entry) => entry.id === message.user_id);
    if (!author) {
        throw new Error("Auteur du message introuvable");
    }

    return {
        id: message.id,
        exchange_id: message.exchange_id,
        user: toUserSummary(author),
        type: message.type,
        content: message.content,
        proposed_articles: message.proposed_articles,
        requested_articles: message.requested_articles,
        is_read: message.is_read,
        created_at: message.created_at,
    };
}

function now(): string {
    return new Date().toISOString();
}

function randomId(prefix: string): string {
    return `${prefix}-${crypto.randomUUID()}`;
}

function assertArticlesBelongToUser(articleIds: string[], userId: string): void {
    const state = getDb();
    const allMatch = articleIds.every((articleId) => {
        const article = state.articles.find((entry) => entry.id === articleId);
        return article && article.user_id === userId && !article.exchanged;
    });

    if (!allMatch) {
        throw new Error("Certains articles ne sont pas valides pour cet utilisateur");
    }
}

function participantsContain(exchange: DbExchange, userId: string): boolean {
    return exchange.accepter_id === userId || exchange.proposer_id === userId;
}

export function resetMockDb(): void {
    db = createSeedState();
    saveDbState();
}

export async function registerMock(body: RegisterBody): Promise<RegisterResponse> {
    await delay();
    const state = getDb();

    if (state.users.some((entry) => entry.email.toLowerCase() === body.email.toLowerCase())) {
        throw new Error("Email déjà utilisé");
    }

    const created: DbUser = {
        id: randomId("user"),
        email: body.email,
        pseudonym: body.pseudonym,
        avatar: `https://i.pravatar.cc/80?u=${encodeURIComponent(body.email)}`,
        rating: 5,
        password: body.password,
    };

    state.users.push(created);
    saveDbState();

    return { status: "success" };
}

export async function loginMock(body: LoginBody): Promise<LoginResponse> {
    await delay();
    const state = getDb();

    const user = state.users.find(
        (entry) => entry.email.toLowerCase() === body.email.toLowerCase() && entry.password === body.password,
    );

    if (!user) {
        throw new Error("Email ou mot de passe invalide");
    }

    return {
        status: "success",
        token: tokenFromUser(user.id),
        user: toPublicUser(user),
    };
}

export async function getCategoriesMock(): Promise<CategoriesResponse> {
    await delay();
    return {
        categories: [...getDb().categories],
    };
}

export async function getArticlesMock(categoryId?: string): Promise<ArticlesResponse> {
    await delay();
    const state = getDb();

    const filtered = state.articles.filter((entry) => {
        if (entry.exchanged) return false;
        if (!categoryId) return true;
        return entry.categories.includes(categoryId);
    });

    return {
        articles: filtered.map(articleToApi),
    };
}

export async function getArticleMock(articleId: string): Promise<ArticleResponse> {
    await delay();
    const article = getDb().articles.find((entry) => entry.id === articleId);
    if (!article) {
        throw new Error("Article introuvable");
    }

    return {
        article: articleToApi(article),
    };
}

export async function getUserArticlesMock(userId: string): Promise<ArticlesResponse> {
    await delay();
    const filtered = getDb().articles.filter((entry) => entry.user_id === userId);

    return {
        articles: filtered.map(articleToApi),
    };
}

export async function getMyArticlesMock(): Promise<ArticlesResponse> {
    await delay();
    const current = getCurrentUserOrThrow();
    const filtered = getDb().articles.filter((entry) => entry.user_id === current.id);

    return {
        articles: filtered.map(articleToApi),
    };
}

export async function createArticleMock(body: CreateArticleBody): Promise<CreateArticleResponse> {
    await delay();
    const current = getCurrentUserOrThrow();
    const state = getDb();

    const created: DbArticle = {
        id: randomId("article"),
        titre: body.titre,
        description: body.description,
        published_at: now(),
        user_id: current.id,
        image: body.image,
        exchanged: false,
        exchanged_at: null,
        categories: [...body.categories],
    };

    state.articles.unshift(created);
    saveDbState();

    return {
        status: "success",
        article_id: created.id,
    };
}

export async function updateArticleMock(articleId: string, body: UpdateArticleBody): Promise<{ status: "success" }> {
    await delay();
    const current = getCurrentUserOrThrow();
    const state = getDb();

    const article = state.articles.find((entry) => entry.id === articleId);
    if (!article) throw new Error("Article introuvable");
    if (article.user_id !== current.id) throw new Error("Action non autorisée");

    if (body.titre !== undefined) article.titre = body.titre;
    if (body.description !== undefined) article.description = body.description;
    if (body.image !== undefined) article.image = body.image;
    if (body.categories !== undefined) article.categories = [...body.categories];

    saveDbState();

    return { status: "success" };
}

export async function deleteArticleMock(articleId: string): Promise<{ status: "success" }> {
    await delay();
    const current = getCurrentUserOrThrow();
    const state = getDb();

    const index = state.articles.findIndex((entry) => entry.id === articleId);
    if (index < 0) throw new Error("Article introuvable");
    if (state.articles[index].user_id !== current.id) throw new Error("Action non autorisée");

    state.articles.splice(index, 1);
    saveDbState();

    return { status: "success" };
}

export async function createExchangeMock(body: CreateExchangeBody): Promise<CreateExchangeResponse> {
    await delay();
    const state = getDb();
    const proposer = getCurrentUserOrThrow();

    if (proposer.id === body.accepter_id) {
        throw new Error("Impossible de créer un échange avec soi-même");
    }

    const accepter = state.users.find((entry) => entry.id === body.accepter_id);
    if (!accepter) throw new Error("Destinataire introuvable");

    assertArticlesBelongToUser(body.proposer_articles, proposer.id);
    assertArticlesBelongToUser(body.accepter_articles, accepter.id);

    const createdExchange: DbExchange = {
        id: randomId("exchange"),
        proposer_id: proposer.id,
        accepter_id: accepter.id,
        proposer_articles: [...body.proposer_articles],
        accepter_articles: [...body.accepter_articles],
        status: "pending",
        updated_at: now(),
    };

    state.exchanges.unshift(createdExchange);

    const firstMessage: DbMessage = {
        id: randomId("message"),
        exchange_id: createdExchange.id,
        user_id: proposer.id,
        type: "message",
        content: body.message,
        proposed_articles: [...body.proposer_articles],
        requested_articles: [...body.accepter_articles],
        is_read: false,
        created_at: now(),
    };

    state.messages.push(firstMessage);
    saveDbState();

    return {
        status: "success",
        exchange_id: createdExchange.id,
    };
}

export async function getExchangesMock(): Promise<ExchangesResponse> {
    await delay();
    const current = getCurrentUserOrThrow();

    const exchanges = getDb().exchanges
        .filter((entry) => participantsContain(entry, current.id))
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .map(exchangeToApi);

    return {
        exchanges,
    };
}

export async function getExchangeMock(exchangeId: string): Promise<ExchangeResponse> {
    await delay();
    const current = getCurrentUserOrThrow();

    const exchange = getDb().exchanges.find((entry) => entry.id === exchangeId);
    if (!exchange) throw new Error("Échange introuvable");
    if (!participantsContain(exchange, current.id)) throw new Error("Action non autorisée");

    return {
        exchange: exchangeToApi(exchange),
    };
}

export async function createMessageMock(body: CreateMessageBody): Promise<CreateMessageResponse> {
    await delay();
    const current = getCurrentUserOrThrow();
    const state = getDb();

    const exchange = state.exchanges.find((entry) => entry.id === body.exchange_id);
    if (!exchange) throw new Error("Échange introuvable");
    if (!participantsContain(exchange, current.id)) throw new Error("Action non autorisée");

    const created: DbMessage = {
        id: randomId("message"),
        exchange_id: exchange.id,
        user_id: current.id,
        type: body.type,
        content: body.content,
        proposed_articles: body.proposed_articles,
        requested_articles: body.requested_articles,
        is_read: false,
        created_at: now(),
    };

    state.messages.push(created);

    if (body.type === "accepted") {
        exchange.status = "accepted";
        exchange.updated_at = now();

        const relatedArticleIds = [...exchange.proposer_articles, ...exchange.accepter_articles];
        state.articles = state.articles.map((article) => {
            if (!relatedArticleIds.includes(article.id)) return article;
            return {
                ...article,
                exchanged: true,
                exchanged_at: now(),
            };
        });
    }

    if (body.type === "refused") {
        exchange.status = "refused";
        exchange.updated_at = now();
    }

    if (body.type === "negotiation") {
        exchange.status = "negotiating";
        exchange.updated_at = now();
    }

    if (body.type === "message") {
        exchange.updated_at = now();
    }

    saveDbState();

    return {
        status: "success",
        message: messageToApi(created),
    };
}

export async function getMessagesMock(exchangeId: string): Promise<MessagesResponse> {
    await delay();
    const current = getCurrentUserOrThrow();

    const exchange = getDb().exchanges.find((entry) => entry.id === exchangeId);
    if (!exchange) throw new Error("Échange introuvable");
    if (!participantsContain(exchange, current.id)) throw new Error("Action non autorisée");

    const messages = getDb().messages
        .filter((entry) => entry.exchange_id === exchangeId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(messageToApi);

    return {
        messages,
    };
}

export async function markMessageAsReadMock(messageId: string): Promise<{ status: "success" }> {
    await delay();
    const current = getCurrentUserOrThrow();
    const state = getDb();

    const message = state.messages.find((entry) => entry.id === messageId);
    if (!message) throw new Error("Message introuvable");

    const exchange = state.exchanges.find((entry) => entry.id === message.exchange_id);
    if (!exchange) throw new Error("Échange introuvable");
    if (!participantsContain(exchange, current.id)) throw new Error("Action non autorisée");

    message.is_read = true;
    saveDbState();

    return { status: "success" };
}

export async function createNegotiationMock(body: CreateNegotiationBody): Promise<CreateNegotiationResponse> {
    await delay();
    const current = getCurrentUserOrThrow();
    const state = getDb();

    const exchange = state.exchanges.find((entry) => entry.id === body.exchange_id);
    if (!exchange) throw new Error("Échange introuvable");
    if (!participantsContain(exchange, current.id)) throw new Error("Action non autorisée");

    const selfIsProposer = exchange.proposer_id === current.id;
    if (selfIsProposer) {
        assertArticlesBelongToUser(body.proposed_articles, exchange.proposer_id);
        assertArticlesBelongToUser(body.requested_articles, exchange.accepter_id);
    } else {
        assertArticlesBelongToUser(body.proposed_articles, exchange.accepter_id);
        assertArticlesBelongToUser(body.requested_articles, exchange.proposer_id);
    }

    if (selfIsProposer) {
        exchange.proposer_articles = [...body.proposed_articles];
        exchange.accepter_articles = [...body.requested_articles];
    } else {
        exchange.proposer_articles = [...body.requested_articles];
        exchange.accepter_articles = [...body.proposed_articles];
    }

    exchange.status = "negotiating";
    exchange.updated_at = now();

    const created: DbMessage = {
        id: randomId("message"),
        exchange_id: exchange.id,
        user_id: current.id,
        type: "negotiation",
        content: body.content,
        proposed_articles: [...body.proposed_articles],
        requested_articles: [...body.requested_articles],
        is_read: false,
        created_at: now(),
    };

    state.messages.push(created);
    saveDbState();

    return {
        status: "success",
        message: {
            ...messageToApi(created),
            type: "negotiation",
        },
    };
}

export function getReadableArticleNameMap(): Record<string, string> {
    const entries = getDb().articles.map((article) => [article.id, article.titre] as const);
    return Object.fromEntries(entries);
}
