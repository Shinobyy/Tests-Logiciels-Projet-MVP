package com.lebonexchange.api.domain.service;

import com.lebonexchange.api.domain.bo.CategoryBo;
import com.lebonexchange.api.mapper.CategoryEntityBoMapper;
import com.lebonexchange.api.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryEntityBoMapper categoryEntityBoMapper;

    public CategoryService(CategoryRepository categoryRepository, CategoryEntityBoMapper categoryEntityBoMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryEntityBoMapper = categoryEntityBoMapper;
    }

    @Transactional(readOnly = true)
    public List<CategoryBo> findAll() {
        return categoryRepository.findAll().stream()
                .map(categoryEntityBoMapper::toBo)
                .toList();
    }
}
