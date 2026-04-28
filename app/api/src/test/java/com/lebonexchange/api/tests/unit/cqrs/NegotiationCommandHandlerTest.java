package com.lebonexchange.api.tests.unit.cqrs;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.bo.MessageType;
import com.lebonexchange.api.domain.bo.NegotiationCreateCommandBo;
import com.lebonexchange.api.domain.cqrs.NegotiationCommandHandler;
import com.lebonexchange.api.domain.service.NegotiationService;
import com.lebonexchange.api.exception.NotFoundException;
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
class NegotiationCommandHandlerTest {

    @Mock
    private NegotiationService negotiationService;

    private NegotiationCommandHandler handler;

    @BeforeEach
    void setUp() {
        handler = new NegotiationCommandHandler(negotiationService);
    }

    @Test
    void handle_shouldDelegateToNegotiationService() {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UUID exchangeId = UUID.randomUUID();
        NegotiationCreateCommandBo command = new NegotiationCreateCommandBo(
                userId, exchangeId, List.of(UUID.randomUUID()), List.of(UUID.randomUUID()), "Dune contre Foundation"
        );
        MessageBo expected = messageBo(userId, exchangeId);
        when(negotiationService.createNegotiation(command)).thenReturn(expected);

        // WHEN
        MessageBo result = handler.handle(command);

        // THEN
        assertThat(result).isEqualTo(expected);
        verify(negotiationService).createNegotiation(command);
    }

    @Test
    void handle_shouldPropagateException_whenExchangeNotFound() {
        // GIVEN
        NegotiationCreateCommandBo command = new NegotiationCreateCommandBo(
                UUID.randomUUID(), UUID.randomUUID(), List.of(UUID.randomUUID()), List.of(UUID.randomUUID()), "contenu"
        );
        when(negotiationService.createNegotiation(command)).thenThrow(new NotFoundException("Exchange not found"));

        // WHEN / THEN
        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Exchange not found");
    }

    private MessageBo messageBo(UUID userId, UUID exchangeId) {
        return new MessageBo(
                UUID.randomUUID(), exchangeId, userId, MessageType.NEGOTIATION,
                "Dune contre Foundation", List.of(UUID.randomUUID()), List.of(UUID.randomUUID()),
                false, Instant.parse("2026-02-26T12:00:00Z")
        );
    }
}
