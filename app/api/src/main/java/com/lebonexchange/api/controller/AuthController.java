package com.lebonexchange.api.controller;

import com.lebonexchange.api.domain.service.AuthService;
import com.lebonexchange.api.dto.request.LoginRequest;
import com.lebonexchange.api.dto.request.RegisterRequest;
import com.lebonexchange.api.dto.response.LoginResponse;
import com.lebonexchange.api.dto.response.StatusResponse;
import com.lebonexchange.api.mapper.AuthDtoMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthDtoMapper authDtoMapper;

    public AuthController(AuthService authService, AuthDtoMapper authDtoMapper) {
        this.authService = authService;
        this.authDtoMapper = authDtoMapper;
    }

    @PostMapping("/register")
    public ResponseEntity<StatusResponse> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(authDtoMapper.toBo(request));
        return ResponseEntity.ok(StatusResponse.success());
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authDtoMapper.toResponse(authService.login(authDtoMapper.toBo(request))));
    }
}
