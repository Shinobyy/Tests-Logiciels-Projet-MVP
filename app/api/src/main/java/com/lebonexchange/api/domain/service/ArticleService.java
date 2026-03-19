package com.lebonexchange.api.domain.service;

import com.lebonexchange.api.domain.bo.ArticleBo;
import com.lebonexchange.api.domain.bo.ArticleCreateCommandBo;
import com.lebonexchange.api.domain.bo.ArticleUpdateCommandBo;
import com.lebonexchange.api.entity.ArticleEntity;
import com.lebonexchange.api.entity.CategoryEntity;
import com.lebonexchange.api.entity.UserEntity;
import com.lebonexchange.api.exception.ConflictException;
import com.lebonexchange.api.exception.ForbiddenOperationException;
import com.lebonexchange.api.exception.NotFoundException;
import com.lebonexchange.api.mapper.ArticleEntityBoMapper;
import com.lebonexchange.api.repository.ArticleRepository;
import com.lebonexchange.api.repository.CategoryRepository;
import com.lebonexchange.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ArticleEntityBoMapper articleEntityBoMapper;
    private final Clock clock;

    public ArticleService(ArticleRepository articleRepository,
                          UserRepository userRepository,
                          CategoryRepository categoryRepository,
                          ArticleEntityBoMapper articleEntityBoMapper,
                          Clock clock) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.articleEntityBoMapper = articleEntityBoMapper;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Page<ArticleBo> listAvailable(UUID categoryId, Pageable pageable) {
        Page<ArticleEntity> page = categoryId == null
                ? articleRepository.findByExchangedFalse(pageable)
                : articleRepository.findAvailableByCategoryId(categoryId, pageable);
        return page.map(articleEntityBoMapper::toBo);
    }

    @Transactional(readOnly = true)
    public Page<ArticleBo> listByUser(UUID userId, Pageable pageable) {
        return articleRepository.findByUser_Id(userId, pageable).map(articleEntityBoMapper::toBo);
    }

    @Transactional(readOnly = true)
    public ArticleBo getById(UUID articleId) {
        return articleRepository.findById(articleId)
                .map(articleEntityBoMapper::toBo)
                .orElseThrow(() -> new NotFoundException("Article not found"));
    }

    @Transactional
    public UUID create(ArticleCreateCommandBo command) {
        UserEntity user = userRepository.findById(command.userId())
                .orElseThrow(() -> new NotFoundException("User not found"));
        Set<CategoryEntity> categories = resolveCategories(command.categories());

        ArticleEntity entity = ArticleEntity.builder()
                .id(UUID.randomUUID())
                .titre(command.titre().trim())
                .description(command.description().trim())
                .publishedAt(Instant.now(clock))
                .user(user)
                .image(command.image())
                .exchanged(false)
                .exchangedAt(null)
                .categories(categories)
                .build();

        return articleRepository.save(entity).getId();
    }

    @Transactional
    public void update(ArticleUpdateCommandBo command) {
        ArticleEntity entity = articleRepository.findById(command.articleId())
                .orElseThrow(() -> new NotFoundException("Article not found"));

        ensureOwner(entity, command.userId());
        ensureNotExchangedForMutation(entity);

        if (command.titre() != null) {
            entity.setTitre(command.titre().trim());
        }
        if (command.description() != null) {
            entity.setDescription(command.description().trim());
        }
        if (command.image() != null) {
            entity.setImage(command.image());
        }
        if (command.categories() != null) {
            entity.setCategories(resolveCategories(command.categories()));
        }

        articleRepository.save(entity);
    }

    @Transactional
    public void delete(UUID articleId, UUID userId) {
        ArticleEntity entity = articleRepository.findById(articleId)
                .orElseThrow(() -> new NotFoundException("Article not found"));

        ensureOwner(entity, userId);
        if (entity.isExchanged()) {
            throw new ConflictException("Exchanged article cannot be deleted");
        }

        articleRepository.delete(entity);
    }

    @Transactional(readOnly = true)
    public List<ArticleBo> getByIds(List<UUID> articleIds) {
        return articleRepository.findByIdIn(articleIds).stream()
                .map(articleEntityBoMapper::toBo)
                .toList();
    }

    private void ensureOwner(ArticleEntity entity, UUID userId) {
        if (!entity.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("You do not own this article");
        }
    }

    private void ensureNotExchangedForMutation(ArticleEntity entity) {
        if (entity.isExchanged()) {
            throw new ConflictException("Exchanged article cannot be modified");
        }
    }

    private Set<CategoryEntity> resolveCategories(List<UUID> categoryIds) {
        if (categoryIds == null) {
            return null;
        }
        if (categoryIds.isEmpty()) {
            return Set.of();
        }

        List<UUID> distinctIds = categoryIds.stream().distinct().toList();
        List<CategoryEntity> categories = categoryRepository.findAllById(distinctIds);
        if (categories.size() != distinctIds.size()) {
            throw new NotFoundException("One or more categories not found");
        }
        return new LinkedHashSet<>(categories);
    }
}
