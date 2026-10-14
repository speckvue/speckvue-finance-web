# Frontend architecture

The application exposes a minimal root page and GET /api/health. Error, loading and not-found boundaries remain. Demo route groups, dashboard data, simulated auth, legal placeholders and backend-status sample endpoint have been removed.

Server Components are the default. Interactive components use explicit client boundaries. The root provider owns TanStack Query and next-themes. Google Sans is the default font and Poppins styles headings. The CSP proxy supplies a nonce to the theme provider and prevents framing.

Reusable UI, form fields, tables, feedback, API client, Zod validation, safe redirect and money utilities remain. Test-only HTTP mocking has no production handlers. Add real features under src/features when needed. Add a verified server-side session adapter before implementing protected pages; enforce authorization at every private data boundary.

Redis and Winston live exclusively in Node server modules. The readiness endpoint checks Redis without exposing credentials. The public-data cache helper is available for explicit future integration; it is not attached to a sample endpoint. All settings come from .env, with public build-time settings separated from server credentials.
