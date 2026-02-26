package com.lebonexchange.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record NegotiationCreateRequest(
        @NotNull UUID exchange_id,
        @NotEmpty List<UUID> proposed_articles,
        @NotEmpty List<UUID> requested_articles,
        @NotBlank String content
) {
}
