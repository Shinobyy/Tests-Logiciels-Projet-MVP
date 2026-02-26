package com.lebonexchange.api.mapper;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.entity.ExchangeEntity;
import com.lebonexchange.api.entity.MessageEntity;
import com.lebonexchange.api.entity.UserEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.UUID;

@Component
public class MessageEntityBoMapper {

    public MessageBo toBo(MessageEntity entity) {
        if (entity == null) {
            return null;
        }
        return new MessageBo(
                entity.getId(),
                entity.getExchange().getId(),
                entity.getUser().getId(),
                entity.getType(),
                entity.getContent(),
                entity.getProposedArticles() == null ? java.util.List.of() : java.util.List.copyOf(entity.getProposedArticles()),
                entity.getRequestedArticles() == null ? java.util.List.of() : java.util.List.copyOf(entity.getRequestedArticles()),
                entity.isRead(),
                entity.getCreatedAt()
        );
    }

    public MessageEntity toEntity(MessageBo bo, ExchangeEntity exchange, UserEntity user) {
        if (bo == null) {
            return null;
        }
        return MessageEntity.builder()
                .id(bo.id() == null ? UUID.randomUUID() : bo.id())
                .exchange(exchange)
                .user(user)
                .type(bo.type())
                .content(bo.content())
                .proposedArticles(new ArrayList<>(bo.proposedArticles() == null ? java.util.List.of() : bo.proposedArticles()))
                .requestedArticles(new ArrayList<>(bo.requestedArticles() == null ? java.util.List.of() : bo.requestedArticles()))
                .isRead(bo.isRead())
                .createdAt(bo.createdAt())
                .build();
    }
}
