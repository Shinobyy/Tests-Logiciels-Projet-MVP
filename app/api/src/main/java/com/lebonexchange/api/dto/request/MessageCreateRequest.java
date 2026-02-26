package com.lebonexchange.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record MessageCreateRequest(
        @NotNull UUID exchange_id,
        @NotBlank String type,
        @NotBlank String content,
        List<UUID> proposed_articles,
        List<UUID> requested_articles
) {
}
