package com.lebonexchange.api.entity;

import com.lebonexchange.api.domain.bo.ExchangeStatus;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "exchanges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "proposer_id", nullable = false)
    private UUID proposerId;

    @Column(name = "accepter_id", nullable = false)
    private UUID accepterId;

    @ElementCollection
    @CollectionTable(name = "exchange_proposer_articles", joinColumns = @JoinColumn(name = "exchange_id"))
    @Column(name = "article_id", nullable = false)
    @Builder.Default
    private List<UUID> proposerArticles = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "exchange_accepter_articles", joinColumns = @JoinColumn(name = "exchange_id"))
    @Column(name = "article_id", nullable = false)
    @Builder.Default
    private List<UUID> accepterArticles = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExchangeStatus status;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
