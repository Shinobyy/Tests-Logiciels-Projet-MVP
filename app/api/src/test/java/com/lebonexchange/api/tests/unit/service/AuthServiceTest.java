package com.lebonexchange.api.tests.unit.service;

import com.lebonexchange.api.domain.bo.LoginCommandBo;
import com.lebonexchange.api.domain.bo.LoginResultBo;
import com.lebonexchange.api.domain.bo.RegisterCommandBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.domain.service.AuthService;
import com.lebonexchange.api.entity.UserEntity;
import com.lebonexchange.api.exception.UnauthorizedException;
import com.lebonexchange.api.mapper.UserEntityBoMapper;
import com.lebonexchange.api.repository.UserRepository;
import com.lebonexchange.api.security.JwtService;
import com.lebonexchange.api.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserEntityBoMapper userEntityBoMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, userEntityBoMapper, passwordEncoder, jwtService);
    }

    @Test
    void register_shouldCreateUser() {
        // GIVEN
        RegisterCommandBo command = new RegisterCommandBo("Alice@Example.com", "Alice", "secret123");
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("HASHED");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        authService.register(command);

        // THEN
        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());
        UserEntity saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("alice@example.com");
        assertThat(saved.getPseudonym()).isEqualTo("Alice");
        assertThat(saved.getPasswordHash()).isEqualTo("HASHED");
        assertThat(saved.getRating()).isEqualTo(4.0d);
    }

    @Test
    void login_shouldReturnToken_whenCredentialsValid() {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UserEntity entity = UserEntity.builder()
                .id(userId)
                .email("alice@example.com")
                .pseudonym("Alice")
                .avatar("https://avatar")
                .rating(4.0d)
                .passwordHash("HASHED")
                .build();
        UserBo userBo = new UserBo(userId, entity.getEmail(), entity.getPseudonym(), entity.getAvatar(), entity.getRating(), entity.getPasswordHash());

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(entity));
        when(passwordEncoder.matches("secret123", "HASHED")).thenReturn(true);
        when(jwtService.generateToken(any(UserPrincipal.class))).thenReturn("jwt-token");
        when(userEntityBoMapper.toBo(entity)).thenReturn(userBo);

        // WHEN
        LoginResultBo result = authService.login(new LoginCommandBo("alice@example.com", "secret123"));

        // THEN
        assertThat(result.token()).isEqualTo("jwt-token");
        assertThat(result.user().id()).isEqualTo(userId);
    }

    @Test
    void login_shouldFail_whenPasswordInvalid() {
        // GIVEN
        UserEntity entity = UserEntity.builder()
                .id(UUID.randomUUID())
                .email("alice@example.com")
                .pseudonym("Alice")
                .avatar("https://avatar")
                .rating(4.0d)
                .passwordHash("HASHED")
                .build();
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(entity));
        when(passwordEncoder.matches("wrong", "HASHED")).thenReturn(false);

        // WHEN / THEN
        assertThatThrownBy(() -> authService.login(new LoginCommandBo("alice@example.com", "wrong")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid credentials");
    }
}
