import { Article, Category, Exchange, Message, MessageType, User } from "./base";

// -------------------------
// Auth
// -------------------------
export interface RegisterBody {
    email: string;
    pseudonym: string;
    password: string;
}
export interface RegisterResponse {
    status: "success";
}

export interface LoginBody {
    email: string;
    password: string;
}
export interface LoginResponse {
    status: "success";
    token: string;
    user: Pick<User, "id" | "email" | "pseudonym" | "avatar">;
}

// -------------------------
// Articles
// -------------------------
export interface ArticlesResponse {
    articles: Article[];
}
export interface ArticleResponse {
    article: Article;
}
export interface CreateArticleBody {
    titre: string;
    description: string;
    categories: string[];
    image: string;
}
export interface CreateArticleResponse {
    status: "success";
    article_id: string;
}
export interface UpdateArticleBody {
    titre?: string;
    description?: string;
    categories?: string[];
    image?: string;
}

// -------------------------
// Categories
// -------------------------
export interface CategoriesResponse {
    categories: Category[];
}

// -------------------------
// Exchanges
// -------------------------
export interface CreateExchangeBody {
    accepter_id: string;
    proposer_articles: string[];
    accepter_articles: string[];
    message: string;
}
export interface CreateExchangeResponse {
    status: "success";
    exchange_id: string;
}
export interface ExchangesResponse {
    exchanges: Exchange[];
}
export interface ExchangeResponse {
    exchange: Exchange;
}

// -------------------------
// Messages
// -------------------------
export interface CreateMessageBody {
    exchange_id: string;
    type: MessageType;
    content: string;
    proposed_articles: string[] | null;
    requested_articles: string[] | null;
}
export interface CreateMessageResponse {
    status: "success";
    message: Message;
}
export interface MessagesResponse {
    messages: Message[];
}
export interface UpdateMessageBody {
    is_read: true;
}

// -------------------------
// Negotiations
// -------------------------
export interface CreateNegotiationBody {
    exchange_id: string;
    proposed_articles: string[];
    requested_articles: string[];
    content: string;
}
export interface CreateNegotiationResponse {
    status: "success";
    message: Message & { type: "negotiation" };
}