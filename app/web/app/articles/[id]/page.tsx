"use client";

import { useAuth } from '@/context/AuthContext';
import { deleteArticle, getArticle, getMyArticles, updateArticle } from '@/services/articles';
import { negotiationCommands } from '@/services/cqrs/negotiationCommands';
import { type Article } from '@/types/base'
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

function ArticlePage() {
    const { id }: { id: string } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [article, setArticle] = useState<Article | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [editTitre, setEditTitre] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editImage, setEditImage] = useState('');
    const [myArticles, setMyArticles] = useState<Article[]>([]);
    const [selectedProposerArticleIds, setSelectedProposerArticleIds] = useState<string[]>([]);
    const [exchangeMessage, setExchangeMessage] = useState('Bonjour, je propose cet échange.');
    const [isCreatingExchange, setIsCreatingExchange] = useState(false);

    const isOwner = !!article?.user && !!user && article.user.id === user.id;
    const canProposeExchange = !!user && !!article?.user && !isOwner && !article.exchanged;

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setError(null);
                setIsLoading(true);
                const response = await getArticle(id);
                setArticle(response.article);
                setEditTitre(response.article.titre);
                setEditDescription(response.article.description);
                setEditImage(response.article.image);
            } catch {
                setError('Article introuvable.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    useEffect(() => {
        const loadMyArticles = async () => {
            if (!user) {
                setMyArticles([]);
                return;
            }

            try {
                const response = await getMyArticles();
                setMyArticles(response.articles.filter((entry) => !entry.exchanged));
            } catch {
                setMyArticles([]);
            }
        };

        loadMyArticles();
    }, [user]);

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            await updateArticle(id, {
                titre: editTitre,
                description: editDescription,
                image: editImage,
            });

            const response = await getArticle(id);
            setArticle(response.article);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Mise à jour impossible.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            await deleteArticle(id);
            router.push('/articles');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Suppression impossible.');
            setIsDeleting(false);
        }
    };

    const toggleProposerArticle = (articleId: string) => {
        setSelectedProposerArticleIds((prev) => {
            if (prev.includes(articleId)) {
                return prev.filter((entry) => entry !== articleId);
            }
            return [...prev, articleId];
        });
    };

    const handleCreateExchange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!article?.user) {
            setError('Impossible de récupérer le propriétaire de cet article.');
            return;
        }

        if (selectedProposerArticleIds.length === 0) {
            setError('Sélectionne au moins un de tes articles à proposer.');
            return;
        }

        setIsCreatingExchange(true);
        setError(null);

        try {
            const response = await negotiationCommands.proposeNegotiation({
                accepter_id: article.user.id,
                proposer_articles: selectedProposerArticleIds,
                accepter_articles: [article.id],
                message: exchangeMessage,
            });

            router.push(`/exchanges/${response.exchange_id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Création de l’échange impossible.');
            setIsCreatingExchange(false);
        }
    };

    function renderContent() {
        if (isLoading) return <p className="font-bold text-[#c8cbad]">Chargement...</p>;
        if (error && !article) {
            return (
                <div className="space-y-2">
                    <p className="font-bold text-[#d86f56]">{error}</p>
                    <Link href="/articles" className="text-sm font-bold">Retour à la liste</Link>
                </div>
            );
        }
        if (!article) return <p className="font-bold text-[#d86f56]">Article introuvable.</p>;

        return (
            <div className="space-y-4">
                <section className="dofus-panel">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h1 className="text-2xl uppercase tracking-wide">{article.titre}</h1>
                        <Link href="/articles" className="text-sm font-bold uppercase">Retour aux articles</Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                        <div className="rounded-sm border-2 border-[#4f5341] bg-[#181c15] p-1 shadow-inner">
                            <Image
                                src={article.image}
                                alt={article.titre}
                                width={220}
                                height={192}
                                className="h-48 w-full rounded-sm object-cover"
                            />
                        </div>

                        <div className="space-y-2">
                            <p>{article.description}</p>
                            <p className="text-xs font-bold text-[#b6ba97]">Publié le {article.published_at}</p>
                            <p className="text-sm"><span className="font-bold">Catégories:</span> {article.categories.join(', ')}</p>
                            <p className="text-sm"><span className="font-bold">Proposé par:</span> {article.user?.pseudonym}</p>
                            <p className="text-sm"><span className="font-bold">Statut:</span> {article.exchanged ? 'Échangé' : 'Disponible'}</p>
                        </div>
                    </div>
                </section>

                {error && <p className="font-bold text-[#d86f56]">{error}</p>}

                {isOwner && (
                    <section className="dofus-panel">
                            <h2 className="mb-3 text-xl">Actions propriétaire</h2>
                            <div className="mb-3 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing((value) => !value)}
                                    className="dofus-btn"
                                >
                                    {isEditing ? 'Annuler édition' : 'Modifier'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="dofus-btn-muted disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                                </button>
                            </div>

                            {isEditing && (
                                <form onSubmit={handleUpdate} className="space-y-3">
                                    <div>
                                        <label htmlFor="edit-titre" className="mb-1 block text-sm font-bold text-[#f5c81a]">Titre</label>
                                    <input
                                        id="edit-titre"
                                        value={editTitre}
                                        onChange={(e) => setEditTitre(e.target.value)}
                                        required
                                        className="dofus-input"
                                    />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-description" className="mb-1 block text-sm font-bold text-[#f5c81a]">Description</label>
                                    <textarea
                                        id="edit-description"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        required
                                        className="dofus-input min-h-24"
                                    />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-image" className="mb-1 block text-sm font-bold text-[#f5c81a]">Image URL</label>
                                    <input
                                        id="edit-image"
                                        value={editImage}
                                        onChange={(e) => setEditImage(e.target.value)}
                                        required
                                        className="dofus-input"
                                    />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="dofus-btn disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </form>
                            )}
                        </section>
                )}

                {canProposeExchange && (
                    <section className="dofus-panel">
                            <h2 className="mb-3 text-xl">Proposer un échange</h2>

                            {myArticles.length === 0 ? (
                                <p className="font-bold text-[#c8cbad]">Tu n&apos;as pas encore d&apos;article disponible à proposer.</p>
                            ) : (
                                <form onSubmit={handleCreateExchange} className="space-y-3">
                                    <p className="font-bold text-[#f5c81a]">Sélectionne les articles que tu proposes :</p>
                                    <div className="flex flex-wrap gap-2">
                                        {myArticles.map((myArticle) => (
                                            <label key={myArticle.id} className="dofus-list-item inline-flex items-center gap-2 px-2 py-1 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProposerArticleIds.includes(myArticle.id)}
                                                    onChange={() => toggleProposerArticle(myArticle.id)}
                                                    className="h-4 w-4 rounded-sm border border-[#5c624d] bg-[#181c15] text-[#d0ea00] focus:ring-1 focus:ring-[#d0ea00]"
                                                />
                                                {myArticle.titre}
                                            </label>
                                        ))}
                                    </div>

                                    <div>
                                        <label htmlFor="exchange-message" className="mb-1 block text-sm font-bold text-[#f5c81a]">Message initial</label>
                                        <textarea
                                            id="exchange-message"
                                            value={exchangeMessage}
                                            onChange={(e) => setExchangeMessage(e.target.value)}
                                            required
                                            className="dofus-input min-h-24"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isCreatingExchange}
                                        className="dofus-btn disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isCreatingExchange ? 'Création...' : 'Envoyer la proposition'}
                                    </button>
                                </form>
                            )}
                        </section>
                )}
            </div>
        );
    }

    return (
        <main className="dofus-page">
            <div className="dofus-frame max-w-5xl">
                {renderContent()}
            </div>
        </main>
    );
}

export default ArticlePage