"use client";

import ArticleList from '@/components/ArticleList';
import { getArticles } from '@/services/articles';
import { Article } from '@/types/base'
import React, { useEffect, useState } from 'react'

const mockArticles: Article[] = [
    {
        id: '1',
        titre: 'Article 1',
        description: 'Description de l\'article 1',
        published_at: '2024-01-01',
        categories: ['Catégorie 1'],
        image: 'https://via.placeholder.com/150',
        user: { id: '1', pseudonym: 'User1', avatar: 'https://via.placeholder.com/50' },
    },
    {
        id: '2',
        titre: 'Article 2',
        description: 'Description de l\'article 2',
        published_at: '2024-01-02',
        categories: ['Catégorie 2'],
        image: 'https://via.placeholder.com/150',
        user: { id: '2', pseudonym: 'User2', avatar: 'https://via.placeholder.com/50' },
    },
];

function Articles() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                // const response = await getArticles();
                // setArticles(response.articles);

                setArticles(mockArticles);
            } catch (error) {
                console.error('Error fetching articles:', error);
                setError('Failed to load articles. Please try again later.');
            }
        }
        fetchArticles();
    }, []);

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : (
        <ArticleList articles={articles} />
      )}
    </div>
  )
}

export default Articles