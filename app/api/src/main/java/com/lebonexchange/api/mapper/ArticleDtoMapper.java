package com.lebonexchange.api.mapper;

import com.lebonexchange.api.domain.bo.ArticleBo;
import com.lebonexchange.api.domain.bo.ArticleCreateCommandBo;
import com.lebonexchange.api.domain.bo.ArticleUpdateCommandBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.dto.request.ArticleCreateRequest;
import com.lebonexchange.api.dto.request.ArticleUpdateRequest;
import com.lebonexchange.api.dto.response.ArticleDetailItemResponse;
import com.lebonexchange.api.dto.response.ArticleDetailResponse;
import com.lebonexchange.api.dto.response.ArticleListItemResponse;
import com.lebonexchange.api.dto.response.ArticlesResponse;
import com.lebonexchange.api.dto.response.UserArticleListItemResponse;
import com.lebonexchange.api.dto.response.UserSummaryResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class ArticleDtoMapper {

    public ArticleCreateCommandBo toCreateBo(UUID userId, ArticleCreateRequest request) {
        return new ArticleCreateCommandBo(
                userId,
                request.titre(),
                request.description(),
                request.categories(),
                request.image()
        );
    }

    public ArticleUpdateCommandBo toUpdateBo(UUID articleId, UUID userId, ArticleUpdateRequest request) {
        return new ArticleUpdateCommandBo(
                articleId,
                userId,
                request.titre(),
                request.description(),
                request.categories(),
                request.image()
        );
    }

    public ArticlesResponse toPublicArticlesResponse(List<ArticleBo> articles, List<UserBo> owners) {
        List<ArticleListItemResponse> items = articles.stream()
                .map(article -> toPublicListItem(article, findOwner(article.userId(), owners)))
                .toList();
        return new ArticlesResponse(items);
    }

    public ArticlesResponse toUserArticlesResponse(List<ArticleBo> articles) {
        List<UserArticleListItemResponse> items = articles.stream()
                .map(this::toUserListItem)
                .toList();
        return new ArticlesResponse(items);
    }

    public ArticleDetailResponse toDetailResponse(ArticleBo article, UserBo owner) {
        return new ArticleDetailResponse(new ArticleDetailItemResponse(
                article.id(),
                article.titre(),
                article.description(),
                article.publishedAt(),
                categoryNames(article),
                article.image(),
                article.exchanged(),
                article.exchangedAt(),
                toUserSummary(owner)
        ));
    }

    private ArticleListItemResponse toPublicListItem(ArticleBo article, UserBo owner) {
        return new ArticleListItemResponse(
                article.id(),
                article.titre(),
                article.description(),
                article.publishedAt(),
                categoryNames(article),
                article.image(),
                toUserSummary(owner)
        );
    }

    private UserArticleListItemResponse toUserListItem(ArticleBo article) {
        return new UserArticleListItemResponse(
                article.id(),
                article.titre(),
                article.description(),
                article.publishedAt(),
                categoryNames(article),
                article.image()
        );
    }

    private UserSummaryResponse toUserSummary(UserBo user) {
        return new UserSummaryResponse(user.id(), user.pseudonym(), user.avatar());
    }

    private List<String> categoryNames(ArticleBo article) {
        return article.categories().stream().map(c -> c.nom()).toList();
    }

    private UserBo findOwner(UUID userId, List<UserBo> owners) {
        return owners.stream()
                .filter(owner -> owner.id().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Owner not found for article " + userId));
    }
}
