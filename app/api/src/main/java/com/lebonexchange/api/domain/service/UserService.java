package com.lebonexchange.api.domain.service;

import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.exception.NotFoundException;
import com.lebonexchange.api.mapper.UserEntityBoMapper;
import com.lebonexchange.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserEntityBoMapper userEntityBoMapper;

    public UserService(UserRepository userRepository, UserEntityBoMapper userEntityBoMapper) {
        this.userRepository = userRepository;
        this.userEntityBoMapper = userEntityBoMapper;
    }

    @Transactional(readOnly = true)
    public UserBo getById(UUID userId) {
        return userRepository.findById(userId)
                .map(userEntityBoMapper::toBo)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
