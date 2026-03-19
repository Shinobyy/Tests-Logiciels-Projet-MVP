package com.lebonexchange.api.domain.bo;

import java.util.List;
import java.util.UUID;

public record ExchangeCreateCommandBo(
        UUID proposerId,
        UUID accepterId,
        List<UUID> proposerArticles,
        List<UUID> accepterArticles,
        String message
) {
}
