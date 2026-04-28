package com.lebonexchange.api.controller;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.domain.cqrs.NegotiationCommandHandler;
import com.lebonexchange.api.domain.cqrs.NegotiationQueryHandler;
import com.lebonexchange.api.domain.service.UserService;
import com.lebonexchange.api.dto.request.NegotiationCreateRequest;
import com.lebonexchange.api.dto.response.MessageCreatedResponse;
import com.lebonexchange.api.dto.response.MessagesResponse;
import com.lebonexchange.api.mapper.MessageDtoMapper;
import com.lebonexchange.api.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/negotiations")
public class NegotiationController {

    private final NegotiationCommandHandler negotiationCommandHandler;
    private final NegotiationQueryHandler negotiationQueryHandler;
    private final UserService userService;
    private final MessageDtoMapper messageDtoMapper;

    public NegotiationController(NegotiationCommandHandler negotiationCommandHandler,
                                 NegotiationQueryHandler negotiationQueryHandler,
                                 UserService userService,
                                 MessageDtoMapper messageDtoMapper) {
        this.negotiationCommandHandler = negotiationCommandHandler;
        this.negotiationQueryHandler = negotiationQueryHandler;
        this.userService = userService;
        this.messageDtoMapper = messageDtoMapper;
    }

    @PostMapping
    public ResponseEntity<MessageCreatedResponse> createNegotiation(@AuthenticationPrincipal UserPrincipal principal,
                                                                    @Valid @RequestBody NegotiationCreateRequest request) {
        MessageBo message = negotiationCommandHandler.handle(messageDtoMapper.toBo(principal.getId(), request));
        return ResponseEntity.ok(messageDtoMapper.toCreatedResponse(message));
    }

    @GetMapping("/{exchangeId}")
    public ResponseEntity<MessagesResponse> listNegotiations(@AuthenticationPrincipal UserPrincipal principal,
                                                             @PathVariable UUID exchangeId) {
        List<MessageBo> negotiations = negotiationQueryHandler.listByExchange(exchangeId, principal.getId());
        List<UserBo> users = userService.getByIds(negotiations.stream().map(MessageBo::userId).distinct().toList());
        return ResponseEntity.ok(messageDtoMapper.toListResponse(negotiations, users));
    }
}
