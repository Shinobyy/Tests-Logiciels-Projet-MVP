package com.lebonexchange.api.tests.unit.service;

import com.lebonexchange.api.domain.bo.ArticleCreateCommandBo;
import com.lebonexchange.api.domain.bo.ArticleUpdateCommandBo;
import com.lebonexchange.api.domain.service.ArticleService;
import com.lebonexchange.api.entity.ArticleEntity;
import com.lebonexchange.api.entity.CategoryEntity;
import com.lebonexchange.api.entity.UserEntity;
import com.lebonexchange.api.exception.ConflictException;
import com.lebonexchange.api.exception.ForbiddenOperationException;
import com.lebonexchange.api.mapper.ArticleEntityBoMapper;
import com.lebonexchange.api.repository.ArticleRepository;
import com.lebonexchange.api.repository.CategoryRepository;
import com.lebonexchange.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ArticleEntityBoMapper articleEntityBoMapper;

    private ArticleService articleService;
    private Clock fixedClock;

    @BeforeEach
    void setUp() {
        fixedClock = Clock.fixed(Instant.parse("2026-02-26T12:00:00Z"), ZoneOffset.UTC);
        articleService = new ArticleService(articleRepository, userRepository, categoryRepository, articleEntityBoMapper, fixedClock);
    }

    @Test
    void create_shouldCreateArticle() {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        UserEntity user = user(userId);
        CategoryEntity category = CategoryEntity.builder().id(categoryId).nom("Roman").build();
        ArticleCreateCommandBo command = new ArticleCreateCommandBo(userId, "Dune", "Roman SF", List.of(categoryId), "https://img");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(categoryRepository.findAllById(List.of(categoryId))).thenReturn(List.of(category));
        when(articleRepository.save(any(ArticleEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        UUID articleId = articleService.create(command);

        // THEN
        ArgumentCaptor<ArticleEntity> captor = ArgumentCaptor.forClass(ArticleEntity.class);
        verify(articleRepository).save(captor.capture());
        ArticleEntity saved = captor.getValue();
        assertThat(articleId).isEqualTo(saved.getId());
        assertThat(saved.getTitre()).isEqualTo("Dune");
        assertThat(saved.getPublishedAt()).isEqualTo(Instant.parse("2026-02-26T12:00:00Z"));
        assertThat(saved.isExchanged()).isFalse();
        assertThat(saved.getCategories()).extracting(CategoryEntity::getId).containsExactly(categoryId);
    }

    @Test
    void update_shouldModifyArticle_whenOwner() {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UUID articleId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        ArticleEntity existing = article(articleId, userId, false);
        CategoryEntity category = CategoryEntity.builder().id(categoryId).nom("Science-fiction").build();
        ArticleUpdateCommandBo command = new ArticleUpdateCommandBo(articleId, userId, "Dune Messiah", "Suite", List.of(categoryId), "https://new-img");

        when(articleRepository.findById(articleId)).thenReturn(Optional.of(existing));
        when(categoryRepository.findAllById(List.of(categoryId))).thenReturn(List.of(category));
        when(articleRepository.save(any(ArticleEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        articleService.update(command);

        // THEN
        assertThat(existing.getTitre()).isEqualTo("Dune Messiah");
        assertThat(existing.getDescription()).isEqualTo("Suite");
        assertThat(existing.getImage()).isEqualTo("https://new-img");
        assertThat(existing.getCategories()).extracting(CategoryEntity::getId).containsExactly(categoryId);
        verify(articleRepository).save(existing);
    }

    @Test
    void update_shouldFail_whenNotOwner() {
        // GIVEN
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID articleId = UUID.randomUUID();
        ArticleEntity existing = article(articleId, ownerId, false);
        ArticleUpdateCommandBo command = new ArticleUpdateCommandBo(articleId, otherUserId, "X", "Y", null, null);

        when(articleRepository.findById(articleId)).thenReturn(Optional.of(existing));

        // WHEN / THEN
        assertThatThrownBy(() -> articleService.update(command))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessageContaining("own");
    }

    @Test
    void update_shouldFail_whenArticleAlreadyExchanged() {
        // GIVEN
        UUID ownerId = UUID.randomUUID();
        UUID articleId = UUID.randomUUID();
        ArticleEntity existing = article(articleId, ownerId, true);
        ArticleUpdateCommandBo command = new ArticleUpdateCommandBo(articleId, ownerId, "X", "Y", null, null);

        when(articleRepository.findById(articleId)).thenReturn(Optional.of(existing));

        // WHEN / THEN
        assertThatThrownBy(() -> articleService.update(command))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Exchanged article cannot be modified");
    }

    private UserEntity user(UUID id) {
        return UserEntity.builder()
                .id(id)
                .email("user@example.com")
                .pseudonym("User")
                .avatar("https://avatar")
                .rating(4.0d)
                .passwordHash("hash")
                .build();
    }

    private ArticleEntity article(UUID articleId, UUID ownerId, boolean exchanged) {
        ArticleEntity article = ArticleEntity.builder()
                .id(articleId)
                .titre("Book")
                .description("Desc")
                .publishedAt(Instant.now())
                .user(user(ownerId))
                .image("https://img")
                .exchanged(exchanged)
                .categories(Set.of())
                .build();
        if (exchanged) {
            article.setExchangedAt(Instant.now());
        }
        return article;
    }
}
