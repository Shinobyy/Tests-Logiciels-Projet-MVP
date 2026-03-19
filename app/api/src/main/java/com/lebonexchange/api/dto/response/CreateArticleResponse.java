package com.lebonexchange.api.dto.response;

import java.util.UUID;

public record CreateArticleResponse(
        String status,
        UUID article_id
) {
    public static CreateArticleResponse success(UUID articleId) {
        return new CreateArticleResponse("success", articleId);
    }
}
