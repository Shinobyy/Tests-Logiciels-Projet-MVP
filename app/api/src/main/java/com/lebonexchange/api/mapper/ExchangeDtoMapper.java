package com.lebonexchange.api.mapper;

import com.lebonexchange.api.domain.bo.ExchangeBo;
import com.lebonexchange.api.domain.bo.ExchangeCreateCommandBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.dto.request.ExchangeCreateRequest;
import com.lebonexchange.api.dto.response.CreateExchangeResponse;
import com.lebonexchange.api.dto.response.ExchangeItemResponse;
import com.lebonexchange.api.dto.response.ExchangeResponse;
import com.lebonexchange.api.dto.response.ExchangesResponse;
import com.lebonexchange.api.dto.response.UserSummaryResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class ExchangeDtoMapper {

    public ExchangeCreateCommandBo toBo(UUID proposerId, ExchangeCreateRequest request) {
        return new ExchangeCreateCommandBo(
                proposerId,
                request.accepter_id(),
                request.proposer_articles(),
                request.accepter_articles(),
                request.message()
        );
    }

    public CreateExchangeResponse toCreateResponse(UUID exchangeId) {
        return CreateExchangeResponse.success(exchangeId);
    }

    public ExchangesResponse toListResponse(List<ExchangeBo> exchanges, List<UserBo> users) {
        return new ExchangesResponse(exchanges.stream()
                .map(exchange -> toItem(
                        exchange,
                        findUser(users, exchange.proposerId()),
                        findUser(users, exchange.accepterId())
                ))
                .toList());
    }

    public ExchangeResponse toDetailResponse(ExchangeBo exchange, UserBo proposer, UserBo accepter) {
        return new ExchangeResponse(toItem(exchange, proposer, accepter));
    }

    private ExchangeItemResponse toItem(ExchangeBo exchange, UserBo proposer, UserBo accepter) {
        return new ExchangeItemResponse(
                exchange.id(),
                toUserSummary(proposer),
                toUserSummary(accepter),
                exchange.proposerArticles(),
                exchange.accepterArticles(),
                exchange.status().name().toLowerCase(),
                exchange.updatedAt()
        );
    }

    private UserSummaryResponse toUserSummary(UserBo user) {
        return new UserSummaryResponse(user.id(), user.pseudonym(), user.avatar());
    }

    private UserBo findUser(List<UserBo> users, UUID userId) {
        return users.stream()
                .filter(user -> user.id().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("User not found " + userId));
    }
}
