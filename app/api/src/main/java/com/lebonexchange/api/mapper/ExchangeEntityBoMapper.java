package com.lebonexchange.api.mapper;

import com.lebonexchange.api.domain.bo.ExchangeBo;
import com.lebonexchange.api.entity.ExchangeEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.UUID;

@Component
public class ExchangeEntityBoMapper {

    public ExchangeBo toBo(ExchangeEntity entity) {
        if (entity == null) {
            return null;
        }
        return new ExchangeBo(
                entity.getId(),
                entity.getProposerId(),
                entity.getAccepterId(),
                entity.getProposerArticles() == null ? java.util.List.of() : java.util.List.copyOf(entity.getProposerArticles()),
                entity.getAccepterArticles() == null ? java.util.List.of() : java.util.List.copyOf(entity.getAccepterArticles()),
                entity.getStatus(),
                entity.getUpdatedAt()
        );
    }

    public ExchangeEntity toEntity(ExchangeBo bo) {
        if (bo == null) {
            return null;
        }
        return ExchangeEntity.builder()
                .id(bo.id() == null ? UUID.randomUUID() : bo.id())
                .proposerId(bo.proposerId())
                .accepterId(bo.accepterId())
                .proposerArticles(new ArrayList<>(bo.proposerArticles() == null ? java.util.List.of() : bo.proposerArticles()))
                .accepterArticles(new ArrayList<>(bo.accepterArticles() == null ? java.util.List.of() : bo.accepterArticles()))
                .status(bo.status())
                .updatedAt(bo.updatedAt())
                .build();
    }
}
