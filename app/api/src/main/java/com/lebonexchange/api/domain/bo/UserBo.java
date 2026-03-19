package com.lebonexchange.api.domain.bo;

import java.util.UUID;

public record UserBo(
        UUID id,
        String email,
        String pseudonym,
        String avatar,
        Double rating,
        String passwordHash
) {
}
