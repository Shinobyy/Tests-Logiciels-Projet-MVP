package com.lebonexchange.api.dto.request;

import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record ArticleUpdateRequest(
        @Size(max = 255) String titre,
        @Size(max = 5000) String description,
        List<UUID> categories,
        @Size(max = 500) String image
) {
}
