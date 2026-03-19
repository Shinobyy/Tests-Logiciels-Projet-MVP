"use client";

import ArticleList from '@/components/ArticleList';
import { useAuth } from '@/context/AuthContext';
import { createArticle, getArticles } from '@/services/articles';
import { getCategories } from '@/services/categories';
import { Article, Category } from '@/types/base'
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react'

function Articles() {
    const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
    const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated } = useAuth();

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const selectedCategoryObject = useMemo(
    () => categories.find((category) => category.id === selectedCategory),
    [categories, selectedCategory],
  );

  const shouldFilterByCategory = selectedCategory !== '';

  const loadArticles = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await getArticles(selectedCategory || undefined);
      setArticles(response.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

    useEffect(() => {
    const loadInit = async () => {
      try {
        const response = await getCategories();
        setCategories(response.categories);
      } catch {
        setCategories([]);
      }
    };

    loadInit();
  }, []);

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleCreateArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Tu dois être connecté pour créer un article.');
      return;
    }
    if (categoryIds.length === 0) {
      setError('Sélectionne au moins une catégorie.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createArticle({
        titre,
        description,
        image,
        categories: categoryIds,
      });
      setTitre('');
      setDescription('');
      setImage('');
      setCategoryIds([]);
      await loadArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategoryForCreate = (id: string) => {
    setCategoryIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      }
      return [...prev, id];
    });
  };

  return (
    <div>
    <h1>Articles</h1>
      <p>
        <Link href="/exchanges">Voir mes échanges</Link>
      </p>

    <div>
    <label htmlFor="category-filter">Filtrer par catégorie: </label>
    <select
      id="category-filter"
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
    >
      <option value="">Toutes</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>{category.nom}</option>
      ))}
    </select>
    {shouldFilterByCategory && selectedCategoryObject && (
      <p>Filtre actif: {selectedCategoryObject.nom}</p>
    )}
    </div>

    <button onClick={loadArticles} type="button">Rafraîchir</button>

    <hr />

    <h2>Créer un article</h2>
    {isAuthenticated ? (
    <form onSubmit={handleCreateArticle}>
      <div>
        <label htmlFor="titre">Titre:</label>
        <input id="titre" value={titre} onChange={(e) => setTitre(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="image">URL image:</label>
        <input id="image" value={image} onChange={(e) => setImage(e.target.value)} required />
      </div>
      <fieldset>
        <legend>Catégories</legend>
        {categories.map((category) => (
          <label key={category.id} style={{ marginRight: '10px' }}>
            <input
              type="checkbox"
              checked={categoryIds.includes(category.id)}
              onChange={() => toggleCategoryForCreate(category.id)}
            />
            {category.nom}
          </label>
        ))}
      </fieldset>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Création...' : 'Créer'}
      </button>
    </form>
    ) : (
    <p>Connecte-toi pour créer un article.</p>
    )}

    <hr />

      {error ? (
        <p>{error}</p>
    ) : isLoading ? (
    <p>Chargement...</p>
      ) : (
        <ArticleList articles={articles} />
      )}
    </div>
  )
}

export default Articles