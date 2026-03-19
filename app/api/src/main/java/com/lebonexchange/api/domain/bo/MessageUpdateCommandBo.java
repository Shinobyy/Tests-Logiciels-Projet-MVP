package com.lebonexchange.api.domain.bo;

import java.util.UUID;

public record MessageUpdateCommandBo(
        UUID messageId,
        UUID userId,
        boolean isRead
) {
}
