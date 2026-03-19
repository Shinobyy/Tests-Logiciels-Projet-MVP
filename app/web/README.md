# Nom du projet : Leboncoin-like

Echanges de Articles.

Fonctionnalités:

- Authentification (users seed dans la db, **register/login**)
- Ajouter un Article à échanger
- Afficher les Articles disponibles
- Proposer un échange
- Accepter, refuser une proposition d'échange ou négocier (messagerie)

- Afficher les échanges en cours


## Données:

User:
    - id: uuid
    - email: string
    - pseudonym: string
    - avatar: string (url)
    - rating: number (moyenne des évaluations reçues >0 et <5)
    - password: string (hashé)

Article:
    - id: uuid
    - titre: string
    - description: string
    - published_at: Date
    - user_id: uuid
    - image: string (url)
    - exchanged: boolean
    - exchanged_at: Date (date de l'échange)

LienCategorie:
    - id: uuid
    - article_id: uuid
    - categorie_id: uuid

Categorie:
    - id: uuid
    - nom: string


----------------------------------------------------------------------------------------------------------------


Exchange:
    - id: uuid
    - proposer_id: uuid           # celui qui initie
    - accepter_id: uuid           # celui qui reçoit
    - proposer_articles: uuid[]   # articles offerts par le proposant
    - accepter_articles: uuid[]   # articles demandés à l'autre (peut changer lors négociation)
    - status: enum (pending, accepted, refused, negotiating)
    - updated_at: Date

Message:
    - id: uuid
    - exchange_id: uuid
    - user_id: uuid
    - type: enum (message, negotiation, accepted, refused)
    - content: string                       # commentaire texte
    - proposed_articles: uuid[] | null      # articles offerts par l'émetteur du message
    - requested_articles: uuid[] | null     # articles demandés à l'autre
    - is_read: boolean
    - created_at: Date





BASE_URL = "http://localhost:3000/api"
Endpoints:

### Auth
- POST /auth/register
    Body: { email, pseudonym, password }
    Response: { status: "success" }

- POST /auth/login
    Body: { email, password }
    Response: { status: "success", token: string, user: { id, email, pseudonym, avatar } }

### Users
- GET /users/:id/articles
    Response: {
        articles: [
            {
                id: uuid,
                titre: string,
                description: string,
                published_at: Date,
                categories: [string, ...],
                image: string
            }
        ]
    }

- GET /users/me/articles
    Response: {
        articles: [
            {
                id: uuid,
                titre: string,
                description: string,
                published_at: Date,
                categories: [string, ...],
                image: string
            }
        ]
    }

### Categories
- GET /categories
    Response: {
        categories: [
            { id: uuid, nom: string }
        ]
    }

### Articles
- GET /articles (?category=uuid)
    Response: {
        articles: [
            {
                id: uuid,
                titre: string,
                description: string,
                published_at: Date,
                categories: [string, ...],
                image: string,
                user: { id: uuid, pseudonym: string, avatar: string }
            }
        ]
    }

- POST /articles
    Body: { titre, description, categories: [uuid, ...], image }
    Response: { status: "success", article_id: uuid }

- GET /articles/:id
    Response: {
        article: {
            id: uuid,
            titre: string,
            description: string,
            published_at: Date,
            categories: [string, ...],
            image: string,
            exchanged: boolean,
            exchanged_at: Date | null,
            user: { id: uuid, pseudonym: string, avatar: string }
        }
    }

- PUT /articles/:id
    Body: { titre?, description?, categories?: [uuid, ...], image? }
    Response: { status: "success" }

- DELETE /articles/:id
    Response: { status: "success" }

### Exchanges
- POST /exchanges
    Body: {
        accepter_id: uuid,
        proposer_articles: [uuid, ...],
        accepter_articles: [uuid, ...],
        message: string
    }
    Response: { status: "success", exchange_id: uuid }

- GET /exchanges
    Response: {
        exchanges: [
            {
                id: uuid,
                proposer: { id: uuid, pseudonym: string, avatar: string },
                accepter: { id: uuid, pseudonym: string, avatar: string },
                proposer_articles: [uuid, ...],
                accepter_articles: [uuid, ...],
                status: "pending" | "accepted" | "refused" | "negotiating",
                updated_at: Date
            }
        ]
    }

- GET /exchanges/:id
    Response: {
        exchange: {
            id: uuid,
            proposer: { id: uuid, pseudonym: string, avatar: string },
            accepter: { id: uuid, pseudonym: string, avatar: string },
            proposer_articles: [uuid, ...],
            accepter_articles: [uuid, ...],
            status: "pending" | "accepted" | "refused" | "negotiating",
            updated_at: Date
        }
    }
<!-- 
- PUT /exchanges/:id
    Body: { status: "accepted" | "refused" | "negotiating" }
    Response: { status: "success" } -->

### Messages
- POST /messages
    Body: {
        exchange_id: uuid,
        type: "message" | "negotiation" | "accepted" | "refused",
        content: string,
        proposed_articles: [uuid, ...] | null,
        requested_articles: [uuid, ...] | null
    }
    Response: { status: "success", message: {
        id: uuid,
        exchange_id: uuid,
        user_id: uuid,
        type: "message" | "negotiation" | "accepted" | "refused",
        content: string,
        proposed_articles: [uuid, ...] | null,
        requested_articles: [uuid, ...] | null,
        is_read: boolean,
        created_at: Date
    }}

- GET /messages/:exchange_id
    Response: {
        messages: [
            {
                id: uuid,
                user: { id: uuid, pseudonym: string, avatar: string },
                type: "message" | "negotiation" | "accepted" | "refused",
                content: string,
                proposed_articles: [uuid, ...] | null,
                requested_articles: [uuid, ...] | null,
                is_read: boolean,
                created_at: Date
            }
        ]
    }

- PUT /messages/:id
    Body: { is_read: true }
    Response: { status: "success" }

### Negotiation
- POST /negotiations
    Body: {
        exchange_id: uuid,
        proposed_articles: [uuid, ...],
        requested_articles: [uuid, ...],
        content: string
    }
    Response: { status: "success", message: {
        id: uuid,
        exchange_id: uuid,
        user_id: uuid,
        type: "negotiation",
        content: string,
        proposed_articles: [uuid, ...],
        requested_articles: [uuid, ...],
        is_read: boolean,
        created_at: Date
    } }