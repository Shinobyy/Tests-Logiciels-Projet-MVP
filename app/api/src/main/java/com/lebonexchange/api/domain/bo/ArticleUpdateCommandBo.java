package com.lebonexchange.api.domain.bo;

import java.util.List;
import java.util.UUID;

public record ArticleUpdateCommandBo(
        UUID articleId,
        UUID userId,
        String titre,
        String description,
        List<UUID> categories,
        String image
) {
}
