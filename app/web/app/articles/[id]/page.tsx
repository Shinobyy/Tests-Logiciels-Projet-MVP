"use client";

import { getArticle } from '@/services/articles';
import { type Article } from '@/types/base'
import { redirect, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

function ArticlePage() {
    const { id }: { id: string } = useParams();
    const [article, setArticle] = useState<Article | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await getArticle(id);
                setArticle(response.article);
            } catch (err) {
                redirect('/articles');
            }
        };

        fetchArticle();
    }, [id]);

    function renderContent() {
        if (!article) return <p>Loading...</p>;
        return (
            <div>
                <h1>{article.titre}</h1>
                <p>{article.description}</p>
                <p>Publié le {article.published_at}</p>
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