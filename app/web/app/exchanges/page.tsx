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
        <main className="dofus-page">
            <div className="dofus-frame space-y-4">
                <div className="dofus-panel flex flex-wrap items-center justify-between gap-3 border-b border-[#60674e]">
                    <h1 className="text-2xl uppercase tracking-wide md:text-3xl">Mes négociations</h1>
                    <Link href="/articles" className="text-sm font-bold uppercase">
                        Retour au catalogue
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={loadExchanges}
                    className="dofus-btn"
                >
                    Rafraîchir
                </button>

                {isLoading && <p className="font-bold text-[#c8cbad]">Chargement...</p>}
                {error && <p className="font-bold text-[#d86f56]">{error}</p>}

                {!isLoading && !error && exchanges.length === 0 && (
                    <p className="dofus-panel text-sm font-bold text-[#c8cbad]">
                        Aucune négociation pour le moment.
                    </p>
                )}

                {!isLoading && !error && exchanges.length > 0 && (
                    <ul className="space-y-2">
                        {exchanges.map((exchange) => (
                            <li
                                key={exchange.id}
                                className="dofus-list-item"
                            >
                                <p className="text-xs font-bold text-[#9ea37e]">ID: {exchange.id}</p>
                                <p className="font-bold text-[#f5c81a]">
                                    {exchange.proposer.pseudonym} ↔ {exchange.accepter.pseudonym}
                                </p>
                                <p className="text-sm">Statut: {exchange.status}</p>
                                <p className="text-sm">Mis à jour: {new Date(exchange.updated_at).toLocaleString()}</p>
                                <div className="mt-2">
                                    <Link
                                        href={`/exchanges/${exchange.id}`}
                                        className="dofus-btn inline-block px-3 py-1 text-xs"
                                    >
                                        Voir le détail
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}

export default ExchangesPage;
