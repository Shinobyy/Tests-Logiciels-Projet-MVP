# MVP Scope

## Objective
Deliver a functional book exchange prototype with authentication, listing, and negotiation flow.

## In-scope (MVP)
- Authentication: register/login with JWT
- Browse articles and view article details
- Create, edit, delete own articles
- Propose an exchange
- View ongoing exchanges
- Send messages and negotiation proposals
- Accept or refuse an exchange

## Out-of-scope (MVP)
- Advanced search (multi-criteria, sorting, pagination)
- Notifications (email/push)
- Ratings or reviews workflow
- Admin backoffice
- Real-time chat (websocket)
- Payments or delivery workflow

## Assumptions
- API-first architecture with a single frontend client
- Negotiation is message-based, not real-time
- Data seeded for demo and tests
