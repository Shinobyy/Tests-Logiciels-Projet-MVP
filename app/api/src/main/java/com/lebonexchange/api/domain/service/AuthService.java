package com.lebonexchange.api.domain.service;

import com.lebonexchange.api.domain.bo.LoginCommandBo;
import com.lebonexchange.api.domain.bo.LoginResultBo;
import com.lebonexchange.api.domain.bo.RegisterCommandBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.entity.UserEntity;
import com.lebonexchange.api.exception.ConflictException;
import com.lebonexchange.api.exception.UnauthorizedException;
import com.lebonexchange.api.mapper.UserEntityBoMapper;
import com.lebonexchange.api.repository.UserRepository;
import com.lebonexchange.api.security.JwtService;
import com.lebonexchange.api.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserEntityBoMapper userEntityBoMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       UserEntityBoMapper userEntityBoMapper,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.userEntityBoMapper = userEntityBoMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public void register(RegisterCommandBo command) {
        String normalizedEmail = command.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email already registered");
        }

        UserEntity user = UserEntity.builder()
                .id(UUID.randomUUID())
                .email(normalizedEmail)
                .pseudonym(command.pseudonym().trim())
                .avatar(defaultAvatar(command.pseudonym()))
                .rating(4.0d)
                .passwordHash(passwordEncoder.encode(command.password()))
                .build();

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public LoginResultBo login(LoginCommandBo command) {
        String normalizedEmail = command.email().trim().toLowerCase();

        UserEntity user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(command.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        UserPrincipal principal = new UserPrincipal(user.getId(), user.getEmail(), user.getPseudonym(), user.getPasswordHash());
        String token = jwtService.generateToken(principal);
        UserBo userBo = userEntityBoMapper.toBo(user);

        return new LoginResultBo(token, userBo);
    }

    private String defaultAvatar(String pseudonym) {
        String seed = pseudonym == null ? "user" : pseudonym.trim().replace(" ", "-");
        return "https://api.dicebear.com/7.x/initials/svg?seed=" + seed;
    }
}
