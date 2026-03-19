package com.lebonexchange.api.dto.response;

public record LoginResponse(
        String status,
        String token,
        AuthUserResponse user
) {
    public static LoginResponse success(String token, AuthUserResponse user) {
        return new LoginResponse("success", token, user);
    }
}
