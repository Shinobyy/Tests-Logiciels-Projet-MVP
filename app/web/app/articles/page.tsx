"use client";

import ArticleList from '@/components/ArticleList';
import { useAuth } from '@/context/AuthContext';
import { createArticle, getArticles } from '@/services/articles';
import { getCategories } from '@/services/categories';
import { Article, Category } from '@/types/base'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react'

function Articles() {
    const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
    const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated, logout } = useAuth();

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
      console.log(response.articles);
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

  const handleCreateArticle = async (e: { preventDefault: () => void }) => {
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

  let articlesContent: React.ReactNode;
  if (error) {
    articlesContent = <p className="font-bold text-[#d86f56]">{error}</p>;
  } else if (isLoading) {
    articlesContent = <p className="font-bold text-[#c8cbad]">Chargement...</p>;
  } else {
    articlesContent = <ArticleList articles={articles} />;
  }

  return (
    <main className="dofus-page">
      <div className="dofus-frame space-y-5">
        <div className="dofus-panel flex flex-wrap items-center justify-between gap-3 border-b border-[#60674e]">
          <h1 className="text-2xl uppercase tracking-wide md:text-3xl">Catalogue de livres</h1>
          {isAuthenticated && (
            <button className='dofus-btn'
              onClick={() => {
                logout()
                redirect('/auth/login');
                }
              }
            >
              Se déconnecter
            </button>
          )}
          <Link href="/exchanges" className="text-sm font-bold uppercase">
            Voir mes négociations
          </Link>
        </div>

        <section className="grid gap-3 lg:grid-cols-[260px_1fr]">
          <aside className="dofus-panel p-0">
            <div className="border-b border-[#5e664b] px-3 py-2">
              <p className="text-sm font-bold uppercase text-[#f5c81a]">Filtres</p>
            </div>

            <div className="space-y-3 p-3">
              <button
                onClick={loadArticles}
                type="button"
                className="dofus-btn w-full"
              >
                Rafraîchir
              </button>

              <div>
                <label htmlFor="category-filter" className="mb-1 block text-xs font-bold uppercase text-[#c8cbad]">
                  Catégorie active
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="dofus-input"
                >
                  <option value="">Toutes</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.nom}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-sm border-2 border-[#4f5341] bg-[#1b2018] p-2 shadow-inner">
                <p className="mb-2 text-xs font-bold uppercase text-[#c8cbad]">Catégories</p>
                <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    className={`flex w-full items-center gap-2 rounded-sm border px-2 py-1 text-left text-sm transition-colors ${selectedCategory === ''
                        ? 'border-[#70850f] bg-[#2e3a1e] text-[#d7ee2d]'
                        : 'border-[#4f5341] bg-[#232820] text-[#d6d6c4] hover:bg-[#2a3027]'
                      }`}
                  >
                    <span className="h-3 w-3 rounded-sm border border-[#5f654f] bg-[#161a14]" />
                    <span>Toutes</span>
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex w-full items-center gap-2 rounded-sm border px-2 py-1 text-left text-sm transition-colors ${selectedCategory === category.id
                          ? 'border-[#70850f] bg-[#2e3a1e] text-[#d7ee2d]'
                          : 'border-[#4f5341] bg-[#232820] text-[#d6d6c4] hover:bg-[#2a3027]'
                        }`}
                    >
                      <span className="h-3 w-3 rounded-sm border border-[#5f654f] bg-[#161a14]" />
                      <span>{category.nom}</span>
                    </button>
                  ))}
                </div>
              </div>

              {shouldFilterByCategory && selectedCategoryObject && (
                <p className="text-xs font-bold uppercase text-[#f5c81a]">
                  Filtre actif: {selectedCategoryObject.nom}
                </p>
              )}
            </div>
          </aside>

          <div className="dofus-panel p-0">
            <div className="grid grid-cols-[1fr_140px_130px_120px] border-b border-[#5e664b] bg-[#1d221a] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#c8cbad]">
              <p>Livre</p>
              <p>Catégorie</p>
              <p>Publié</p>
              <p className="text-right">Action</p>
            </div>

            <div className="p-2">
              {articlesContent}
            </div>
          </div>
        </section>

        <section className="dofus-panel">
          <h2 className="mb-3 text-xl">Ajouter un livre</h2>
          {isAuthenticated ? (
            <form onSubmit={handleCreateArticle} className="space-y-3">
              <div>
                <label htmlFor="titre" className="mb-1 block text-sm font-bold text-[#f5c81a]">Titre</label>
                <input
                  id="titre"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  required
                  className="dofus-input"
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-1 block text-sm font-bold text-[#f5c81a]">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="dofus-input min-h-24"
                />
              </div>

              <div>
                <label htmlFor="image" className="mb-1 block text-sm font-bold text-[#f5c81a]">URL image</label>
                <input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                  className="dofus-input"
                />
              </div>

              <fieldset className="dofus-panel">
                <legend className="px-2 font-bold text-[#f5c81a]">Catégories</legend>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <label key={category.id} className="dofus-list-item inline-flex items-center gap-2 px-2 py-1 text-sm">
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(category.id)}
                        onChange={() => toggleCategoryForCreate(category.id)}
                        className="h-4 w-4 rounded-sm border border-[#5c624d] bg-[#181c15] text-[#d0ea00] focus:ring-1 focus:ring-[#d0ea00]"
                      />
                      {category.nom}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={isSubmitting}
                className="dofus-btn disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Création...' : 'Créer'}
              </button>
            </form>
          ) : (
            <p className="font-bold text-[#c8cbad]">Connecte-toi pour créer un article.</p>
          )}
        </section>

      </div>
    </main>
  )
}

export default Articles