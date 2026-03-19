package com.lebonexchange.api.repository;

import com.lebonexchange.api.entity.MessageEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<MessageEntity, UUID> {

    Page<MessageEntity> findByExchange_IdOrderByCreatedAtAsc(UUID exchangeId, Pageable pageable);

    Optional<MessageEntity> findByIdAndExchange_Id(UUID messageId, UUID exchangeId);
}
