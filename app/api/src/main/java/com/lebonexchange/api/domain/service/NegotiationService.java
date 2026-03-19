package com.lebonexchange.api.domain.service;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.bo.MessageCreateCommandBo;
import com.lebonexchange.api.domain.bo.MessageType;
import com.lebonexchange.api.domain.bo.NegotiationCreateCommandBo;
import org.springframework.stereotype.Service;

@Service
public class NegotiationService {

    private final MessageService messageService;

    public NegotiationService(MessageService messageService) {
        this.messageService = messageService;
    }

    public MessageBo createNegotiation(NegotiationCreateCommandBo command) {
        return messageService.send(new MessageCreateCommandBo(
                command.userId(),
                command.exchangeId(),
                MessageType.NEGOTIATION,
                command.content(),
                command.proposedArticles(),
                command.requestedArticles()
        ));
    }
}
