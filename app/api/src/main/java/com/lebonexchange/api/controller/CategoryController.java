package com.lebonexchange.api.controller;

import com.lebonexchange.api.domain.service.CategoryService;
import com.lebonexchange.api.dto.response.CategoriesResponse;
import com.lebonexchange.api.mapper.CategoryDtoMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryDtoMapper categoryDtoMapper;

    public CategoryController(CategoryService categoryService, CategoryDtoMapper categoryDtoMapper) {
        this.categoryService = categoryService;
        this.categoryDtoMapper = categoryDtoMapper;
    }

    @GetMapping
    public ResponseEntity<CategoriesResponse> getCategories() {
        return ResponseEntity.ok(categoryDtoMapper.toResponse(categoryService.findAll()));
    }
}
