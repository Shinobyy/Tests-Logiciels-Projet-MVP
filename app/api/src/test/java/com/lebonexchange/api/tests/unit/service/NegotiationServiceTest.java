package com.lebonexchange.api.tests.unit.service;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.bo.MessageCreateCommandBo;
import com.lebonexchange.api.domain.bo.MessageType;
import com.lebonexchange.api.domain.bo.NegotiationCreateCommandBo;
import com.lebonexchange.api.domain.service.MessageService;
import com.lebonexchange.api.domain.service.NegotiationService;
import com.lebonexchange.api.exception.BadRequestException;
import com.lebonexchange.api.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NegotiationServiceTest {

    @Mock
    private MessageService messageService;

    private NegotiationService negotiationService;

    @BeforeEach
    void setUp() {
        negotiationService = new NegotiationService(messageService);
    }

    @Test
    void createNegotiation_shouldDelegateToMessageService_withNegotiationType() {
        // GIVEN
        UUID userId = UUID.randomUUID();
        UUID exchangeId = UUID.randomUUID();
        UUID proposedArticleId = UUID.randomUUID();
        UUID requestedArticleId = UUID.randomUUID();
        NegotiationCreateCommandBo command = new NegotiationCreateCommandBo(
                userId, exchangeId, List.of(proposedArticleId), List.of(requestedArticleId), "Je propose Dune"
        );
        MessageBo expected = messageBo(userId, exchangeId);
        when(messageService.send(any(MessageCreateCommandBo.class))).thenReturn(expected);

        // WHEN
        MessageBo result = negotiationService.createNegotiation(command);

        // THEN
        assertThat(result).isEqualTo(expected);
        ArgumentCaptor<MessageCreateCommandBo> captor = ArgumentCaptor.forClass(MessageCreateCommandBo.class);
        verify(messageService).send(captor.capture());
        MessageCreateCommandBo delegated = captor.getValue();
        assertThat(delegated.type()).isEqualTo(MessageType.NEGOTIATION);
        assertThat(delegated.userId()).isEqualTo(userId);
        assertThat(delegated.exchangeId()).isEqualTo(exchangeId);
        assertThat(delegated.proposedArticles()).containsExactly(proposedArticleId);
        assertThat(delegated.requestedArticles()).containsExactly(requestedArticleId);
        assertThat(delegated.content()).isEqualTo("Je propose Dune");
    }

    @Test
    void createNegotiation_shouldPropagateException_whenArticlesAreMissing() {
        // GIVEN
        NegotiationCreateCommandBo command = new NegotiationCreateCommandBo(
                UUID.randomUUID(), UUID.randomUUID(), List.of(), List.of(), "contenu"
        );
        when(messageService.send(any(MessageCreateCommandBo.class)))
                .thenThrow(new BadRequestException("Negotiation requires proposed and requested articles"));

        // WHEN / THEN
        assertThatThrownBy(() -> negotiationService.createNegotiation(command))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Negotiation requires");
    }

    @Test
    void createNegotiation_shouldPropagateException_whenExchangeNotFound() {
        // GIVEN
        NegotiationCreateCommandBo command = new NegotiationCreateCommandBo(
                UUID.randomUUID(), UUID.randomUUID(), List.of(UUID.randomUUID()), List.of(UUID.randomUUID()), "contenu"
        );
        when(messageService.send(any(MessageCreateCommandBo.class)))
                .thenThrow(new NotFoundException("Exchange not found"));

        // WHEN / THEN
        assertThatThrownBy(() -> negotiationService.createNegotiation(command))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Exchange not found");
    }

    private MessageBo messageBo(UUID userId, UUID exchangeId) {
        return new MessageBo(
                UUID.randomUUID(), exchangeId, userId, MessageType.NEGOTIATION,
                "Je propose Dune", List.of(UUID.randomUUID()), List.of(UUID.randomUUID()),
                false, Instant.parse("2026-02-26T12:00:00Z")
        );
    }
}
