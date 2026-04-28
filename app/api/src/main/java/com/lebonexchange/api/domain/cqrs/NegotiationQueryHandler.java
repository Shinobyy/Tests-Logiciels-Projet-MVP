package com.lebonexchange.api.domain.cqrs;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.service.MessageService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class NegotiationQueryHandler {

    private final MessageService messageService;

    public NegotiationQueryHandler(MessageService messageService) {
        this.messageService = messageService;
    }

    public List<MessageBo> listByExchange(UUID exchangeId, UUID userId) {
        return messageService.listNegotiationsByExchange(exchangeId, userId);
    }
}
