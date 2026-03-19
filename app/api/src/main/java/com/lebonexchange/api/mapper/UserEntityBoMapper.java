package com.lebonexchange.api.mapper;

import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.entity.UserEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UserEntityBoMapper {

    public UserBo toBo(UserEntity entity) {
        if (entity == null) {
            return null;
        }
        return new UserBo(
                entity.getId(),
                entity.getEmail(),
                entity.getPseudonym(),
                entity.getAvatar(),
                entity.getRating(),
                entity.getPasswordHash()
        );
    }

    public UserEntity toEntity(UserBo bo) {
        if (bo == null) {
            return null;
        }
        return UserEntity.builder()
                .id(bo.id() == null ? UUID.randomUUID() : bo.id())
                .email(bo.email())
                .pseudonym(bo.pseudonym())
                .avatar(bo.avatar())
                .rating(bo.rating())
                .passwordHash(bo.passwordHash())
                .build();
    }
}
