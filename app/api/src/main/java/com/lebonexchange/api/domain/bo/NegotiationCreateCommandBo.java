package com.lebonexchange.api.domain.bo;

import java.util.List;
import java.util.UUID;

public record NegotiationCreateCommandBo(
        UUID userId,
        UUID exchangeId,
        List<UUID> proposedArticles,
        List<UUID> requestedArticles,
        String content
) {
}
