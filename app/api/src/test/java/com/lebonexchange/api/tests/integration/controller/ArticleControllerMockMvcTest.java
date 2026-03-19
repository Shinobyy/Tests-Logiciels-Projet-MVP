package com.lebonexchange.api.tests.integration.controller;

import com.lebonexchange.api.controller.ArticleController;
import com.lebonexchange.api.domain.bo.ArticleBo;
import com.lebonexchange.api.domain.bo.CategoryBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.domain.service.ArticleService;
import com.lebonexchange.api.domain.service.UserService;
import com.lebonexchange.api.dto.response.ArticleDetailItemResponse;
import com.lebonexchange.api.dto.response.ArticleDetailResponse;
import com.lebonexchange.api.dto.response.UserSummaryResponse;
import com.lebonexchange.api.mapper.ArticleDtoMapper;
import com.lebonexchange.api.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ArticleController.class)
@AutoConfigureMockMvc(addFilters = false)
class ArticleControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ArticleService articleService;

    @MockBean
    private UserService userService;

    @MockBean
    private ArticleDtoMapper articleDtoMapper;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getArticle_shouldReturnArticleDetails() throws Exception {
        // GIVEN
        UUID articleId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        ArticleBo articleBo = new ArticleBo(
                articleId,
                "Dune",
                "Roman SF",
                Instant.parse("2026-02-26T10:00:00Z"),
                userId,
                "https://img",
                false,
                null,
                List.of(new CategoryBo(UUID.randomUUID(), "Science-fiction"))
        );
        UserBo userBo = new UserBo(userId, "reader@example.com", "Reader", "https://avatar", 4.0d, "hash");
        ArticleDetailResponse response = new ArticleDetailResponse(new ArticleDetailItemResponse(
                articleId,
                "Dune",
                "Roman SF",
                Instant.parse("2026-02-26T10:00:00Z"),
                List.of("Science-fiction"),
                "https://img",
                false,
                null,
                new UserSummaryResponse(userId, "Reader", "https://avatar")
        ));

        when(articleService.getById(articleId)).thenReturn(articleBo);
        when(userService.getById(userId)).thenReturn(userBo);
        when(articleDtoMapper.toDetailResponse(articleBo, userBo)).thenReturn(response);

        // WHEN / THEN
        mockMvc.perform(get("/api/articles/{id}", articleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.article.id").value(articleId.toString()))
                .andExpect(jsonPath("$.article.titre").value("Dune"))
                .andExpect(jsonPath("$.article.user.pseudonym").value("Reader"));
    }
}
