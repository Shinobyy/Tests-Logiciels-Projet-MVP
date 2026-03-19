INSERT INTO users (id, email, pseudonym, avatar, rating, password_hash) VALUES
('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'Alice', 'https://picsum.photos/seed/alice/200', 4.6, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('22222222-2222-2222-2222-222222222222', 'bob@example.com', 'Bob', 'https://picsum.photos/seed/bob/200', 4.2, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('33333333-3333-3333-3333-333333333333', 'charlie@example.com', 'Charlie', 'https://picsum.photos/seed/charlie/200', 4.8, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

INSERT INTO categories (id, nom) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Roman'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Science-fiction'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Manga'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Développement'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'Histoire');

INSERT INTO articles (id, titre, description, published_at, user_id, image, exchanged, exchanged_at) VALUES
('44444444-4444-4444-4444-444444444441', 'Dune', 'Roman SF édition poche, bon état.', NOW() - INTERVAL '5 days', '11111111-1111-1111-1111-111111111111', 'https://picsum.photos/seed/dune-book/600', FALSE, NULL),
('44444444-4444-4444-4444-444444444442', 'Clean Code', 'Livre de développement avec quelques annotations au crayon.', NOW() - INTERVAL '3 days', '22222222-2222-2222-2222-222222222222', 'https://picsum.photos/seed/clean-code-book/600', FALSE, NULL),
('44444444-4444-4444-4444-444444444443', 'One Piece Tome 1', 'Manga en très bon état.', NOW() - INTERVAL '1 day', '33333333-3333-3333-3333-333333333333', 'https://picsum.photos/seed/manga-book/600', FALSE, NULL);

INSERT INTO article_categories (article_id, category_id) VALUES
('44444444-4444-4444-4444-444444444441', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'),
('44444444-4444-4444-4444-444444444442', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'),
('44444444-4444-4444-4444-444444444443', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3');
