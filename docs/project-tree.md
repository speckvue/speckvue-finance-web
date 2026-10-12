# Project source tree

Generated from the source files included in the initial scaffold. Local configuration, installed dependencies, build output, and verification artifacts are excluded.

```text
speckvue-finance-web/
├── .dockerignore
├── .editorconfig
├── .env.example
├── .eslintignore
├── .gitattributes
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── codeql.yml
│       ├── docker.yml
│       └── release.yml
├── .gitignore
├── .husky/
│   ├── commit-msg
│   └── pre-commit
├── .npmrc
├── .prettierignore
├── .prettierrc
├── .releaserc.json
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── Dockerfile
├── LICENSE
├── README.md
├── SECURITY.md
├── THIRD_PARTY_LICENSES.txt
├── THIRD_PARTY_NOTICES.md
├── commitlint.config.mjs
├── docker-compose.prod.yml
├── docker-compose.yml
├── docs/
│   ├── alignui-inventory.json
│   ├── alignui.md
│   ├── architecture.md
│   ├── conventions.md
│   ├── docker.md
│   ├── project-tree.md
│   ├── releases.md
│   └── verification.md
├── e2e/
│   ├── accessibility.spec.ts
│   └── smoke.spec.ts
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── scripts/
│   ├── check-source-style.ts
│   ├── collect-licenses.ts
│   ├── commit.ts
│   ├── docker.ts
│   ├── healthcheck.ts
│   ├── list-source-files.ts
│   ├── load-env.ts
│   ├── prepare-standalone.ts
│   ├── release.ts
│   └── run-app.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx
│   │   │   └── sign-up/
│   │   │       └── page.tsx
│   │   ├── (legal)/
│   │   │   ├── cookie-policy/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── privacy-policy/
│   │   │   │   └── page.tsx
│   │   │   └── terms-of-service/
│   │   │       └── page.tsx
│   │   ├── (main)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── icon.svg
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx
│   │   └── robots.ts
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── app-shell.tsx
│   │   │   └── navigation.tsx
│   │   ├── shared/
│   │   │   ├── access-state.tsx
│   │   │   ├── brand.tsx
│   │   │   ├── data-table.test.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── demo-notice.tsx
│   │   │   ├── feedback.test.tsx
│   │   │   ├── feedback.tsx
│   │   │   ├── form-field.tsx
│   │   │   ├── legal-placeholder.tsx
│   │   │   ├── text-field.tsx
│   │   │   └── theme-switcher.tsx
│   │   └── ui/
│   │       ├── accordion.tsx
│   │       ├── alert.tsx
│   │       ├── avatar-empty-icons.tsx
│   │       ├── avatar-group-compact.tsx
│   │       ├── avatar-group.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── banner.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button-group.tsx
│   │       ├── button.tsx
│   │       ├── checkbox.tsx
│   │       ├── color-picker.tsx
│   │       ├── command-menu.tsx
│   │       ├── compact-button.tsx
│   │       ├── datepicker.tsx
│   │       ├── digit-input.tsx
│   │       ├── divider.tsx
│   │       ├── dot-stepper.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown.tsx
│   │       ├── fancy-button.tsx
│   │       ├── file-format-icon.tsx
│   │       ├── file-upload.tsx
│   │       ├── hint.tsx
│   │       ├── horizontal-stepper.tsx
│   │       ├── input.tsx
│   │       ├── kbd.tsx
│   │       ├── label.tsx
│   │       ├── link-button.tsx
│   │       ├── modal.tsx
│   │       ├── notification.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress-bar.tsx
│   │       ├── progress-circle.tsx
│   │       ├── radio.tsx
│   │       ├── rating.tsx
│   │       ├── segmented-control.tsx
│   │       ├── select.tsx
│   │       ├── slider.tsx
│   │       ├── status-badge.tsx
│   │       ├── switch.tsx
│   │       ├── tab-menu-horizontal.tsx
│   │       ├── tab-menu-vertical.tsx
│   │       ├── table.tsx
│   │       ├── tag.tsx
│   │       ├── textarea.tsx
│   │       ├── toast-alert.tsx
│   │       ├── toast.tsx
│   │       ├── tooltip.tsx
│   │       └── vertical-stepper.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   └── components/
│   │   │       ├── auth-form.test.tsx
│   │   │       └── auth-form.tsx
│   │   └── dashboard/
│   │       ├── components/
│   │       │   ├── dashboard.tsx
│   │       │   └── transaction-table.tsx
│   │       ├── data/
│   │       │   ├── demo-query-options.ts
│   │       │   └── transactions.ts
│   │       └── hooks/
│   │           ├── use-demo-transactions.ts
│   │           └── use-reset-demo.ts
│   ├── hooks/
│   │   └── use-tab-observer.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── api-error.ts
│   │   │   ├── client.test.ts
│   │   │   └── client.ts
│   │   ├── auth/
│   │   │   ├── require-session.ts
│   │   │   └── session.ts
│   │   ├── config/
│   │   │   ├── public-env.test.ts
│   │   │   ├── public-env.ts
│   │   │   └── server-env.ts
│   │   ├── constants/
│   │   │   └── table-features.ts
│   │   ├── providers/
│   │   │   └── app-providers.tsx
│   │   ├── query/
│   │   │   ├── client.ts
│   │   │   └── keys.ts
│   │   ├── security/
│   │   │   ├── safe-redirect.test.ts
│   │   │   └── safe-redirect.ts
│   │   ├── theme/
│   │   │   └── next-theme.ts
│   │   ├── utils/
│   │   │   ├── add-money.ts
│   │   │   ├── currency-digits.ts
│   │   │   ├── date.ts
│   │   │   ├── format-percent.ts
│   │   │   ├── money.test.ts
│   │   │   ├── money.ts
│   │   │   ├── noop-subscribe.ts
│   │   │   └── parse-money.ts
│   │   └── validations/
│   │       ├── auth.test.ts
│   │       └── auth.ts
│   ├── proxy.ts
│   ├── stores/
│   │   └── shell-store.ts
│   ├── styles/
│   │   └── globals.css
│   ├── test/
│   │   ├── mocks/
│   │   │   └── server.ts
│   │   └── setup.ts
│   ├── types/
│   │   ├── api.ts
│   │   └── money.ts
│   └── utils/
│       ├── cn.ts
│       ├── polymorphic.ts
│       ├── recursive-clone-children.ts
│       └── tv.ts
├── templates/
│   └── document.md
├── tsconfig.json
└── vitest.config.ts
```
