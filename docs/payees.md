# Payees

The protected `/payees` page manages people, merchants and organizations. It uses real owned API records and starts empty. Desktop, tablet and mobile navigation include Payees.

Create/edit use a responsive dialog with a name, editable type and optional notes. Names normalize Unicode and whitespace; notes retain readable multiline text. Records can share a display name. Notes distinguish real entities with similar names, and duplicate records can be merged deliberately.

Search submits explicitly and supports name, notes and retained merged names. Active/Archived/Merged views and type filters use server queries. Pagination loads 50 records at a time, preserves filters, and deduplicates returned IDs. Results are newest first. The applied query remains visible, and failed searches retain the previously confirmed results. No private records are cached.

Archive requires confirmation and preserves the record. Restore retains its ID and saved details. Merged sources live in their own read-only view, including source notes and the surviving payee's current name. There are no delete or unmerge actions.

The merge dialog loads searchable/paginated active targets, excluding its source. A survivor must be selected and the irreversible-merge acknowledgement checked before confirming. It explains that the survivor keeps its own name, type and notes, while the source and prior merged names resolve to it. The server rechecks source, target, ownership and active status atomically. Archived sources can be merged into an active survivor.

All form controls and dismissal lock while saving or loading required merge choices. Circular indicators cover list, target-search, save, merge and post-save refresh requests. Failures preserve form drafts. A successful write followed by a failed refresh closes the form and explicitly reports that it was saved; Reload only refreshes results and never repeats the mutation. The dialog traps focus and restores it to the opener, or the Add button if the source row disappeared. Compact rows stack labels and actions; the fixed frame and inner-pane scrolling are preserved.

The same-origin gateway explicitly allows payee list/detail, create/update, archive/restore and merge paths. Existing session, Origin, CSRF and request limits apply. Zod validates drafts and API responses. Expired sessions redirect to signin. Initial loading and retryable errors have dedicated page states.

The sibling API repository's `docs/payees.md` defines merge identity preservation, concurrency, pagination and the future transaction-assignment/history guards. No transaction ledger or simulated usage records are added in this step.
