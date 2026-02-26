# LebonExchange (Backend API)

Backend Spring Boot pour une plateforme d'echange de livres (API compatible avec le contrat `articles/exchanges/messages` du projet).

## Stack

- Java 21 (Java 17 possible avec adaptation mineure du `pom.xml`)
- Spring Boot 3.x
- Spring Web / JPA / Security (JWT)
- PostgreSQL (runtime)
- H2 (tests)
- Flyway
- JUnit 5 / Mockito / MockMvc

## Structure (API)

Code backend dans `app/api`.

Packages principaux:

- `controller/` REST API
- `dto/request` et `dto/response`
- `domain/bo` et `domain/service`
- `entity/`
- `repository/`
- `mapper/`
- `security/`
- `exception/`
- `config/`
- `tests/unit` et `tests/integration` (dans `src/test/java`)

## Prerequisites

- Docker + Docker Compose
- Java 21+
- Maven 3.9+

## 1) Demarrer la base PostgreSQL (Docker)

Copier `.env.example` vers `.env` puis adapter les valeurs si besoin.

```bash
docker compose up -d postgres
```

Verification:

```bash
docker compose ps
```

## 2) Lancer l'API

Depuis `app/api`:

```bash
mvn spring-boot:run
```

L'API sera disponible sur:

- `http://localhost:8080/api`

Flyway applique automatiquement:

- `V1__init_schema.sql`
- `V2__seed_data.sql` (seed utilisateurs, categories de livres, exemples de livres)

## 3) Tests

Depuis `app/api`:

```bash
mvn test
```

Pour rapport JaCoCo:

```bash
mvn verify
```

## Auth rapide (seed)

Des utilisateurs seed sont presentes. Les mots de passe seed doivent etre remplaces en environnement reel.

Exemples d'emails:

- `alice@example.com`
- `bob@example.com`
- `charlie@example.com`

## Endpoints (base `/api`)

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/:id/articles`
- `GET /users/me/articles`
- `GET /categories`
- `GET /articles`
- `POST /articles`
- `GET /articles/:id`
- `PUT /articles/:id`
- `DELETE /articles/:id`
- `POST /exchanges`
- `GET /exchanges`
- `GET /exchanges/:id`
- `POST /messages`
- `GET /messages/:exchange_id`
- `PUT /messages/:id`
- `POST /negotiations`

## Notes

- Les routes protegees utilisent `Authorization: Bearer <jwt>`.
- Les transitions d'echange (`negotiating`, `accepted`, `refused`) sont pilotees par `MessageService` / `NegotiationService`.
- En cas de `accepted`, les livres references sont marques `exchanged=true`.
