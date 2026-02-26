package com.lebonexchange.api.dto.response;

import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String email,
        String pseudonym,
        String avatar
) {
}
