package com.lebonexchange.api.mapper;

import com.lebonexchange.api.domain.bo.CategoryBo;
import com.lebonexchange.api.entity.CategoryEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CategoryEntityBoMapper {

    public CategoryBo toBo(CategoryEntity entity) {
        if (entity == null) {
            return null;
        }
        return new CategoryBo(entity.getId(), entity.getNom());
    }

    public CategoryEntity toEntity(CategoryBo bo) {
        if (bo == null) {
            return null;
        }
        return CategoryEntity.builder()
                .id(bo.id() == null ? UUID.randomUUID() : bo.id())
                .nom(bo.nom())
                .build();
    }
}
