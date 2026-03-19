"use client";

import { useAuth } from "@/context/AuthContext";
import { getMyArticles, getUserArticles } from "@/services/articles";
import { getExchange } from "@/services/exchanges";
import { createMessage, getMessages, markMessageAsRead } from "@/services/messages";
import { createNegotiation } from "@/services/notifications";
import { Article, Exchange, Message } from "@/types/base";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const SLOT_COUNT = 10;
const SLOT_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function ExchangeDetailPage() {
    const { id }: { id: string } = useParams();
    const { user } = useAuth();

    const [exchange, setExchange] = useState<Exchange | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [myArticles, setMyArticles] = useState<Article[]>([]);
    const [otherUserArticles, setOtherUserArticles] = useState<Article[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
    const [isSubmittingNegotiation, setIsSubmittingNegotiation] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [newMessage, setNewMessage] = useState("");
    const [negotiationText, setNegotiationText] = useState("Proposition de négociation");
    const [proposedArticles, setProposedArticles] = useState<string[]>([]);
    const [requestedArticles, setRequestedArticles] = useState<string[]>([]);

    const articleNameMap = useMemo(() => {
        const entries = [...myArticles, ...otherUserArticles].map((article) => [article.id, article.titre] as const);
        return new Map(entries);
    }, [myArticles, otherUserArticles]);

    const articleLabel = (articleId: string) => articleNameMap.get(articleId) ?? articleId;
    const isTerminalStatus = exchange?.status === "accepted" || exchange?.status === "refused";

    const refreshExchangeData = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);

            const exchangeResponse = await getExchange(id);
            setExchange(exchangeResponse.exchange);

            const messagesResponse = await getMessages(id);
            const loadedMessages = messagesResponse.messages ?? [];
            setMessages(loadedMessages);

            const unreadForCurrentUser = loadedMessages.filter(
                (message) => !message.is_read && message.user.id !== user?.id,
            );
            if (unreadForCurrentUser.length > 0) {
                await Promise.all(unreadForCurrentUser.map((message) => markMessageAsRead(message.id)));
                const refreshedMessages = await getMessages(id);
                setMessages(refreshedMessages.messages ?? []);
            }

            if (user) {
                const myArticlesResponse = await getMyArticles();
                const myArticlesList = myArticlesResponse.articles ?? [];
                setMyArticles(myArticlesList);

                const isCurrentUserProposer = exchangeResponse.exchange.proposer.id === user.id;

                const otherId = isCurrentUserProposer
                    ? exchangeResponse.exchange.accepter.id
                    : exchangeResponse.exchange.proposer.id;

                const otherArticlesResponse = await getUserArticles(otherId);
                const otherArticlesList = otherArticlesResponse.articles ?? [];
                setOtherUserArticles(otherArticlesList);

                const myArticleIds = new Set(myArticlesList.map((article) => article.id));
                const otherArticleIds = new Set(otherArticlesList.map((article) => article.id));

                const initialProposed = isCurrentUserProposer
                    ? exchangeResponse.exchange.proposer_articles
                    : exchangeResponse.exchange.accepter_articles;
                const initialRequested = isCurrentUserProposer
                    ? exchangeResponse.exchange.accepter_articles
                    : exchangeResponse.exchange.proposer_articles;

                const safeInitialProposed = initialProposed ?? [];
                const safeInitialRequested = initialRequested ?? [];

                setProposedArticles(safeInitialProposed.filter((articleId) => myArticleIds.has(articleId)));
                setRequestedArticles(safeInitialRequested.filter((articleId) => otherArticleIds.has(articleId)));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Impossible de charger l'échange.");
        } finally {
            setIsLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        refreshExchangeData();
    }, [refreshExchangeData]);

    const sendStandardMessage = async (type: "message" | "accepted" | "refused") => {
        if (!exchange) return;

        if ((type === "accepted" || type === "refused") && isTerminalStatus) {
            setError("Cet échange est déjà finalisé.");
            return;
        }

        let content = "";
        if (type === "message") {
            content = newMessage.trim();
        } else if (type === "accepted") {
            content = "Échange accepté";
        } else {
            content = "Échange refusé";
        }

        if (!content) return;

        setIsSubmittingMessage(true);
        setError(null);

        try {
            await createMessage({
                exchange_id: exchange.id,
                type,
                content,
                proposed_articles: null,
                requested_articles: null,
            });

            if (type === "message") {
                setNewMessage("");
            }

            await refreshExchangeData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Envoi du message impossible.");
        } finally {
            setIsSubmittingMessage(false);
        }
    };

    const toggleInArray = (
        idToToggle: string,
        values: string[],
        setter: React.Dispatch<React.SetStateAction<string[]>>,
    ) => {
        if (values.includes(idToToggle)) {
            setter(values.filter((entry) => entry !== idToToggle));
            return;
        }
        setter([...values, idToToggle]);
    };

    const submitNegotiation = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!exchange) return;

        if (isTerminalStatus) {
            setError("Cet échange est finalisé, la négociation n'est plus possible.");
            return;
        }

        if (proposedArticles.length === 0 || requestedArticles.length === 0) {
            setError("Sélectionne au moins un article proposé et un article demandé.");
            return;
        }

        setIsSubmittingNegotiation(true);
        setError(null);

        try {
            await createNegotiation({
                exchange_id: exchange.id,
                proposed_articles: proposedArticles,
                requested_articles: requestedArticles,
                content: negotiationText,
            });

            setNegotiationText("Proposition de négociation");
            setProposedArticles([]);
            setRequestedArticles([]);
            await refreshExchangeData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Négociation impossible.");
        } finally {
            setIsSubmittingNegotiation(false);
        }
    };

    const renderSlots = (
        articles: Article[],
        selectedValues: string[],
        setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>,
    ) => {
        return SLOT_IDS.map((slotId, index) => {
            const article = articles[index];

            if (!article) {
                return <div key={`slot-empty-${slotId}`} className="dofus-slot" />;
            }

            const isSelected = selectedValues.includes(article.id);

            return (
                <label
                    key={article.id}
                    title={article.titre}
                    className={`dofus-slot relative block cursor-pointer overflow-hidden ${isSelected ? "ring-2 ring-[#d0ea00]" : ""}`}
                >
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleInArray(article.id, selectedValues, setSelectedValues)}
                        disabled={isTerminalStatus}
                        className="sr-only"
                    />
                    <img
                        src={article.image}
                        alt={article.titre}
                        className="h-full w-full object-cover"
                    />
                </label>
            );
        });
    };

    return (
        <main className="dofus-page">
            <div className="dofus-frame space-y-4">
                <div className="dofus-panel flex flex-wrap items-center justify-between gap-3 border-b border-[#60674e]">
                    <h1 className="text-2xl uppercase tracking-wide">Négociation de livres</h1>
                    <Link href="/exchanges" className="text-sm font-bold uppercase">Retour aux négociations</Link>
                </div>

                {isLoading && <p className="font-bold text-[#c8cbad]">Chargement...</p>}
                {error && <p className="font-bold text-[#d86f56]">{error}</p>}

                {!isLoading && !error && exchange && (
                    <>
                        <section className="grid gap-3 lg:grid-cols-2">
                            <article className="dofus-panel space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl">{exchange.proposer.pseudonym}</h2>
                                </div>

                                <div className="dofus-slot-grid">
                                    {renderSlots(myArticles, proposedArticles, setProposedArticles)}
                                </div>

                                <p className="text-xs text-[#b9bc9d]">Survole une case pour voir le nom de l&apos;article.</p>
                            </article>

                            <article className="dofus-panel space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl">{exchange.accepter.pseudonym}</h2>
                                </div>

                                <div className="dofus-slot-grid">
                                    {renderSlots(otherUserArticles, requestedArticles, setRequestedArticles)}
                                </div>

                                <p className="text-xs text-[#b9bc9d]">Survole une case pour voir le nom de l&apos;article.</p>
                            </article>
                        </section>

                        <section className="dofus-panel space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#c8cbad]">
                                <p>ID: {exchange.id}</p>
                                <p>Statut: <span className="font-bold text-[#f5c81a]">{exchange.status}</span></p>
                                <p>Mis à jour: {new Date(exchange.updated_at).toLocaleString()}</p>
                            </div>

                            {isTerminalStatus && (
                                <p className="rounded-sm border border-[#7e6d3c] bg-[#2a271d] px-3 py-2 text-sm font-bold text-[#f5c81a]">
                                    Négociation finalisée, modification désactivée.
                                </p>
                            )}

                            <form onSubmit={submitNegotiation} className="space-y-2">
                                <label htmlFor="negotiation-content" className="text-sm font-bold text-[#f5c81a]">
                                    Message de négociation
                                </label>
                                <textarea
                                    id="negotiation-content"
                                    value={negotiationText}
                                    onChange={(e) => setNegotiationText(e.target.value)}
                                    required
                                    disabled={isTerminalStatus}
                                    className="dofus-input min-h-20 disabled:opacity-70"
                                />

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmittingNegotiation || isTerminalStatus}
                                        className="dofus-btn disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isSubmittingNegotiation ? "Envoi..." : "Valider"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => sendStandardMessage("accepted")}
                                        disabled={isSubmittingMessage || isTerminalStatus}
                                        className="dofus-btn disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        Accepter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => sendStandardMessage("refused")}
                                        disabled={isSubmittingMessage || isTerminalStatus}
                                        className="dofus-btn-muted disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="dofus-panel space-y-2">
                            <h2 className="text-xl">Canal de discussion</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendStandardMessage("message");
                                }}
                                className="space-y-2"
                            >
                                <textarea
                                    id="message-content"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    required
                                    className="dofus-input min-h-20"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmittingMessage}
                                    className="dofus-btn disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmittingMessage ? "Envoi..." : "Envoyer"}
                                </button>
                            </form>

                            {messages.length === 0 ? (
                                <p className="text-sm text-[#b9bc9d]">Aucun message.</p>
                            ) : (
                                <ul className="space-y-1">
                                    {messages.map((message) => (
                                        <li key={message.id} className="dofus-list-item">
                                            <p className="text-sm font-bold text-[#f5c81a]">
                                                {message.user.pseudonym} · {message.type} · {new Date(message.created_at).toLocaleString()}
                                            </p>
                                            <p className="text-sm">{message.content}</p>
                                            {message.proposed_articles && message.proposed_articles.length > 0 && (
                                                <p className="text-xs text-[#c8cbad]">
                                                    Proposé: {message.proposed_articles.map(articleLabel).join(", ")}
                                                </p>
                                            )}
                                            {message.requested_articles && message.requested_articles.length > 0 && (
                                                <p className="text-xs text-[#c8cbad]">
                                                    Demandé: {message.requested_articles.map(articleLabel).join(", ")}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}

export default ExchangeDetailPage;
