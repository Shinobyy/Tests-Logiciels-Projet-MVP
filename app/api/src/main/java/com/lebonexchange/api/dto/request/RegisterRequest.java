package com.lebonexchange.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 2, max = 100) String pseudonym,
        @NotBlank @Size(min = 6, max = 120) String password
) {
}
