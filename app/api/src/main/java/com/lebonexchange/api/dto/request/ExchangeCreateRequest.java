package com.lebonexchange.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ExchangeCreateRequest(
        @NotNull UUID accepter_id,
        @NotEmpty List<UUID> proposer_articles,
        @NotEmpty List<UUID> accepter_articles,
        @NotBlank String message
) {
}
