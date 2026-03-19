package com.lebonexchange.api.dto.response;

import java.util.List;

public record ExchangesResponse(
        List<ExchangeItemResponse> exchanges
) {
}
