# Security policy

This application is pre-release. No production authentication or sensitive financial processing is implemented. Supported fixes target the current main branch.

Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/speckvue/speckvue-finance-web/security/advisories/new) when the repository owner has enabled it. If unavailable, ask the maintainers to enable a private reporting channel without posting exploit details in a public issue. A staffed contact address and response-time commitment have not been supplied; none is invented here.

Provide affected revision, reproduction steps, impact, and a proposed fix if available. Do not include personal financial data, tokens, passwords, or other secrets.

Production session verification must happen at page/data boundaries and in the NestJS backend. Use secure cookies, CSRF protection, explicit CORS origins and server-enforced permissions. The CSP, security headers and non-root Docker image are foundations, not substitutes for a deployment review.

Dependency audit results and unpatched development-tool findings are recorded in docs/verification.md and docs/alignui.md. GitHub CodeQL requires the repository's code-scanning entitlement to be enabled. Review and upgrade base images and dependencies regularly.
