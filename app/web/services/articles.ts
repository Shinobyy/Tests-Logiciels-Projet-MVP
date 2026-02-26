import { ArticleResponse, ArticlesResponse, CreateArticleBody, CreateArticleResponse, UpdateArticleBody } from "@/types/api";
import { apiFetch } from "@/utils/api";

export function getUserArticles(userId: string): Promise<ArticlesResponse> {
    return apiFetch<ArticlesResponse>(`/users/${userId}/articles`);
}

export function getMyArticles(): Promise<ArticlesResponse> {
    return apiFetch<ArticlesResponse>('/users/me/articles');
}


export function getArticles(categoryId?: string): Promise<ArticlesResponse> {
    return apiFetch<ArticlesResponse>('/articles', {
        params: categoryId ? { category: categoryId } : undefined,
    });
}

export function getArticle(articleId: string): Promise<ArticleResponse> {
    return apiFetch<ArticleResponse>(`/articles/${articleId}`);
}

export function createArticle(body: CreateArticleBody): Promise<CreateArticleResponse> {
    return apiFetch<CreateArticleResponse>('/articles', {
        method: 'POST',
        data: body,
    });
}

export function updateArticle(articleId: string, body: UpdateArticleBody): Promise<{ status: "success" }> {
    return apiFetch<{ status: "success" }>(`/articles/${articleId}`, {
        method: 'PUT',
        data: body,
    });
}

export function deleteArticle(articleId: string): Promise<{ status: "success" }> {
    return apiFetch<{ status: "success" }>(`/articles/${articleId}`, {
        method: 'DELETE',
    });
}