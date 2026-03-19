package com.lebonexchange.api.controller;

import com.lebonexchange.api.domain.bo.ArticleBo;
import com.lebonexchange.api.domain.service.ArticleService;
import com.lebonexchange.api.dto.response.ArticlesResponse;
import com.lebonexchange.api.mapper.ArticleDtoMapper;
import com.lebonexchange.api.security.UserPrincipal;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final ArticleService articleService;
    private final ArticleDtoMapper articleDtoMapper;

    public UserController(ArticleService articleService, ArticleDtoMapper articleDtoMapper) {
        this.articleService = articleService;
        this.articleDtoMapper = articleDtoMapper;
    }

    @GetMapping("/{id}/articles")
    public ResponseEntity<ArticlesResponse> getUserArticles(@PathVariable UUID id,
                                                            @PageableDefault(size = 20) Pageable pageable) {
        List<ArticleBo> articles = articleService.listByUser(id, pageable).getContent();
        return ResponseEntity.ok(articleDtoMapper.toUserArticlesResponse(articles));
    }

    @GetMapping("/me/articles")
    public ResponseEntity<ArticlesResponse> getMyArticles(@AuthenticationPrincipal UserPrincipal principal,
                                                          @PageableDefault(size = 20) Pageable pageable) {
        List<ArticleBo> articles = articleService.listByUser(principal.getId(), pageable).getContent();
        return ResponseEntity.ok(articleDtoMapper.toUserArticlesResponse(articles));
    }
}
