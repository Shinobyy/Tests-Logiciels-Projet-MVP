package com.lebonexchange.api.domain.cqrs;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.bo.NegotiationCreateCommandBo;
import com.lebonexchange.api.domain.service.NegotiationService;
import org.springframework.stereotype.Component;

@Component
public class NegotiationCommandHandler {

    private final NegotiationService negotiationService;

    public NegotiationCommandHandler(NegotiationService negotiationService) {
        this.negotiationService = negotiationService;
    }

    public MessageBo handle(NegotiationCreateCommandBo command) {
        return negotiationService.createNegotiation(command);
    }
}
