package com.lebonexchange.api.dto.request;

import jakarta.validation.constraints.NotNull;

public record MessageUpdateRequest(
        @NotNull Boolean is_read
) {
}
