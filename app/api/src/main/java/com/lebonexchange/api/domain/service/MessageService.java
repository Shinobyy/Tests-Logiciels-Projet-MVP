package com.lebonexchange.api.domain.service;

import com.lebonexchange.api.domain.bo.ExchangeBo;
import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.bo.MessageCreateCommandBo;
import com.lebonexchange.api.domain.bo.MessageType;
import com.lebonexchange.api.domain.bo.MessageUpdateCommandBo;
import com.lebonexchange.api.entity.ExchangeEntity;
import com.lebonexchange.api.entity.MessageEntity;
import com.lebonexchange.api.entity.UserEntity;
import com.lebonexchange.api.exception.BadRequestException;
import com.lebonexchange.api.exception.NotFoundException;
import com.lebonexchange.api.mapper.MessageEntityBoMapper;
import com.lebonexchange.api.repository.MessageRepository;
import com.lebonexchange.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ExchangeService exchangeService;
    private final MessageEntityBoMapper messageEntityBoMapper;
    private final Clock clock;

    public MessageService(MessageRepository messageRepository,
                          UserRepository userRepository,
                          ExchangeService exchangeService,
                          MessageEntityBoMapper messageEntityBoMapper,
                          Clock clock) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.exchangeService = exchangeService;
        this.messageEntityBoMapper = messageEntityBoMapper;
        this.clock = clock;
    }

    @Transactional
    public MessageBo send(MessageCreateCommandBo command) {
        UserEntity user = userRepository.findById(command.userId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        ExchangeEntity exchangeEntity;
        if (command.type() == MessageType.NEGOTIATION) {
            requireArticlesForNegotiation(command.proposedArticles(), command.requestedArticles());
            ExchangeBo updated = exchangeService.transitionToNegotiating(
                    command.exchangeId(),
                    command.userId(),
                    command.proposedArticles(),
                    command.requestedArticles()
            );
            exchangeEntity = exchangeService.getVisibleExchangeEntity(updated.id(), command.userId());
        } else if (command.type() == MessageType.ACCEPTED) {
            ExchangeBo updated = exchangeService.transitionToAccepted(command.exchangeId(), command.userId());
            exchangeEntity = exchangeService.getVisibleExchangeEntity(updated.id(), command.userId());
        } else if (command.type() == MessageType.REFUSED) {
            ExchangeBo updated = exchangeService.transitionToRefused(command.exchangeId(), command.userId());
            exchangeEntity = exchangeService.getVisibleExchangeEntity(updated.id(), command.userId());
        } else {
            exchangeEntity = exchangeService.getVisibleExchangeEntity(command.exchangeId(), command.userId());
        }

        MessageEntity message = MessageEntity.builder()
                .id(UUID.randomUUID())
                .exchange(exchangeEntity)
                .user(user)
                .type(command.type())
                .content(command.content().trim())
                .proposedArticles(toMutableList(command.proposedArticles()))
                .requestedArticles(toMutableList(command.requestedArticles()))
                .isRead(false)
                .createdAt(Instant.now(clock))
                .build();

        return messageEntityBoMapper.toBo(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public Page<MessageBo> listByExchange(UUID exchangeId, UUID userId, Pageable pageable) {
        exchangeService.ensureParticipant(exchangeId, userId);
        return messageRepository.findByExchange_IdOrderByCreatedAtAsc(exchangeId, pageable)
                .map(messageEntityBoMapper::toBo);
    }

    @Transactional
    public void update(MessageUpdateCommandBo command) {
        MessageEntity message = messageRepository.findById(command.messageId())
                .orElseThrow(() -> new NotFoundException("Message not found"));

        exchangeService.ensureParticipant(message.getExchange().getId(), command.userId());
        message.setRead(command.isRead());
        messageRepository.save(message);
    }

    private void requireArticlesForNegotiation(List<UUID> proposedArticles, List<UUID> requestedArticles) {
        if (proposedArticles == null || proposedArticles.isEmpty() || requestedArticles == null || requestedArticles.isEmpty()) {
            throw new BadRequestException("Negotiation requires proposed and requested articles");
        }
    }

    private List<UUID> toMutableList(List<UUID> articleIds) {
        if (articleIds == null) {
            return new ArrayList<>();
        }
        return new ArrayList<>(articleIds);
    }
}
