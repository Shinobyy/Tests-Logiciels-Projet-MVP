export interface User {
    id: string;
    email: string;
    pseudonym: string;
    avatar: string;
    rating: number;
}

export interface UserSummary {
    id: string;
    pseudonym: string;
    avatar: string;
}

export interface Article {
    id: string;
    titre: string;
    description: string;
    published_at: string;
    categories: string[];
    image: string;
    exchanged?: boolean;
    exchanged_at?: string | null;
    user?: UserSummary;
}

export interface Category {
    id: string;
    nom: string;
}

export type ExchangeStatus = "pending" | "accepted" | "refused" | "negotiating";
export type MessageType = "message" | "negotiation" | "accepted" | "refused";

export interface Exchange {
    id: string;
    proposer: UserSummary;
    accepter: UserSummary;
    proposer_articles: string[];
    accepter_articles: string[];
    status: ExchangeStatus;
    updated_at: string;
}

export interface Message {
    id: string;
    exchange_id: string;
    user: UserSummary;
    type: MessageType;
    content: string;
    proposed_articles: string[] | null;
    requested_articles: string[] | null;
    is_read: boolean;
    created_at: string;
}