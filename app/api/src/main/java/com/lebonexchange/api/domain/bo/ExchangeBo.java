package com.lebonexchange.api.domain.bo;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ExchangeBo(
        UUID id,
        UUID proposerId,
        UUID accepterId,
        List<UUID> proposerArticles,
        List<UUID> accepterArticles,
        ExchangeStatus status,
        Instant updatedAt
) {
}
