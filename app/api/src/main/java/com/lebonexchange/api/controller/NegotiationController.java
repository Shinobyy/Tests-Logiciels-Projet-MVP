package com.lebonexchange.api.controller;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.service.NegotiationService;
import com.lebonexchange.api.dto.request.NegotiationCreateRequest;
import com.lebonexchange.api.dto.response.MessageCreatedResponse;
import com.lebonexchange.api.mapper.MessageDtoMapper;
import com.lebonexchange.api.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/negotiations")
public class NegotiationController {

    private final NegotiationService negotiationService;
    private final MessageDtoMapper messageDtoMapper;

    public NegotiationController(NegotiationService negotiationService, MessageDtoMapper messageDtoMapper) {
        this.negotiationService = negotiationService;
        this.messageDtoMapper = messageDtoMapper;
    }

    @PostMapping
    public ResponseEntity<MessageCreatedResponse> createNegotiation(@AuthenticationPrincipal UserPrincipal principal,
                                                                    @Valid @RequestBody NegotiationCreateRequest request) {
        MessageBo message = negotiationService.createNegotiation(messageDtoMapper.toBo(principal.getId(), request));
        return ResponseEntity.ok(messageDtoMapper.toCreatedResponse(message));
    }
}
