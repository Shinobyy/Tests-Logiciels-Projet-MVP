# Changelog

All notable changes by feature area, based on the commit history.

## Added
- Backend foundation: domain entities, repositories, migrations
- JWT authentication endpoints
- Categories and articles endpoints
- Negotiation and messaging workflows
- API documentation (OpenAPI/Swagger)
- Frontend Next.js app and UI structure
- Mock database and seed data for demo/testing
- API integration for auth, articles, categories, exchanges, messages, negotiations
- CQRS-like client services for negotiation commands/queries and unit tests
- Docker support for frontend
- CI workflow for lint/tests/coverage/e2e

## Modified
- Switched frontend from mock data to real API calls
- Refined article and exchange flows (edit/delete/propose)
- Improved exchanges page with negotiation queries
- Updated CORS and DB port settings in API

## Disabled / Deferred
- Mock-only mode as default data source (replaced by API calls)
- Any advanced non-MVP features (ratings workflow, notifications, admin)

## Notes
This changelog is a functional summary; for exact commit details, refer to Git history.
