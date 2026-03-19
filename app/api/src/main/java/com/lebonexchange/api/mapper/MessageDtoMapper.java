package com.lebonexchange.api.mapper;

import com.lebonexchange.api.domain.bo.MessageBo;
import com.lebonexchange.api.domain.bo.MessageCreateCommandBo;
import com.lebonexchange.api.domain.bo.MessageType;
import com.lebonexchange.api.domain.bo.MessageUpdateCommandBo;
import com.lebonexchange.api.domain.bo.NegotiationCreateCommandBo;
import com.lebonexchange.api.domain.bo.UserBo;
import com.lebonexchange.api.dto.request.MessageCreateRequest;
import com.lebonexchange.api.dto.request.MessageUpdateRequest;
import com.lebonexchange.api.dto.request.NegotiationCreateRequest;
import com.lebonexchange.api.dto.response.MessageCreatedItemResponse;
import com.lebonexchange.api.dto.response.MessageCreatedResponse;
import com.lebonexchange.api.dto.response.MessageListItemResponse;
import com.lebonexchange.api.dto.response.MessagesResponse;
import com.lebonexchange.api.dto.response.UserSummaryResponse;
import com.lebonexchange.api.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Component
public class MessageDtoMapper {

    public MessageCreateCommandBo toBo(UUID userId, MessageCreateRequest request) {
        return new MessageCreateCommandBo(
                userId,
                request.exchange_id(),
                parseType(request.type()),
                request.content(),
                request.proposed_articles(),
                request.requested_articles()
        );
    }

    public MessageUpdateCommandBo toBo(UUID messageId, UUID userId, MessageUpdateRequest request) {
        return new MessageUpdateCommandBo(messageId, userId, request.is_read());
    }

    public NegotiationCreateCommandBo toBo(UUID userId, NegotiationCreateRequest request) {
        return new NegotiationCreateCommandBo(
                userId,
                request.exchange_id(),
                request.proposed_articles(),
                request.requested_articles(),
                request.content()
        );
    }

    public MessageCreatedResponse toCreatedResponse(MessageBo message) {
        return MessageCreatedResponse.success(new MessageCreatedItemResponse(
                message.id(),
                message.exchangeId(),
                message.userId(),
                message.type().name().toLowerCase(),
                message.content(),
                nullableList(message.proposedArticles()),
                nullableList(message.requestedArticles()),
                message.isRead(),
                message.createdAt()
        ));
    }

    public MessagesResponse toListResponse(List<MessageBo> messages, List<UserBo> users) {
        return new MessagesResponse(messages.stream()
                .map(message -> new MessageListItemResponse(
                        message.id(),
                        toUserSummary(findUser(users, message.userId())),
                        message.type().name().toLowerCase(),
                        message.content(),
                        nullableList(message.proposedArticles()),
                        nullableList(message.requestedArticles()),
                        message.isRead(),
                        message.createdAt()
                ))
                .toList());
    }

    private MessageType parseType(String value) {
        try {
            return MessageType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid message type");
        }
    }

    private List<UUID> nullableList(List<UUID> values) {
        return values == null || values.isEmpty() ? null : values;
    }

    private UserBo findUser(List<UserBo> users, UUID userId) {
        return users.stream()
                .filter(user -> user.id().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("User not found " + userId));
    }

    private UserSummaryResponse toUserSummary(UserBo user) {
        return new UserSummaryResponse(user.id(), user.pseudonym(), user.avatar());
    }
}
