package com.lebonexchange.api.domain.bo;

public record LoginCommandBo(
        String email,
        String password
) {
}
