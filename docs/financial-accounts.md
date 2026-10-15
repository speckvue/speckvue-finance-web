# Financial accounts and workspace

The protected `/accounts` page supports creating and editing bank, cash, credit card, investment, loan, and other accounts, plus archiving and restoring them. Each account has its own currency, opening balance, and opening balance date. Accounts are manual; adding one does not connect to a bank. Amounts owed are entered as negative balances.

The browser sends exact decimal strings through the allowlisted same-origin gateway. The backend enforces ownership, validation, Origin, and CSRF. Account DTOs are validated with Zod before rendering. The gateway preserves status filters and pagination cursors. Lists offer active/archived filters and load-more pagination. Archives are confirmed inline; account data is kept and can be restored. Archived accounts are restored before editing.

Forms show circular loading indicators and disable their inputs, selectors, and buttons while saving. Failures preserve the draft. Lists show loading feedback during filter and pagination requests. The page provides an initial loading state and a retryable error boundary. Expired sessions redirect to signin. No financial data is cached.

Opening balances are formatted with Intl parts and BigInt integer values, preserving fractional precision even for large amounts. Different currencies remain separate. These are starting balances, not transaction-derived current balances or converted net worth. Transaction tracking is the next module.

The signed-in shell fills the viewport edge to edge. Desktop keeps the header and side navigation stationary while the main content scrolls. Tablet navigation becomes a compact icon-and-label rail. Mobile uses normal page scrolling and a modal navigation drawer with focus trapping, Escape dismissal, automatic closure after navigation, and focus restoration. Links indicate the active page. A keyboard skip link reaches the main content.

The existing `@radix-ui/react-scroll-area` dependency supplies draggable, slim scrollbars for the desktop content and sidebar. Tracks appear when content overflows and follow the current theme. Focusable scroll viewports preserve keyboard scrolling; mobile retains native page scrolling.

The profile selector stays in a fixed footer below the sidebar scroll area, and at the bottom of the mobile drawer. Its dropdown contains Settings and Signout. The top bar has no signout or theme selector. Appearance is selected in Settings and applied only after the account preference saves successfully. Currency and timezone options are generated once on the server and passed to the forms, avoiding hydration differences between Node and browser Intl registries.

Overview uses real saved accounts and profile preferences. Empty accounts show setup guidance. The visual system uses neutral gray surfaces, white panels, lime accents, Google Sans body text, Poppins headings, supplied light/dark logos, and next-themes appearance management.

Unit tests cover exact formatting, amount/date validation, form locking and failure recovery, archive confirmation/restoration, and gateway filter forwarding. Connected Playwright checks in `e2e/accounts.spec.ts` run with the disposable API browser runner documented in `accounts-and-preferences.md`.
