"use client";

import { useAuth } from '@/context/AuthContext';
import { deleteArticle, getArticle, getMyArticles, updateArticle } from '@/services/articles';
import { createExchange } from '@/services/exchanges';
import { type Article } from '@/types/base'
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
            const response = await createExchange({
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
        if (isLoading) return <p>Chargement...</p>;
        if (error && !article) {
            return (
                <div>
                    <p>{error}</p>
                    <Link href="/articles">Retour à la liste</Link>
                </div>
            );
        }
        if (!article) return <p>Article introuvable.</p>;

        return (
            <div>
                <h1>{article.titre}</h1>
                <p>{article.description}</p>
                <p>Publié le {article.published_at}</p>
                <img src={article.image} alt={article.titre} />
                <p>Catégories: {article.categories.join(', ')}</p>
                <p>Proposé par: {article.user?.pseudonym}</p>
                <p>Statut: {article.exchanged ? 'Échangé' : 'Disponible'}</p>

                <p>
                    <Link href="/articles">Retour aux articles</Link>
                </p>

                {error && <p>{error}</p>}

                {isOwner && (
                    <>
                        <hr />
                        <h2>Actions propriétaire</h2>
                        <button type="button" onClick={() => setIsEditing((value) => !value)}>
                            {isEditing ? 'Annuler édition' : 'Modifier'}
                        </button>
                        <button type="button" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Suppression...' : 'Supprimer'}
                        </button>

                        {isEditing && (
                            <form onSubmit={handleUpdate}>
                                <div>
                                    <label htmlFor="edit-titre">Titre:</label>
                                    <input
                                        id="edit-titre"
                                        value={editTitre}
                                        onChange={(e) => setEditTitre(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-description">Description:</label>
                                    <textarea
                                        id="edit-description"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-image">Image URL:</label>
                                    <input
                                        id="edit-image"
                                        value={editImage}
                                        onChange={(e) => setEditImage(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </form>
                        )}
                    </>
                )}

                {canProposeExchange && (
                    <>
                        <hr />
                        <h2>Proposer un échange</h2>

                        {myArticles.length === 0 ? (
                            <p>Tu n&apos;as pas encore d&apos;article disponible à proposer.</p>
                        ) : (
                            <form onSubmit={handleCreateExchange}>
                                <p>Sélectionne les articles que tu proposes:</p>
                                {myArticles.map((myArticle) => (
                                    <label key={myArticle.id} style={{ marginRight: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProposerArticleIds.includes(myArticle.id)}
                                            onChange={() => toggleProposerArticle(myArticle.id)}
                                        />
                                        {myArticle.titre}
                                    </label>
                                ))}

                                <div>
                                    <label htmlFor="exchange-message">Message initial:</label>
                                    <textarea
                                        id="exchange-message"
                                        value={exchangeMessage}
                                        onChange={(e) => setExchangeMessage(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" disabled={isCreatingExchange}>
                                    {isCreatingExchange ? 'Création...' : 'Envoyer la proposition'}
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>
        );
    }

    return (
        <div>
            {renderContent()}
        </div>
    );
}

export default ArticlePage