package com.lebonexchange.api.dto.response;

import java.util.List;

public record MessagesResponse(
        List<MessageListItemResponse> messages
) {
}
