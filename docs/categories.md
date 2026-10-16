# Categories

The protected `/categories` page manages income and expense categories with one level of subcategories. It starts empty, uses actual owned API records, and is available from desktop, tablet and mobile navigation.

Create/edit use an accessible dialog with name, optional description, type, parent, six color choices, twelve icons and a live appearance preview. Changing the type while creating clears the parent; successful creation shows the correct income/expense view. Type is locked after creation. Roots with children cannot be nested. Renaming and moving categories preserve their identities.

The list keeps roots and children together in saved order. Up/down controls reorder only active siblings, with disabled boundary controls. Active/Archived and Expenses/Income filters work on the complete bounded collection. Reload explicitly refreshes the API snapshot. The 500-category limit includes archives and is shown in the page; creation controls disable at that limit.

Archive requires confirmation. Archiving a parent includes its active children and preserves their saved records. In Archived, children show their parent context; restoring a child is disabled until its parent is restored. Restoring a parent does not automatically restore children. There are no destructive category actions or fake transaction counts. Archived categories remain available for future historical transactions but cannot be assigned to new activity.

All form fields, selectors and dismissal controls lock during saving, with a circular spinner. The page controls lock during mutations or reloads. Errors preserve drafts and previous list data. Focus moves to the category name on opening and returns to the opener on close. Dialogs remain usable on compact screens; the existing fixed frame, inner-pane scrollbars, fonts, theme and profile navigation are preserved.

Zod validates inputs and API snapshots. All browser calls use the allowlisted same-origin gateway and existing Origin/CSRF/session protections. No private category data is cached. Expired sessions redirect to signin. Initial loading and retryable errors have dedicated route states.

The API's `docs/categories.md` in the sibling repository defines immutable classification, stable IDs, hierarchy, concurrency and future transaction ownership. The exported assignment guard will be wired into the manual-transactions module when it is built.
