package com.lebonexchange.api.tests.integration.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lebonexchange.api.controller.AuthController;
import com.lebonexchange.api.domain.bo.LoginCommandBo;
import com.lebonexchange.api.domain.bo.LoginResultBo;
import com.lebonexchange.api.domain.bo.RegisterCommandBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.domain.service.AuthService;
import com.lebonexchange.api.dto.request.LoginRequest;
import com.lebonexchange.api.dto.request.RegisterRequest;
import com.lebonexchange.api.dto.response.AuthUserResponse;
import com.lebonexchange.api.dto.response.LoginResponse;
import com.lebonexchange.api.mapper.AuthDtoMapper;
import com.lebonexchange.api.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private AuthDtoMapper authDtoMapper;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void register_shouldReturnSuccess() throws Exception {
        // GIVEN
        when(authDtoMapper.toBo(any(RegisterRequest.class))).thenReturn(new RegisterCommandBo("reader@example.com", "Reader", "secret123"));
        doNothing().when(authService).register(any(RegisterCommandBo.class));

        // WHEN / THEN
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterPayload("reader@example.com", "Reader", "secret123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));
    }

    @Test
    void login_shouldReturnTokenAndUser() throws Exception {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UserBo userBo = new UserBo(userId, "reader@example.com", "Reader", "https://avatar", 4.0d, "hash");
        LoginResultBo loginResultBo = new LoginResultBo("jwt-token", userBo);
        LoginResponse loginResponse = LoginResponse.success(
                "jwt-token",
                new AuthUserResponse(userId, "reader@example.com", "Reader", "https://avatar")
        );

        when(authDtoMapper.toBo(any(LoginRequest.class))).thenReturn(new LoginCommandBo("reader@example.com", "secret123"));
        when(authService.login(any(LoginCommandBo.class))).thenReturn(loginResultBo);
        when(authDtoMapper.toResponse(loginResultBo)).thenReturn(loginResponse);

        // WHEN / THEN
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginPayload("reader@example.com", "secret123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.user.email").value("reader@example.com"));
    }

    private record RegisterPayload(String email, String pseudonym, String password) {}

    private record LoginPayload(String email, String password) {}
}
