import { CategoriesResponse } from "@/types/api";
import { apiFetch } from "@/utils/api";

export function getCategories(): Promise<CategoriesResponse> {
    return apiFetch<CategoriesResponse>('/categories');
}