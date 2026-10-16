import type { PayeeFilters } from './contracts';

/** Carries identical filters through search, pagination and merge-target selection. */
const payeesPath = (
  filters: PayeeFilters,
  after?: string | null,
  excludeId?: string,
) => {
  const query = new URLSearchParams({ status: filters.status });
  if (filters.kind !== 'all') query.set('kind', filters.kind);
  if (filters.q.trim()) query.set('q', filters.q.trim());
  if (after) query.set('after', after);
  if (excludeId) query.set('excludeId', excludeId);
  return '/payees?' + query.toString();
};
export default payeesPath;
