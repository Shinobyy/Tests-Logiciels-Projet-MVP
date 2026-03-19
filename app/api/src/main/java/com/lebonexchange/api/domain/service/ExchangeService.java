package com.lebonexchange.api.domain.service;

import com.lebonexchange.api.domain.bo.ExchangeBo;
import com.lebonexchange.api.domain.bo.ExchangeCreateCommandBo;
import com.lebonexchange.api.domain.bo.ExchangeStatus;
import com.lebonexchange.api.domain.bo.MessageType;
import com.lebonexchange.api.entity.ArticleEntity;
import com.lebonexchange.api.entity.ExchangeEntity;
import com.lebonexchange.api.entity.MessageEntity;
import com.lebonexchange.api.entity.UserEntity;
import com.lebonexchange.api.exception.BadRequestException;
import com.lebonexchange.api.exception.ConflictException;
import com.lebonexchange.api.exception.ForbiddenOperationException;
import com.lebonexchange.api.exception.NotFoundException;
import com.lebonexchange.api.mapper.ExchangeEntityBoMapper;
import com.lebonexchange.api.repository.ArticleRepository;
import com.lebonexchange.api.repository.ExchangeRepository;
import com.lebonexchange.api.repository.MessageRepository;
import com.lebonexchange.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class ExchangeService {

    private final ExchangeRepository exchangeRepository;
    private final MessageRepository messageRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final ExchangeEntityBoMapper exchangeEntityBoMapper;
    private final Clock clock;

    public ExchangeService(ExchangeRepository exchangeRepository,
                           MessageRepository messageRepository,
                           ArticleRepository articleRepository,
                           UserRepository userRepository,
                           ExchangeEntityBoMapper exchangeEntityBoMapper,
                           Clock clock) {
        this.exchangeRepository = exchangeRepository;
        this.messageRepository = messageRepository;
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.exchangeEntityBoMapper = exchangeEntityBoMapper;
        this.clock = clock;
    }

    @Transactional
    public ExchangeBo create(ExchangeCreateCommandBo command) {
        validateCreateCommand(command);

        UserEntity proposer = userRepository.findById(command.proposerId())
                .orElseThrow(() -> new NotFoundException("Proposer not found"));
        UserEntity accepter = userRepository.findById(command.accepterId())
                .orElseThrow(() -> new NotFoundException("Accepter not found"));

        validateArticlesOwnershipAndAvailability(
                command.proposerId(),
                command.proposerArticles(),
                command.accepterId(),
                command.accepterArticles()
        );

        Instant now = Instant.now(clock);
        ExchangeEntity exchange = ExchangeEntity.builder()
                .id(UUID.randomUUID())
                .proposerId(proposer.getId())
                .accepterId(accepter.getId())
                .proposerArticles(new ArrayList<>(command.proposerArticles()))
                .accepterArticles(new ArrayList<>(command.accepterArticles()))
                .status(ExchangeStatus.PENDING)
                .updatedAt(now)
                .build();

        ExchangeEntity savedExchange = exchangeRepository.save(exchange);

        MessageEntity initialMessage = MessageEntity.builder()
                .id(UUID.randomUUID())
                .exchange(savedExchange)
                .user(proposer)
                .type(MessageType.MESSAGE)
                .content(command.message().trim())
                .proposedArticles(new ArrayList<>(command.proposerArticles()))
                .requestedArticles(new ArrayList<>(command.accepterArticles()))
                .isRead(false)
                .createdAt(now)
                .build();
        messageRepository.save(initialMessage);

        return exchangeEntityBoMapper.toBo(savedExchange);
    }

    @Transactional(readOnly = true)
    public Page<ExchangeBo> listVisible(UUID userId, Pageable pageable) {
        return exchangeRepository.findVisibleForUser(userId, pageable).map(exchangeEntityBoMapper::toBo);
    }

    @Transactional(readOnly = true)
    public ExchangeBo getVisibleById(UUID userId, UUID exchangeId) {
        return exchangeRepository.findVisibleById(exchangeId, userId)
                .map(exchangeEntityBoMapper::toBo)
                .orElseThrow(() -> new NotFoundException("Exchange not found"));
    }

    @Transactional
    public ExchangeBo transitionToNegotiating(UUID exchangeId,
                                              UUID actingUserId,
                                              List<UUID> proposedArticles,
                                              List<UUID> requestedArticles) {
        if (proposedArticles == null || proposedArticles.isEmpty() || requestedArticles == null || requestedArticles.isEmpty()) {
            throw new BadRequestException("Negotiation articles cannot be empty");
        }

        ExchangeEntity exchange = getVisibleExchangeEntity(exchangeId, actingUserId);
        ensureNotTerminal(exchange);

        if (exchange.getProposerId().equals(actingUserId)) {
            validateArticlesOwnershipAndAvailability(exchange.getProposerId(), proposedArticles, exchange.getAccepterId(), requestedArticles);
            exchange.setProposerArticles(new ArrayList<>(dedupe(proposedArticles)));
            exchange.setAccepterArticles(new ArrayList<>(dedupe(requestedArticles)));
        } else if (exchange.getAccepterId().equals(actingUserId)) {
            validateArticlesOwnershipAndAvailability(exchange.getProposerId(), requestedArticles, exchange.getAccepterId(), proposedArticles);
            exchange.setProposerArticles(new ArrayList<>(dedupe(requestedArticles)));
            exchange.setAccepterArticles(new ArrayList<>(dedupe(proposedArticles)));
        } else {
            throw new ForbiddenOperationException("Only participants can negotiate");
        }

        exchange.setStatus(ExchangeStatus.NEGOTIATING);
        exchange.setUpdatedAt(Instant.now(clock));
        return exchangeEntityBoMapper.toBo(exchangeRepository.save(exchange));
    }

    @Transactional
    public ExchangeBo transitionToAccepted(UUID exchangeId, UUID actingUserId) {
        ExchangeEntity exchange = getVisibleExchangeEntity(exchangeId, actingUserId);
        ensureNotTerminal(exchange);

        List<UUID> allArticleIds = new ArrayList<>();
        allArticleIds.addAll(exchange.getProposerArticles());
        allArticleIds.addAll(exchange.getAccepterArticles());

        Map<UUID, ArticleEntity> articles = loadArticles(allArticleIds);
        ensureNoExchangedArticles(articles.values());

        Instant now = Instant.now(clock);
        articles.values().forEach(article -> {
            article.setExchanged(true);
            article.setExchangedAt(now);
        });
        articleRepository.saveAll(articles.values());

        exchange.setStatus(ExchangeStatus.ACCEPTED);
        exchange.setUpdatedAt(now);
        return exchangeEntityBoMapper.toBo(exchangeRepository.save(exchange));
    }

    @Transactional
    public ExchangeBo transitionToRefused(UUID exchangeId, UUID actingUserId) {
        ExchangeEntity exchange = getVisibleExchangeEntity(exchangeId, actingUserId);
        ensureNotTerminal(exchange);

        exchange.setStatus(ExchangeStatus.REFUSED);
        exchange.setUpdatedAt(Instant.now(clock));
        return exchangeEntityBoMapper.toBo(exchangeRepository.save(exchange));
    }

    @Transactional(readOnly = true)
    public void ensureParticipant(UUID exchangeId, UUID userId) {
        getVisibleExchangeEntity(exchangeId, userId);
    }

    @Transactional(readOnly = true)
    public ExchangeEntity getVisibleExchangeEntity(UUID exchangeId, UUID userId) {
        return exchangeRepository.findVisibleById(exchangeId, userId)
                .orElseThrow(() -> new NotFoundException("Exchange not found"));
    }

    private void validateCreateCommand(ExchangeCreateCommandBo command) {
        if (command.proposerId().equals(command.accepterId())) {
            throw new BadRequestException("Cannot create exchange with yourself");
        }
        if (command.proposerArticles() == null || command.proposerArticles().isEmpty()) {
            throw new BadRequestException("Proposer articles cannot be empty");
        }
        if (command.accepterArticles() == null || command.accepterArticles().isEmpty()) {
            throw new BadRequestException("Accepter articles cannot be empty");
        }
    }

    private void validateArticlesOwnershipAndAvailability(UUID proposerId,
                                                          List<UUID> proposerArticleIds,
                                                          UUID accepterId,
                                                          List<UUID> accepterArticleIds) {
        List<UUID> proposerDistinct = dedupe(proposerArticleIds);
        List<UUID> accepterDistinct = dedupe(accepterArticleIds);

        if (proposerDistinct.size() != proposerArticleIds.size() || accepterDistinct.size() != accepterArticleIds.size()) {
            throw new BadRequestException("Duplicate articles are not allowed in exchange");
        }

        List<UUID> allIds = new ArrayList<>(proposerDistinct);
        allIds.addAll(accepterDistinct);
        Map<UUID, ArticleEntity> articles = loadArticles(allIds);
        ensureNoExchangedArticles(articles.values());

        for (UUID articleId : proposerDistinct) {
            ArticleEntity article = articles.get(articleId);
            if (!article.getUser().getId().equals(proposerId)) {
                throw new BadRequestException("One proposer article does not belong to proposer");
            }
        }
        for (UUID articleId : accepterDistinct) {
            ArticleEntity article = articles.get(articleId);
            if (!article.getUser().getId().equals(accepterId)) {
                throw new BadRequestException("One accepter article does not belong to accepter");
            }
        }
    }

    private Map<UUID, ArticleEntity> loadArticles(List<UUID> articleIds) {
        List<UUID> distinctIds = articleIds.stream().distinct().toList();
        List<ArticleEntity> entities = articleRepository.findByIdIn(distinctIds);
        if (entities.size() != distinctIds.size()) {
            throw new NotFoundException("One or more articles not found");
        }
        Map<UUID, ArticleEntity> map = new HashMap<>();
        for (ArticleEntity entity : entities) {
            map.put(entity.getId(), entity);
        }
        return map;
    }

    private void ensureNoExchangedArticles(Iterable<ArticleEntity> articles) {
        for (ArticleEntity article : articles) {
            if (article.isExchanged()) {
                throw new ConflictException("Articles already exchanged cannot be used");
            }
        }
    }

    private void ensureNotTerminal(ExchangeEntity exchange) {
        if (exchange.getStatus() == ExchangeStatus.ACCEPTED) {
            throw new ConflictException("Exchange already accepted");
        }
        if (exchange.getStatus() == ExchangeStatus.REFUSED) {
            throw new ConflictException("Exchange already refused");
        }
    }

    private List<UUID> dedupe(List<UUID> ids) {
        return new ArrayList<>(new LinkedHashSet<>(ids));
    }
}
