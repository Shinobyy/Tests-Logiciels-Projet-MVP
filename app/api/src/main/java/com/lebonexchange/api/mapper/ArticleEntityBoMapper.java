package com.lebonexchange.api.mapper;

import com.lebonexchange.api.domain.bo.ArticleBo;
import com.lebonexchange.api.domain.bo.CategoryBo;
import com.lebonexchange.api.entity.ArticleEntity;
import com.lebonexchange.api.entity.CategoryEntity;
import com.lebonexchange.api.entity.UserEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class ArticleEntityBoMapper {

    private final CategoryEntityBoMapper categoryMapper;

    public ArticleEntityBoMapper(CategoryEntityBoMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public ArticleBo toBo(ArticleEntity entity) {
        if (entity == null) {
            return null;
        }
        List<CategoryBo> categories = entity.getCategories() == null
                ? List.of()
                : entity.getCategories().stream().map(categoryMapper::toBo).toList();

        return new ArticleBo(
                entity.getId(),
                entity.getTitre(),
                entity.getDescription(),
                entity.getPublishedAt(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getImage(),
                entity.isExchanged(),
                entity.getExchangedAt(),
                categories
        );
    }

    public ArticleEntity toEntity(ArticleBo bo, UserEntity user, Set<CategoryEntity> categories) {
        if (bo == null) {
            return null;
        }
        return ArticleEntity.builder()
                .id(bo.id() == null ? UUID.randomUUID() : bo.id())
                .titre(bo.titre())
                .description(bo.description())
                .publishedAt(bo.publishedAt())
                .user(user)
                .image(bo.image())
                .exchanged(bo.exchanged())
                .exchangedAt(bo.exchangedAt())
                .categories(categories == null ? Set.of() : categories)
                .build();
    }

    public void updateEntityFromBo(ArticleBo bo, ArticleEntity entity, Set<CategoryEntity> categories) {
        entity.setTitre(bo.titre());
        entity.setDescription(bo.description());
        entity.setImage(bo.image());
        entity.setExchanged(bo.exchanged());
        entity.setExchangedAt(bo.exchangedAt());
        if (categories != null) {
            entity.setCategories(categories.stream().collect(Collectors.toSet()));
        }
    }
}
