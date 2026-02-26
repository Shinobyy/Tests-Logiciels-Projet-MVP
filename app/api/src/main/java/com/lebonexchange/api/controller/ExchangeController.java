package com.lebonexchange.api.controller;

import com.lebonexchange.api.domain.bo.ExchangeBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.domain.service.ExchangeService;
import com.lebonexchange.api.domain.service.UserService;
import com.lebonexchange.api.dto.request.ExchangeCreateRequest;
import com.lebonexchange.api.dto.response.CreateExchangeResponse;
import com.lebonexchange.api.dto.response.ExchangeResponse;
import com.lebonexchange.api.dto.response.ExchangesResponse;
import com.lebonexchange.api.mapper.ExchangeDtoMapper;
import com.lebonexchange.api.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/exchanges")
public class ExchangeController {

    private final ExchangeService exchangeService;
    private final UserService userService;
    private final ExchangeDtoMapper exchangeDtoMapper;

    public ExchangeController(ExchangeService exchangeService, UserService userService, ExchangeDtoMapper exchangeDtoMapper) {
        this.exchangeService = exchangeService;
        this.userService = userService;
        this.exchangeDtoMapper = exchangeDtoMapper;
    }

    @PostMapping
    public ResponseEntity<CreateExchangeResponse> createExchange(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @Valid @RequestBody ExchangeCreateRequest request) {
        ExchangeBo exchange = exchangeService.create(exchangeDtoMapper.toBo(principal.getId(), request));
        return ResponseEntity.ok(exchangeDtoMapper.toCreateResponse(exchange.id()));
    }

    @GetMapping
    public ResponseEntity<ExchangesResponse> listExchanges(@AuthenticationPrincipal UserPrincipal principal,
                                                           @PageableDefault(size = 20) Pageable pageable) {
        List<ExchangeBo> exchanges = exchangeService.listVisible(principal.getId(), pageable).getContent();
        List<UUID> userIds = exchanges.stream()
                .flatMap(exchange -> Stream.of(exchange.proposerId(), exchange.accepterId()))
                .distinct()
                .toList();
        List<UserBo> users = userService.getByIds(userIds);
        return ResponseEntity.ok(exchangeDtoMapper.toListResponse(exchanges, users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExchangeResponse> getExchange(@AuthenticationPrincipal UserPrincipal principal,
                                                        @PathVariable UUID id) {
        ExchangeBo exchange = exchangeService.getVisibleById(principal.getId(), id);
        UserBo proposer = userService.getById(exchange.proposerId());
        UserBo accepter = userService.getById(exchange.accepterId());
        return ResponseEntity.ok(exchangeDtoMapper.toDetailResponse(exchange, proposer, accepter));
    }
}
