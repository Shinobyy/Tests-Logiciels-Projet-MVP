"use client";

import ArticleList from '@/components/ArticleList';
import { getArticles } from '@/services/articles';
import { Article } from '@/types/base'
import React, { useEffect, useState } from 'react'

function Articles() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await getArticles();
                setArticles(response.articles);
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