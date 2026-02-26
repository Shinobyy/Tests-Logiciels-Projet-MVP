package com.lebonexchange.api.repository;

import com.lebonexchange.api.entity.ArticleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ArticleRepository extends JpaRepository<ArticleEntity, UUID> {

    @EntityGraph(attributePaths = {"categories", "user"})
    Page<ArticleEntity> findByExchangedFalse(Pageable pageable);

    @Query("""
            select distinct a from ArticleEntity a
            join a.categories c
            where a.exchanged = false and c.id = :categoryId
            """)
    @EntityGraph(attributePaths = {"categories", "user"})
    Page<ArticleEntity> findAvailableByCategoryId(UUID categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"categories", "user"})
    Page<ArticleEntity> findByUser_Id(UUID userId, Pageable pageable);

    Optional<ArticleEntity> findByIdAndUser_Id(UUID articleId, UUID userId);

    @EntityGraph(attributePaths = {"categories", "user"})
    Optional<ArticleEntity> findById(UUID id);

    @EntityGraph(attributePaths = {"categories", "user"})
    List<ArticleEntity> findByIdIn(List<UUID> ids);

    boolean existsByIdAndExchangedTrue(UUID id);
}
