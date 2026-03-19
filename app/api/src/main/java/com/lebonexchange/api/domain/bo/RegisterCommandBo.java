package com.lebonexchange.api.domain.bo;

public record RegisterCommandBo(
        String email,
        String pseudonym,
        String password
) {
}
