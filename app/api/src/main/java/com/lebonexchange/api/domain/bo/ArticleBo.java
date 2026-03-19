package com.lebonexchange.api.domain.bo;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ArticleBo(
        UUID id,
        String titre,
        String description,
        Instant publishedAt,
        UUID userId,
        String image,
        boolean exchanged,
        Instant exchangedAt,
        List<CategoryBo> categories
) {
}
