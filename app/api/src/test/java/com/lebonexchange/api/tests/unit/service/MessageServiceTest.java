package com.lebonexchange.api.tests.unit.service;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.bo.MessageCreateCommandBo;
import com.lebonexchange.api.domain.bo.MessageType;
import com.lebonexchange.api.domain.service.ExchangeService;
import com.lebonexchange.api.domain.service.MessageService;
import com.lebonexchange.api.entity.ExchangeEntity;
import com.lebonexchange.api.entity.MessageEntity;
import com.lebonexchange.api.entity.UserEntity;
import com.lebonexchange.api.exception.NotFoundException;
import com.lebonexchange.api.mapper.MessageEntityBoMapper;
import com.lebonexchange.api.repository.MessageRepository;
import com.lebonexchange.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ExchangeService exchangeService;
    @Mock
    private MessageEntityBoMapper messageEntityBoMapper;

    private MessageService messageService;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-02-26T12:00:00Z"), ZoneOffset.UTC);
        messageService = new MessageService(messageRepository, userRepository, exchangeService, messageEntityBoMapper, clock);
    }

    @Test
    void send_shouldCreateMessage_whenUserIsParticipant() {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UUID exchangeId = UUID.randomUUID();
        UserEntity user = user(userId);
        ExchangeEntity exchange = ExchangeEntity.builder()
                .id(exchangeId)
                .proposerId(userId)
                .accepterId(UUID.randomUUID())
                .build();
        MessageCreateCommandBo command = new MessageCreateCommandBo(
                userId,
                exchangeId,
                MessageType.MESSAGE,
                "Bonjour, echange de livres ?",
                null,
                null
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(exchangeService.getVisibleExchangeEntity(exchangeId, userId)).thenReturn(exchange);
        when(messageRepository.save(any(MessageEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(messageEntityBoMapper.toBo(any(MessageEntity.class))).thenAnswer(invocation -> {
            MessageEntity message = invocation.getArgument(0);
            return new MessageBo(
                    message.getId(),
                    message.getExchange().getId(),
                    message.getUser().getId(),
                    message.getType(),
                    message.getContent(),
                    List.copyOf(message.getProposedArticles()),
                    List.copyOf(message.getRequestedArticles()),
                    message.isRead(),
                    message.getCreatedAt()
            );
        });

        // WHEN
        MessageBo result = messageService.send(command);

        // THEN
        assertThat(result.exchangeId()).isEqualTo(exchangeId);
        assertThat(result.type()).isEqualTo(MessageType.MESSAGE);

        ArgumentCaptor<MessageEntity> captor = ArgumentCaptor.forClass(MessageEntity.class);
        verify(messageRepository).save(captor.capture());
        assertThat(captor.getValue().getContent()).isEqualTo("Bonjour, echange de livres ?");
    }

    @Test
    void send_shouldFail_whenUserIsExternal() {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UUID exchangeId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user(userId)));
        when(exchangeService.getVisibleExchangeEntity(exchangeId, userId))
                .thenThrow(new NotFoundException("Exchange not found"));

        MessageCreateCommandBo command = new MessageCreateCommandBo(
                userId,
                exchangeId,
                MessageType.MESSAGE,
                "Hello",
                null,
                null
        );

        // WHEN / THEN
        assertThatThrownBy(() -> messageService.send(command))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Exchange not found");
    }

    private UserEntity user(UUID id) {
        return UserEntity.builder()
                .id(id)
                .email(id + "@example.com")
                .pseudonym("Reader")
                .avatar("https://avatar")
                .rating(4.0d)
                .passwordHash("hash")
                .build();
    }
}
