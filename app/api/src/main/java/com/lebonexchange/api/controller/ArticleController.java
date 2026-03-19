package com.lebonexchange.api.controller;

import com.lebonexchange.api.domain.bo.ArticleBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.domain.service.ArticleService;
import com.lebonexchange.api.domain.service.UserService;
import com.lebonexchange.api.dto.request.ArticleCreateRequest;
import com.lebonexchange.api.dto.request.ArticleUpdateRequest;
import com.lebonexchange.api.dto.response.ArticleDetailResponse;
import com.lebonexchange.api.dto.response.ArticlesResponse;
import com.lebonexchange.api.dto.response.CreateArticleResponse;
import com.lebonexchange.api.dto.response.StatusResponse;
import com.lebonexchange.api.mapper.ArticleDtoMapper;
import com.lebonexchange.api.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;
    private final UserService userService;
    private final ArticleDtoMapper articleDtoMapper;

    public ArticleController(ArticleService articleService, UserService userService, ArticleDtoMapper articleDtoMapper) {
        this.articleService = articleService;
        this.userService = userService;
        this.articleDtoMapper = articleDtoMapper;
    }

    @GetMapping
    public ResponseEntity<ArticlesResponse> listArticles(@RequestParam(required = false) UUID category,
                                                         @PageableDefault(size = 20) Pageable pageable) {
        List<ArticleBo> articles = articleService.listAvailable(category, pageable).getContent();
        List<UserBo> owners = articles.stream()
                .map(ArticleBo::userId)
                .distinct()
                .map(userService::getById)
                .toList();
        return ResponseEntity.ok(articleDtoMapper.toPublicArticlesResponse(articles, owners));
    }

    @PostMapping
    public ResponseEntity<CreateArticleResponse> createArticle(@AuthenticationPrincipal UserPrincipal principal,
                                                               @Valid @RequestBody ArticleCreateRequest request) {
        UUID articleId = articleService.create(articleDtoMapper.toCreateBo(principal.getId(), request));
        return ResponseEntity.ok(CreateArticleResponse.success(articleId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleDetailResponse> getArticle(@PathVariable UUID id) {
        ArticleBo article = articleService.getById(id);
        UserBo owner = userService.getById(article.userId());
        return ResponseEntity.ok(articleDtoMapper.toDetailResponse(article, owner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatusResponse> updateArticle(@PathVariable UUID id,
                                                        @AuthenticationPrincipal UserPrincipal principal,
                                                        @Valid @RequestBody ArticleUpdateRequest request) {
        articleService.update(articleDtoMapper.toUpdateBo(id, principal.getId(), request));
        return ResponseEntity.ok(StatusResponse.success());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<StatusResponse> deleteArticle(@PathVariable UUID id,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        articleService.delete(id, principal.getId());
        return ResponseEntity.ok(StatusResponse.success());
    }
}
