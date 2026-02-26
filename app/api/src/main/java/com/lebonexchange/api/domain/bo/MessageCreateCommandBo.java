package com.lebonexchange.api.domain.bo;

import java.util.List;
import java.util.UUID;

public record MessageCreateCommandBo(
        UUID userId,
        UUID exchangeId,
        MessageType type,
        String content,
        List<UUID> proposedArticles,
        List<UUID> requestedArticles
) {
}
