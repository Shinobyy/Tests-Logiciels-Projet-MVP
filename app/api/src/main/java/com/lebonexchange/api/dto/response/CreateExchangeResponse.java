package com.lebonexchange.api.dto.response;

import java.util.UUID;

public record CreateExchangeResponse(
        String status,
        UUID exchange_id
) {
    public static CreateExchangeResponse success(UUID exchangeId) {
        return new CreateExchangeResponse("success", exchangeId);
    }
}
