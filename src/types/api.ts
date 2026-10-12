/**
 * @fileoverview Defines paginated response and list request types.
 *
 * Provides consistent transport shapes for future backend integration.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

// Frontend conventions only. Map the real NestJS contract at the integration boundary.
export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ListParams = {
  page: number;
  pageSize: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
};

// ---------------------------------------------------------------------------
