package com.lebonexchange.api.dto.response;

import java.util.UUID;

public record CategoryItemResponse(
        UUID id,
        String nom
) {
}
