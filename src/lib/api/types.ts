/** Shared list query + envelope types matching org-service `httppage` meta. */

export const LIST_PAGE_SIZE_DEFAULT = 20;
export const LIST_PAGE_SIZE_MAX = 100;
export const LIST_PAGE_SIZE_OPTIONS = [10, 20] as const;
export const LIST_DROPDOWN_PAGE_SIZE = LIST_PAGE_SIZE_MAX;

export type PageMeta = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type Paged<T> = {
  items: T[];
  meta: PageMeta;
};

export type ListQuery = {
  page?: number;
  page_size?: number;
  q?: string;
  status?: string;
};

export const EMPTY_PAGE_META: PageMeta = {
  page: 1,
  page_size: LIST_PAGE_SIZE_DEFAULT,
  total: 0,
  total_pages: 0,
};
