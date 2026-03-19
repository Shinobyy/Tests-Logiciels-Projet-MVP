package com.lebonexchange.api.dto.response;

public record StatusResponse(String status) {

    public static StatusResponse success() {
        return new StatusResponse("success");
    }
}
