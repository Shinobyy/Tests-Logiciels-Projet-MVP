package com.lebonexchange.api.domain.bo;

public record LoginResultBo(
        String token,
        UserBo user
) {
}
