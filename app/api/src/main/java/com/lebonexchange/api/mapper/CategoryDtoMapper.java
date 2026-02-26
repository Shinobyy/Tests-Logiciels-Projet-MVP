package com.lebonexchange.api.mapper;

import com.lebonexchange.api.domain.bo.CategoryBo;
import com.lebonexchange.api.dto.response.CategoriesResponse;
import com.lebonexchange.api.dto.response.CategoryItemResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategoryDtoMapper {

    public CategoriesResponse toResponse(List<CategoryBo> categories) {
        List<CategoryItemResponse> items = categories.stream()
                .map(category -> new CategoryItemResponse(category.id(), category.nom()))
                .toList();
        return new CategoriesResponse(items);
    }
}
