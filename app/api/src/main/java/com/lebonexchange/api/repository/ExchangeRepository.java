package com.lebonexchange.api.repository;

import com.lebonexchange.api.entity.ExchangeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ExchangeRepository extends JpaRepository<ExchangeEntity, UUID> {

    @Query("""
            select e from ExchangeEntity e
            where e.proposerId = :userId or e.accepterId = :userId
            """)
    Page<ExchangeEntity> findVisibleForUser(UUID userId, Pageable pageable);

    @Query("""
            select e from ExchangeEntity e
            where e.id = :exchangeId and (e.proposerId = :userId or e.accepterId = :userId)
            """)
    Optional<ExchangeEntity> findVisibleById(UUID exchangeId, UUID userId);
}
