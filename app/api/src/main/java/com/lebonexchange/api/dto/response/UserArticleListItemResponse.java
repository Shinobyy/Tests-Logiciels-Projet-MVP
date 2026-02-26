package com.lebonexchange.api.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserArticleListItemResponse(
        UUID id,
        String titre,
        String description,
        Instant published_at,
        List<String> categories,
        String image
) {
}
