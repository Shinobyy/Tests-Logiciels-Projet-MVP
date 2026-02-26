package com.lebonexchange.api.dto.response;

import java.util.List;

public record CategoriesResponse(
        List<CategoryItemResponse> categories
) {
}
