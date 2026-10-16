# Manual transactions

The protected `/transactions` page records income, expenses and refunds. It offers account filtering, posted/deleted views, pagination, revision history, and create/edit/delete dialogs. Account details link to `/transactions?accountId=UUID`. Missing or foreign account filters return a not-found page.

Create/edit dialogs select account, type, date, optional payee and notes, and 1–20 category allocation lines. Amounts are positive exact decimal strings. Income adds to the balance; expenses subtract; refunds add while retaining expense classification. Leave categories unassigned explicitly when needed. Split amounts must sum exactly to the total. Each account uses its own currency precision. Account and payee choices support pagination; payees also support search. Editing permits same-currency account moves.

All form controls and dialog dismissal lock during saving or choice loading. Circular progress appears for pending operations. A failed save preserves the draft and create request key for safe retries. The interface distinguishes an unconfirmed write from a confirmed save followed by a refresh failure, preventing accidental duplicate posting. Concurrent changes require reloading the latest revision.

Deletion requires confirmation, reverses the balance effect and retains the entry under Deleted transactions. History shows dated create/edit/delete snapshots, original labels and category amounts, with pagination for older revisions. Deleted entries are read-only. Archived accounts must be restored before modifying transactions. Existing archived category/payee references may be retained when editing; new selections must be active.

Accounts, account details and Overview now show transaction-derived current balances. Account opening balance/date become read-only after any transaction history, even when entries are deleted or moved to another account. Opening amounts remain visible in account details and never count as income. No currency conversion or mixed-currency total is implied.

The existing neutral/lime visual system, Google Sans/Poppins fonts, next-themes and stationary responsive shell are preserved. Only the inner main pane scrolls. No SMTP, demo financial records, transfer or reconciliation workflows are introduced.

The API owns financial rules and performs Decimal arithmetic inside owner-locked database transactions. Frontend validation uses BigInt scaled amounts and the API currency/date snapshot. See the sibling API's `docs/manual-transactions.md` for exact contracts, ownership and idempotency rules.
