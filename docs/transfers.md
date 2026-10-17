# Transfers

The protected `/transfers` page records linked transfers between two owned active accounts, with posted/deleted views, account filters and pagination. Account details link to its filtered view. Creating, editing, deleting and inspecting history use responsive dialogs within the existing stationary application shell.

Enter principal amounts in each account's own currency. Same-currency amounts stay equal and the rate is fixed at 1. For different currencies, enter the received amount or a rate to calculate it. BigInt arithmetic applies exact half-up rounding at the destination currency precision. The API saves the effective rate derived from actual amounts, rounded to 30 decimal places; it does not fetch market quotes. Principal amounts remain separate from income and spending.

A separate fee can be charged to the source, destination or another active account and optionally assigned an expense category. The fee is an additional charge; the preview shows its effect on source/destination balances and identifies its charged account and currency. Enter principal before any separately recorded fee; never enter a net amount and deduct that same fee again. Fee references clear when the fee becomes zero.

All form items and dismissal controls lock during submission or account-choice loading, with circular progress. Account choices support load-more pagination. Client validation checks account distinction, exact currency precision, dates and notes; the API remains authoritative. The browser sends only writable fields, a stable create key or expected edit revision. Uncertain retries retain the key. Confirmed saves with failed list refresh close the form and offer a list reload, preventing duplicate financial submissions.

Delete confirmation explains that both principal movements and the fee reverse together. Deleted transfers are read-only and retain paginated revision history with the original account links, amounts, rate and fee. Archived involved accounts must be restored before editing or deleting. Existing archived fee-category references may be retained. Foreign or missing account filters share a not-found page.

Accounts and Overview show balances derived from manual postings and transfers. Opening fields remain locked by all prior history, even after transfers are deleted or moved to other accounts. Actual currency amounts are never combined into a converted total. Fonts, theme controls, fixed header/sidebar, mobile drawer, accessibility and inner-pane scrolling follow the existing product design.
