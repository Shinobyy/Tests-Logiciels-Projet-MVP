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

    const otherParticipantId = useMemo(() => {
        if (!exchange || !user) return null;
        return exchange.proposer.id === user.id ? exchange.accepter.id : exchange.proposer.id;
    }, [exchange, user]);

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
            setMessages(messagesResponse.messages);

            const unreadForCurrentUser = messagesResponse.messages.filter(
                (message) => !message.is_read && message.user.id !== user?.id,
            );
            if (unreadForCurrentUser.length > 0) {
                await Promise.all(unreadForCurrentUser.map((message) => markMessageAsRead(message.id)));
                const refreshedMessages = await getMessages(id);
                setMessages(refreshedMessages.messages);
            }

            if (user) {
                const myArticlesResponse = await getMyArticles();
                setMyArticles(myArticlesResponse.articles);

                const otherId = exchangeResponse.exchange.proposer.id === user.id
                    ? exchangeResponse.exchange.accepter.id
                    : exchangeResponse.exchange.proposer.id;

                const otherArticlesResponse = await getUserArticles(otherId);
                setOtherUserArticles(otherArticlesResponse.articles);
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

        const content = type === "message"
            ? newMessage.trim()
            : type === "accepted"
                ? "Échange accepté"
                : "Échange refusé";

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

    return (
        <main>
            <h1>Détail échange</h1>

            <p>
                <Link href="/exchanges">Retour aux échanges</Link>
            </p>

            {isLoading && <p>Chargement...</p>}
            {error && <p>{error}</p>}

            {!isLoading && !error && exchange && (
                <>
                    <section>
                        <h2>Informations</h2>
                        <p>ID: {exchange.id}</p>
                        <p>
                            {exchange.proposer.pseudonym} ↔ {exchange.accepter.pseudonym}
                        </p>
                        <p>Statut: {exchange.status}</p>
                        <p>Mis à jour: {new Date(exchange.updated_at).toLocaleString()}</p>
                        <p>
                            Participant opposé: {otherParticipantId ?? "-"}
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2>Actions rapides</h2>
                        {isTerminalStatus && <p>Échange finalisé, aucune action de décision possible.</p>}
                        <button
                            type="button"
                            onClick={() => sendStandardMessage("accepted")}
                            disabled={isSubmittingMessage || isTerminalStatus}
                        >
                            Accepter
                        </button>
                        <button
                            type="button"
                            onClick={() => sendStandardMessage("refused")}
                            disabled={isSubmittingMessage || isTerminalStatus}
                        >
                            Refuser
                        </button>
                    </section>

                    <hr />

                    <section>
                        <h2>Messagerie</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendStandardMessage("message");
                            }}
                        >
                            <label htmlFor="message-content">Message:</label>
                            <textarea
                                id="message-content"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={isSubmittingMessage}>
                                {isSubmittingMessage ? "Envoi..." : "Envoyer"}
                            </button>
                        </form>

                        {messages.length === 0 ? (
                            <p>Aucun message.</p>
                        ) : (
                            <ul>
                                {messages.map((message) => (
                                    <li key={message.id}>
                                        <p>
                                            <strong>{message.user.pseudonym}</strong> · {message.type} · {new Date(message.created_at).toLocaleString()}
                                        </p>
                                        <p>{message.content}</p>
                                        {message.proposed_articles && message.proposed_articles.length > 0 && (
                                            <p>
                                                Proposé: {message.proposed_articles.map(articleLabel).join(", ")}
                                            </p>
                                        )}
                                        {message.requested_articles && message.requested_articles.length > 0 && (
                                            <p>
                                                Demandé: {message.requested_articles.map(articleLabel).join(", ")}
                                            </p>
                                        )}
                                        <p>{message.is_read ? "Lu" : "Non lu"}</p>
                                        <hr />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <hr />

                    <section>
                        <h2>Négociation</h2>
                        {isTerminalStatus && <p>Échange finalisé, négociation désactivée.</p>}
                        <form onSubmit={submitNegotiation}>
                            <div>
                                <p>Mes articles proposés</p>
                                {myArticles.length === 0 ? (
                                    <p>Aucun article disponible.</p>
                                ) : (
                                    myArticles.map((article) => (
                                        <label key={article.id} style={{ marginRight: "10px" }}>
                                            <input
                                                type="checkbox"
                                                checked={proposedArticles.includes(article.id)}
                                                onChange={() => toggleInArray(article.id, proposedArticles, setProposedArticles)}
                                                disabled={isTerminalStatus}
                                            />
                                            {article.titre}
                                        </label>
                                    ))
                                )}
                            </div>

                            <div>
                                <p>Articles demandés à l'autre utilisateur</p>
                                {otherUserArticles.length === 0 ? (
                                    <p>Aucun article disponible.</p>
                                ) : (
                                    otherUserArticles.map((article) => (
                                        <label key={article.id} style={{ marginRight: "10px" }}>
                                            <input
                                                type="checkbox"
                                                checked={requestedArticles.includes(article.id)}
                                                onChange={() => toggleInArray(article.id, requestedArticles, setRequestedArticles)}
                                                disabled={isTerminalStatus}
                                            />
                                            {article.titre}
                                        </label>
                                    ))
                                )}
                            </div>

                            <div>
                                <label htmlFor="negotiation-content">Message de négociation:</label>
                                <textarea
                                    id="negotiation-content"
                                    value={negotiationText}
                                    onChange={(e) => setNegotiationText(e.target.value)}
                                    required
                                    disabled={isTerminalStatus}
                                />
                            </div>

                            <button type="submit" disabled={isSubmittingNegotiation || isTerminalStatus}>
                                {isSubmittingNegotiation ? "Envoi..." : "Envoyer une négociation"}
                            </button>
                        </form>
                    </section>
                </>
            )}
        </main>
    );
}

export default ExchangeDetailPage;
