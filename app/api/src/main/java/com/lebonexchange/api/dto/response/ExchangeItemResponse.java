package com.lebonexchange.api.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ExchangeItemResponse(
        UUID id,
        UserSummaryResponse proposer,
        UserSummaryResponse accepter,
        List<UUID> proposer_articles,
        List<UUID> accepter_articles,
        String status,
        Instant updated_at
) {
}
