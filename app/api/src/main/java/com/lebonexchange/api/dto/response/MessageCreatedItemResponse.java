package com.lebonexchange.api.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MessageCreatedItemResponse(
        UUID id,
        UUID exchange_id,
        UUID user_id,
        String type,
        String content,
        List<UUID> proposed_articles,
        List<UUID> requested_articles,
        boolean is_read,
        Instant created_at
) {
}
