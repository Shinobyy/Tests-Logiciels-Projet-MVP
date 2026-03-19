package com.lebonexchange.api.controller;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.domain.service.MessageService;
import com.lebonexchange.api.domain.service.UserService;
import com.lebonexchange.api.dto.request.MessageCreateRequest;
import com.lebonexchange.api.dto.request.MessageUpdateRequest;
import com.lebonexchange.api.dto.response.MessageCreatedResponse;
import com.lebonexchange.api.dto.response.MessagesResponse;
import com.lebonexchange.api.dto.response.StatusResponse;
import com.lebonexchange.api.mapper.MessageDtoMapper;
import com.lebonexchange.api.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;
    private final MessageDtoMapper messageDtoMapper;

    public MessageController(MessageService messageService, UserService userService, MessageDtoMapper messageDtoMapper) {
        this.messageService = messageService;
        this.userService = userService;
        this.messageDtoMapper = messageDtoMapper;
    }

    @PostMapping
    public ResponseEntity<MessageCreatedResponse> createMessage(@AuthenticationPrincipal UserPrincipal principal,
                                                                @Valid @RequestBody MessageCreateRequest request) {
        MessageBo message = messageService.send(messageDtoMapper.toBo(principal.getId(), request));
        return ResponseEntity.ok(messageDtoMapper.toCreatedResponse(message));
    }

    @GetMapping("/{exchangeId}")
    public ResponseEntity<MessagesResponse> listMessages(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable UUID exchangeId,
                                                         @PageableDefault(size = 50) Pageable pageable) {
        List<MessageBo> messages = messageService.listByExchange(exchangeId, principal.getId(), pageable).getContent();
        List<UserBo> users = userService.getByIds(messages.stream().map(MessageBo::userId).distinct().toList());
        return ResponseEntity.ok(messageDtoMapper.toListResponse(messages, users));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatusResponse> updateMessage(@AuthenticationPrincipal UserPrincipal principal,
                                                        @PathVariable UUID id,
                                                        @Valid @RequestBody MessageUpdateRequest request) {
        messageService.update(messageDtoMapper.toBo(id, principal.getId(), request));
        return ResponseEntity.ok(StatusResponse.success());
    }
}
