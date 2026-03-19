package com.lebonexchange.api.dto.response;

public record MessageCreatedResponse(
        String status,
        MessageCreatedItemResponse message
) {
    public static MessageCreatedResponse success(MessageCreatedItemResponse message) {
        return new MessageCreatedResponse("success", message);
    }
}
