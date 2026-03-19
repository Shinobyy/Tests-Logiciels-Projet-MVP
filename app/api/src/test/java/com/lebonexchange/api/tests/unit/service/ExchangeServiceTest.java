package com.lebonexchange.api.tests.unit.service;

import com.lebonexchange.api.domain.bo.ExchangeBo;
import com.lebonexchange.api.domain.bo.ExchangeCreateCommandBo;
import com.lebonexchange.api.domain.bo.ExchangeStatus;
import com.lebonexchange.api.entity.ArticleEntity;
import com.lebonexchange.api.entity.ExchangeEntity;
import com.lebonexchange.api.entity.MessageEntity;
import com.lebonexchange.api.entity.UserEntity;
import com.lebonexchange.api.exception.ConflictException;
import com.lebonexchange.api.mapper.ExchangeEntityBoMapper;
import com.lebonexchange.api.repository.ArticleRepository;
import com.lebonexchange.api.repository.ExchangeRepository;
import com.lebonexchange.api.repository.MessageRepository;
import com.lebonexchange.api.repository.UserRepository;
import com.lebonexchange.api.domain.service.ExchangeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExchangeServiceTest {

    @Mock
    private ExchangeRepository exchangeRepository;
    @Mock
    private MessageRepository messageRepository;
    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ExchangeEntityBoMapper exchangeEntityBoMapper;

    private ExchangeService exchangeService;
    private Clock fixedClock;

    @BeforeEach
    void setUp() {
        fixedClock = Clock.fixed(Instant.parse("2026-02-26T12:00:00Z"), ZoneOffset.UTC);
        exchangeService = new ExchangeService(
                exchangeRepository,
                messageRepository,
                articleRepository,
                userRepository,
                exchangeEntityBoMapper,
                fixedClock
        );
        when(exchangeEntityBoMapper.toBo(any(ExchangeEntity.class))).thenAnswer(invocation -> toBo(invocation.getArgument(0)));
    }

    @Test
    void create_shouldCreatePendingExchangeAndInitialMessage() {
        // GIVEN
        UUID proposerId = UUID.randomUUID();
        UUID accepterId = UUID.randomUUID();
        UUID proposerArticleId = UUID.randomUUID();
        UUID accepterArticleId = UUID.randomUUID();
        ExchangeCreateCommandBo command = new ExchangeCreateCommandBo(
                proposerId,
                accepterId,
                List.of(proposerArticleId),
                List.of(accepterArticleId),
                "Je propose Dune contre Foundation"
        );

        when(userRepository.findById(proposerId)).thenReturn(Optional.of(user(proposerId)));
        when(userRepository.findById(accepterId)).thenReturn(Optional.of(user(accepterId)));
        when(articleRepository.findByIdIn(anyList())).thenReturn(List.of(
                article(proposerArticleId, proposerId, false),
                article(accepterArticleId, accepterId, false)
        ));
        when(exchangeRepository.save(any(ExchangeEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(messageRepository.save(any(MessageEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        ExchangeBo result = exchangeService.create(command);

        // THEN
        assertThat(result.status()).isEqualTo(ExchangeStatus.PENDING);
        assertThat(result.proposerId()).isEqualTo(proposerId);

        ArgumentCaptor<MessageEntity> messageCaptor = ArgumentCaptor.forClass(MessageEntity.class);
        verify(messageRepository).save(messageCaptor.capture());
        MessageEntity initialMessage = messageCaptor.getValue();
        assertThat(initialMessage.getContent()).isEqualTo("Je propose Dune contre Foundation");
        assertThat(initialMessage.getType().name()).isEqualTo("MESSAGE");
    }

    @Test
    void create_shouldFail_whenArticleAlreadyExchanged() {
        // GIVEN
        UUID proposerId = UUID.randomUUID();
        UUID accepterId = UUID.randomUUID();
        UUID proposerArticleId = UUID.randomUUID();
        UUID accepterArticleId = UUID.randomUUID();
        ExchangeCreateCommandBo command = new ExchangeCreateCommandBo(
                proposerId,
                accepterId,
                List.of(proposerArticleId),
                List.of(accepterArticleId),
                "Message"
        );

        when(userRepository.findById(proposerId)).thenReturn(Optional.of(user(proposerId)));
        when(userRepository.findById(accepterId)).thenReturn(Optional.of(user(accepterId)));
        when(articleRepository.findByIdIn(anyList())).thenReturn(List.of(
                article(proposerArticleId, proposerId, true),
                article(accepterArticleId, accepterId, false)
        ));

        // WHEN / THEN
        assertThatThrownBy(() -> exchangeService.create(command))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already exchanged");
    }

    @Test
    void transitionToNegotiating_shouldMovePendingToNegotiating() {
        // GIVEN
        UUID proposerId = UUID.randomUUID();
        UUID accepterId = UUID.randomUUID();
        UUID proposerArticleId = UUID.randomUUID();
        UUID accepterArticleId = UUID.randomUUID();
        ExchangeEntity exchange = exchangeEntity(proposerId, accepterId, proposerArticleId, accepterArticleId, ExchangeStatus.PENDING);

        when(exchangeRepository.findVisibleById(exchange.getId(), proposerId)).thenReturn(Optional.of(exchange));
        when(articleRepository.findByIdIn(anyList())).thenReturn(List.of(
                article(proposerArticleId, proposerId, false),
                article(accepterArticleId, accepterId, false)
        ));
        when(exchangeRepository.save(any(ExchangeEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        ExchangeBo result = exchangeService.transitionToNegotiating(
                exchange.getId(),
                proposerId,
                List.of(proposerArticleId),
                List.of(accepterArticleId)
        );

        // THEN
        assertThat(result.status()).isEqualTo(ExchangeStatus.NEGOTIATING);
        assertThat(result.updatedAt()).isEqualTo(Instant.parse("2026-02-26T12:00:00Z"));
    }

    @Test
    void transitionToAccepted_shouldMarkArticlesExchanged() {
        // GIVEN
        UUID proposerId = UUID.randomUUID();
        UUID accepterId = UUID.randomUUID();
        UUID proposerArticleId = UUID.randomUUID();
        UUID accepterArticleId = UUID.randomUUID();
        ExchangeEntity exchange = exchangeEntity(proposerId, accepterId, proposerArticleId, accepterArticleId, ExchangeStatus.PENDING);
        ArticleEntity proposerArticle = article(proposerArticleId, proposerId, false);
        ArticleEntity accepterArticle = article(accepterArticleId, accepterId, false);

        when(exchangeRepository.findVisibleById(exchange.getId(), proposerId)).thenReturn(Optional.of(exchange));
        when(articleRepository.findByIdIn(anyList())).thenReturn(List.of(proposerArticle, accepterArticle));
        when(articleRepository.saveAll(any())).thenAnswer(invocation -> {
            Iterable<ArticleEntity> iterable = invocation.getArgument(0);
            List<ArticleEntity> saved = new ArrayList<>();
            iterable.forEach(saved::add);
            return saved;
        });
        when(exchangeRepository.save(any(ExchangeEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        ExchangeBo result = exchangeService.transitionToAccepted(exchange.getId(), proposerId);

        // THEN
        assertThat(result.status()).isEqualTo(ExchangeStatus.ACCEPTED);
        assertThat(proposerArticle.isExchanged()).isTrue();
        assertThat(accepterArticle.isExchanged()).isTrue();
        assertThat(proposerArticle.getExchangedAt()).isEqualTo(Instant.parse("2026-02-26T12:00:00Z"));
    }

    @Test
    void transitionToRefused_shouldSetRefusedStatus() {
        // GIVEN
        UUID proposerId = UUID.randomUUID();
        UUID accepterId = UUID.randomUUID();
        UUID proposerArticleId = UUID.randomUUID();
        UUID accepterArticleId = UUID.randomUUID();
        ExchangeEntity exchange = exchangeEntity(proposerId, accepterId, proposerArticleId, accepterArticleId, ExchangeStatus.PENDING);

        when(exchangeRepository.findVisibleById(exchange.getId(), accepterId)).thenReturn(Optional.of(exchange));
        when(exchangeRepository.save(any(ExchangeEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        ExchangeBo result = exchangeService.transitionToRefused(exchange.getId(), accepterId);

        // THEN
        assertThat(result.status()).isEqualTo(ExchangeStatus.REFUSED);
        assertThat(result.updatedAt()).isEqualTo(Instant.parse("2026-02-26T12:00:00Z"));
    }

    private ExchangeBo toBo(ExchangeEntity entity) {
        return new ExchangeBo(
                entity.getId(),
                entity.getProposerId(),
                entity.getAccepterId(),
                List.copyOf(entity.getProposerArticles()),
                List.copyOf(entity.getAccepterArticles()),
                entity.getStatus(),
                entity.getUpdatedAt()
        );
    }

    private UserEntity user(UUID id) {
        return UserEntity.builder()
                .id(id)
                .email(id + "@example.com")
                .pseudonym("User")
                .avatar("https://avatar")
                .rating(4.0d)
                .passwordHash("hash")
                .build();
    }

    private ArticleEntity article(UUID id, UUID ownerId, boolean exchanged) {
        ArticleEntity article = ArticleEntity.builder()
                .id(id)
                .titre("Book")
                .description("Desc")
                .publishedAt(Instant.parse("2026-02-20T12:00:00Z"))
                .user(user(ownerId))
                .image("https://img")
                .exchanged(exchanged)
                .build();
        if (exchanged) {
            article.setExchangedAt(Instant.parse("2026-02-21T12:00:00Z"));
        }
        return article;
    }

    private ExchangeEntity exchangeEntity(UUID proposerId,
                                          UUID accepterId,
                                          UUID proposerArticleId,
                                          UUID accepterArticleId,
                                          ExchangeStatus status) {
        return ExchangeEntity.builder()
                .id(UUID.randomUUID())
                .proposerId(proposerId)
                .accepterId(accepterId)
                .proposerArticles(new ArrayList<>(List.of(proposerArticleId)))
                .accepterArticles(new ArrayList<>(List.of(accepterArticleId)))
                .status(status)
                .updatedAt(Instant.parse("2026-02-25T12:00:00Z"))
                .build();
    }
}
