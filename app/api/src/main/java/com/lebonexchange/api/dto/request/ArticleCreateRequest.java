package com.lebonexchange.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record ArticleCreateRequest(
        @NotBlank @Size(max = 255) String titre,
        @NotBlank @Size(max = 5000) String description,
        @NotEmpty List<UUID> categories,
        @NotBlank @Size(max = 500) String image
) {
}
