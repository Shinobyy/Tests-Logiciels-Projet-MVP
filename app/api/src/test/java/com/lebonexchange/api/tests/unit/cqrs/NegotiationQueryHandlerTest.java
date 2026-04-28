package com.lebonexchange.api.tests.unit.cqrs;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.bo.MessageType;
import com.lebonexchange.api.domain.cqrs.NegotiationQueryHandler;
import com.lebonexchange.api.domain.service.MessageService;
import com.lebonexchange.api.exception.ForbiddenOperationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NegotiationQueryHandlerTest {

    @Mock
    private MessageService messageService;

    private NegotiationQueryHandler handler;

    @BeforeEach
    void setUp() {
        handler = new NegotiationQueryHandler(messageService);
    }

    @Test
    void listByExchange_shouldReturnNegotiations_forParticipant() {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UUID exchangeId = UUID.randomUUID();
        List<MessageBo> expected = List.of(messageBo(userId, exchangeId), messageBo(userId, exchangeId));
        when(messageService.listNegotiationsByExchange(exchangeId, userId)).thenReturn(expected);

        // WHEN
        List<MessageBo> result = handler.listByExchange(exchangeId, userId);

        // THEN
        assertThat(result).hasSize(2);
        assertThat(result).allMatch(m -> m.type() == MessageType.NEGOTIATION);
        verify(messageService).listNegotiationsByExchange(exchangeId, userId);
    }

    @Test
    void listByExchange_shouldReturnEmptyList_whenNoNegotiations() {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UUID exchangeId = UUID.randomUUID();
        when(messageService.listNegotiationsByExchange(exchangeId, userId)).thenReturn(List.of());

        // WHEN
        List<MessageBo> result = handler.listByExchange(exchangeId, userId);

        // THEN
        assertThat(result).isEmpty();
    }

    @Test
    void listByExchange_shouldPropagateException_whenUserIsNotParticipant() {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UUID exchangeId = UUID.randomUUID();
        when(messageService.listNegotiationsByExchange(exchangeId, userId))
                .thenThrow(new ForbiddenOperationException("Not a participant"));

        // WHEN / THEN
        assertThatThrownBy(() -> handler.listByExchange(exchangeId, userId))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessageContaining("Not a participant");
    }

    private MessageBo messageBo(UUID userId, UUID exchangeId) {
        return new MessageBo(
                UUID.randomUUID(), exchangeId, userId, MessageType.NEGOTIATION,
                "Je propose...", List.of(UUID.randomUUID()), List.of(UUID.randomUUID()),
                false, Instant.parse("2026-02-26T12:00:00Z")
        );
    }
}
