package com.lebonexchange.api.domain.bo;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MessageBo(
        UUID id,
        UUID exchangeId,
        UUID userId,
        MessageType type,
        String content,
        List<UUID> proposedArticles,
        List<UUID> requestedArticles,
        boolean isRead,
        Instant createdAt
) {
}
