package com.lebonexchange.api.dto.response;

import java.util.UUID;

public record UserSummaryResponse(
        UUID id,
        String pseudonym,
        String avatar
) {
}
