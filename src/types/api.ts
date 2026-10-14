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
