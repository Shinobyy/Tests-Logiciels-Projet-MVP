import { ArticleResponse, ArticlesResponse, CreateArticleBody, CreateArticleResponse, UpdateArticleBody } from "@/types/api";
import {
    createArticleMock,
    deleteArticleMock,
    getArticleMock,
    getArticlesMock,
    getMyArticlesMock,
    getUserArticlesMock,
    updateArticleMock,
} from "@/services/mockDb";
// import { apiFetch } from "@/utils/api";

export function getUserArticles(userId: string): Promise<ArticlesResponse> {
    // return apiFetch<ArticlesResponse>(`/users/${userId}/articles`);
    return getUserArticlesMock(userId);
}

export function getMyArticles(): Promise<ArticlesResponse> {
    // return apiFetch<ArticlesResponse>('/users/me/articles');
    return getMyArticlesMock();
}


export function getArticles(categoryId?: string): Promise<ArticlesResponse> {
    // return apiFetch<ArticlesResponse>('/articles', {
    //     params: categoryId ? { category: categoryId } : undefined,
    // });
    return getArticlesMock(categoryId);
}

export function getArticle(articleId: string): Promise<ArticleResponse> {
    // return apiFetch<ArticleResponse>(`/articles/${articleId}`);
    return getArticleMock(articleId);
}

export function createArticle(body: CreateArticleBody): Promise<CreateArticleResponse> {
    // return apiFetch<CreateArticleResponse>('/articles', {
    //     method: 'POST',
    //     data: body,
    // });
    return createArticleMock(body);
}

export function updateArticle(articleId: string, body: UpdateArticleBody): Promise<{ status: "success" }> {
    // return apiFetch<{ status: "success" }>(`/articles/${articleId}`, {
    //     method: 'PUT',
    //     data: body,
    // });
    return updateArticleMock(articleId, body);
}

export function deleteArticle(articleId: string): Promise<{ status: "success" }> {
    // return apiFetch<{ status: "success" }>(`/articles/${articleId}`, {
    //     method: 'DELETE',
    // });
    return deleteArticleMock(articleId);
}