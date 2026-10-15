# Frontend architecture

Next.js Server Components verify the backend session at every private page boundary. Authentication routes redirect signed-in users to onboarding or their workspace. Private data never depends on localStorage or a client-only route guard.

See accounts-and-preferences.md for the session gateway, onboarding contract, preferences and security flows. Providers own TanStack Query and next-themes. Google Sans is the default font and Poppins styles headings. The CSP proxy supplies a nonce and prevents framing.

Feature code lives in src/features/auth and src/features/preferences. Shared UI, form fields, tables, feedback, schema-validated API requests, safe redirects and exact money helpers remain reusable. Redis and Winston are Node-only; private responses are never cached. No sample financial modules are exposed.
