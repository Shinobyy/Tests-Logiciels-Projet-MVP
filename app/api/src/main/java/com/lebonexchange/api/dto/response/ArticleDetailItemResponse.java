package com.lebonexchange.api.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ArticleDetailItemResponse(
        UUID id,
        String titre,
        String description,
        Instant published_at,
        List<String> categories,
        String image,
        boolean exchanged,
        Instant exchanged_at,
        UserSummaryResponse user
) {
}
