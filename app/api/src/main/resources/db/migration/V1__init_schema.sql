CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    pseudonym VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    rating DOUBLE PRECISION NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    CONSTRAINT ck_users_rating CHECK (rating > 0 AND rating < 5)
);

CREATE TABLE categories (
    id UUID PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE articles (
    id UUID PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    image VARCHAR(500),
    exchanged BOOLEAN NOT NULL DEFAULT FALSE,
    exchanged_at TIMESTAMPTZ
);

CREATE TABLE article_categories (
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, category_id)
);

CREATE TABLE exchanges (
    id UUID PRIMARY KEY,
    proposer_id UUID NOT NULL REFERENCES users(id),
    accepter_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_exchanges_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REFUSED', 'NEGOTIATING'))
);

CREATE TABLE exchange_proposer_articles (
    exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id),
    PRIMARY KEY (exchange_id, article_id)
);

CREATE TABLE exchange_accepter_articles (
    exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id),
    PRIMARY KEY (exchange_id, article_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_messages_type CHECK (type IN ('MESSAGE', 'NEGOTIATION', 'ACCEPTED', 'REFUSED'))
);

CREATE TABLE message_proposed_articles (
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id),
    PRIMARY KEY (message_id, article_id)
);

CREATE TABLE message_requested_articles (
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id),
    PRIMARY KEY (message_id, article_id)
);

CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_exchanged ON articles(exchanged);
CREATE INDEX idx_exchanges_proposer_id ON exchanges(proposer_id);
CREATE INDEX idx_exchanges_accepter_id ON exchanges(accepter_id);
CREATE INDEX idx_messages_exchange_id ON messages(exchange_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
