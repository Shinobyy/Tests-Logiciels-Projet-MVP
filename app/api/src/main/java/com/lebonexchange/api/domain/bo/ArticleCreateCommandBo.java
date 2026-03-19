package com.lebonexchange.api.domain.bo;

import java.util.List;
import java.util.UUID;

public record ArticleCreateCommandBo(
        UUID userId,
        String titre,
        String description,
        List<UUID> categories,
        String image
) {
}
