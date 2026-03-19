"use client";

import { getExchanges } from "@/services/exchanges";
import { Exchange } from "@/types/base";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function ExchangesPage() {
    const [exchanges, setExchanges] = useState<Exchange[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadExchanges = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const response = await getExchanges();
            const ongoingExchanges = response.exchanges.filter(
                (exchange) => exchange.status === "pending" || exchange.status === "negotiating",
            );
            setExchanges(ongoingExchanges);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Impossible de charger les échanges.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadExchanges();
    }, []);

    return (
        <main>
            <h1>Mes échanges</h1>

            <p>
                <Link href="/articles">Retour aux articles</Link>
            </p>

            <button type="button" onClick={loadExchanges}>
                Rafraîchir
            </button>

            {isLoading && <p>Chargement...</p>}
            {error && <p>{error}</p>}

            {!isLoading && !error && exchanges.length === 0 && <p>Aucun échange pour le moment.</p>}

            {!isLoading && !error && exchanges.length > 0 && (
                <ul>
                    {exchanges.map((exchange) => (
                        <li key={exchange.id}>
                            <p>ID: {exchange.id}</p>
                            <p>
                                {exchange.proposer.pseudonym} ↔ {exchange.accepter.pseudonym}
                            </p>
                            <p>Statut: {exchange.status}</p>
                            <p>Mis à jour: {new Date(exchange.updated_at).toLocaleString()}</p>
                            <Link href={`/exchanges/${exchange.id}`}>Voir le détail</Link>
                            <hr />
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default ExchangesPage;
